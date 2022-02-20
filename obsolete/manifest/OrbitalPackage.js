import {
    getId,
    getPackageName,
    normalize,
    validateContributionFile,
    validateContributionSyntax
} from './util';
import FlagSupport from '../framework/bases/FlagSupport';
import ExportsRegistry from '../framework/resolution/ExportsRegistry';
import {logger, nodeReq, objectify} from '../util';
import merge from 'lodash.merge';

const STOPPED = 1;
const STOPPED_BY_DEPENDENCY = 1 << 1;
const INACTIVE = 1 << 2;
const INACTIVE_BY_DEPENDENCY = 1 << 3;
const INVALID_MODULE = 1 << 4;
const CONTRIBUTION_SYNTAX_ERROR = 1 << 5;
const MODULE_NOT_FOUND = 1 << 6;

/**
 * dependencies : Array of <OrbitalPackage> created from depMap.
 *      dependencies should be synchronized with depMap after init().
 *      In common <OrbitalPackageRegistry>.add(node), update(node)
 *      calls validatePackages() then synchronizes depMap to dependencies
 *      and removes orphan dependencies too.
 * depMap : Map of manifest's resolved npm dependencies.
 * depList : List version of depMap. (for convenience)
 */
class OrbitalPackage extends FlagSupport {

    constructor(node) {
        super();
        this.init(node);
    }

    init(node, isUpdate) {
        logger.log(getId(node) + ' initializing ...');
        this.node = node;
        this.dependencies = []; // [<OrbitalPackage>somePack, ...]
        this.meta = normalize(node.package);
        this.depMap = {}; // {abc: '1.2.3', ...}
        this.depList = []; // ['abc@1.2.3', ...]
        this.exports = {
            ids: [],
            paths: []
        };
        this.errorReasons = {};
        this.initFlags();
        this.createDepCache();
        this.exportModules();
        this.requireModules(!!isUpdate);
    }

    /**
     * @param {OrbitalPackage} pack
     */
    addDependency(toAdd) {
        if (!toAdd) {
            return;
        }
        if (!this.dependencyExists(toAdd)) {
            this.dependencies.push(toAdd);
        }
    }

    removeDependency(toRemove) {
        const dependencies = this.dependencies;
        if (this.dependencyExists(toRemove)) {
            dependencies.splice(dependencies.indexOf(toRemove), 1);
            this.depList.splice(dependencies.indexOf(toRemove.getId()), 1);
            Reflect.deleteProperty(this.depMap, toRemove.getName());
        }
    }

    /**
     * Create {name: version} map & list
     * for dependencies of this package.
     * For example, if this package requires
     * acme.main@0.1.0 and acme.other@1.2.3
     * depMap = {acme.main: '0.1.0', acme.other: '1.2.3'}
     * depList = ['acme.main@0.1.0', 'acme.other@1.2.3']
     */
    createDepCache() {
        Reflect.ownKeys(this.meta.dependencies).forEach((depName) => {
            const dep = this.getDependency(depName);
            if (dep) {
                const depMeta = dep.package;
                this.depMap[depMeta.name] = depMeta.version;
                this.depList.push(depMeta.name + '@' + depMeta.version);
            }
        });
    }

    dependencyExists(pack) {
        return this.dependencies.indexOf(pack) > -1;
    }

    exportModules() {
        logger.log(this.getId() + ' exporting modules ...');
        this.exportActivator();
        this.exportServiceContributions();
        this.exportExtensionContributions();
    }

    exportActivator() {
        const exports = this.exports;
        const activator = this.meta.orbital.activator;
        if (activator) {
            const path = nodeReq('path');
            const realizedPath = path.join(this.getBaseDir(), activator);
            try {
                validateContributionFile(realizedPath);
                exports.ids.push('Activator');
                exports.paths.push(realizedPath);
            } catch (e) {
                this.handleError('activator', e, 'MODULE_NOT_FOUND');
            }
        }
    }

    exportServiceContributions() {
        this.meta.orbital.contributes.services.forEach((service, index) => {
            this.exportValidContributionModule(service, 'service', index);
        });
    }

    exportExtensionContributions() {
        this.meta.orbital.contributes.extensions.forEach((extension, index) => {
            this.exportValidContributionModule(extension, 'extension', index);
        });
    }

    exportValidContributionModule(contribution, type, index) {
        try {
            validateContributionSyntax(contribution, type);
            this.exportContributionModule(contribution, type, index);
        } catch (e) {
            this.handleError(type, e, 'CONTRIBUTION_SYNTAX_ERROR');
        }
    }

    exportContributionModule(contribution, type, index) {
        const contributionId = contribution.id;
        const path = nodeReq('path');
        const exports = this.exports;
        const basedir = this.getBaseDir();
        const realizedPath = path.join(basedir, contribution.realize);
        try {
            validateContributionFile(realizedPath);
        } catch (e) {
            this.handleError(type, e, 'MODULE_NOT_FOUND');
            return;
        }
        const specProviderName = getPackageName(contributionId);
        const specProviderVersion = this.depMap[specProviderName];
        const uniqId = 'contributes/' + type + 's'
            + '/' + specProviderName
            + '/' + specProviderVersion
            + '/' + contributionId
            + '/' + index;
        exports.ids.push(uniqId);
        exports.paths.push(realizedPath);
    }

    getBaseDir() {
        return this.node.realpath;
    }

    /**
     * Find rpt node with depName,
     * walking from this node's children to the root.
     * @param {string} depName
     */
    getDependency(depName) {
        let mod = this.node;
        let dependency;
        while (mod) {
            const isExists = mod.children.some((child) => {
                if (child.package.name === depName) {
                    dependency = child;
                    return true;
                }
            });
            if (isExists) {
                return dependency;
            }
            mod = mod.parent;
        }
        return null;
    }

    getErrorReason() {
        const {FLAGS} = OrbitalPackage;
        const reasons = [];
        Reflect.ownKeys(FLAGS).forEach((KEY) => {
            const bit = FLAGS[KEY];
            if (this.getFlag(bit)) {
                let reason = this.getReadableFlag(KEY);
                if (this.errorReasons[bit]) {
                    reason += ` (${this.errorReasons[bit]})`;
                }
                reasons.push(reason);
            }
        });
        return reasons.join(', ');
    }

    getErrorState() {
        return this._flags;
    }

    getErrorString() {
        const chalk = nodeReq('chalk');
        const magenta = chalk.magenta.bold;
        const yellow = chalk.yellow.bold;
        if (this.getFlag(STOPPED)) {
            return magenta('(stopped)');
        } else if (this.getFlag(STOPPED_BY_DEPENDENCY)) {
            return magenta('(stopped by dependency)');
        } else if (this.getFlag(INACTIVE)) {
            return yellow('(inactive)');
        } else if (this.getFlag(INACTIVE_BY_DEPENDENCY)) {
            return yellow('(inactive by dependency)');
        } else if (this.getFlag(INVALID_MODULE)) {
            return yellow('(invalid module)');
        } else if (this.getFlag(CONTRIBUTION_SYNTAX_ERROR)) {
            return yellow('(contribution syntax error)');
        } else if (this.getFlag(MODULE_NOT_FOUND)) {
            return yellow('(module not found)');
        }
        return '';
    }

    getId() {
        const meta = this.meta;
        return meta.name + '@' + meta.version;
    }

    /**
     * @return {Object}
     */
    getManifest() {
        const meta = this.meta;
        const node = this.node;
        const orb = meta.orbital;
        const dependencies = {};
        this.dependencies.forEach((depPack) => {
            const depMeta = depPack.meta;
            dependencies[depMeta.name] = depMeta.version;
        });
        return {
            name: meta.name,
            version: meta.version,
            path: node.path.replace(/\\/g, '/'),
            description: meta.description,
            license: meta.license || '',
            policies: orb.policies,
            activator: orb.activator,
            contributable: orb.contributable,
            contributes: orb.contributes,
            parent: getId(node.parent),
            state: this._flags,
            errorReason: this.getErrorReason(),
            dependencies
        };
    }

    getName() {
        return this.meta.name;
    }

    getReadableFlag(key) {
        return key.toLowerCase().replace(/_/g, ' ');
    }

    getVersion() {
        return this.meta.version;
    }

    handleError(context, e, defaultType) {
        const nl = '\n          ';
        const {FLAGS} = OrbitalPackage;
        const key = e.type || defaultType;
        this.setFlag(FLAGS[key], true, e.message);
        logger.warn(this.getId() + "'s "
            + context + ' contribution rejected.' + nl
            + `Reason: ${this.getReadableFlag(key)} (${e.message})`);
    }

    initFlags() {
        this.resetFlags();
        const state = this.meta.orbital.state;
        if (state === 'inactive') {
            this.setFlag(INACTIVE, true);
        } else if (state === 'stopped') {
            this.setFlag(STOPPED, true);
        }
    }

    isLessOrEqualState(state) {
        return this.getBitMask() <= state;
    }

    reloadModules() {
        this.exports.paths.forEach((path) => {
            delete require.cache[require.resolve(path)];
        });
    }

    setFlag(flag, value, message = null) {
        super.setFlag(flag, value);
        this.errorReasons[flag] = message;
    }

    requireModules(isUpdate) {
        const meta = this.meta;
        if (meta.orbital.target !== 'node') {
            return;
        }
        let isError = false;
        const obj = {};
        const ids = this.exports.ids;
        const paths = this.exports.paths;
        if (isUpdate) {
            this.reloadModules();
        }
        ids.forEach((id, i) => {
            try {
                merge(obj, objectify(id, nodeReq(paths[i])));
            } catch (e) {
                isError = true;
                e.message += ` (${paths[i]})`;
                this.handleError('module', e, 'INVALID_MODULE');
            }
        });
        if (!isError) {
            if (isUpdate) {
                ExportsRegistry.update(meta.name, meta.version, obj);
            } else {
                ExportsRegistry.register(meta.name, meta.version, obj);
            }
        }
    }

    requireModulesAsync() {

    }

    requires(pack) {
        return this.depList.indexOf(pack.getId()) > -1;
    }

    removeModules() {
        const meta = this.meta;
        ExportsRegistry.unregister(meta.name, meta.version);
    }

    toString() {
        return '<OrbitalPackage>' + this.getId();
    }
}

OrbitalPackage.FLAGS = {
    STOPPED,
    STOPPED_BY_DEPENDENCY,
    INACTIVE,
    INACTIVE_BY_DEPENDENCY,
    INVALID_MODULE,
    CONTRIBUTION_SYNTAX_ERROR,
    MODULE_NOT_FOUND
};

export default OrbitalPackage;
