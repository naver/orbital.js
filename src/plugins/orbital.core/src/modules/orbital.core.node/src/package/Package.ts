import chalk from 'chalk';
import {
    AbstractPackage,
    forEachEnum,
    pkg,
    SerializableManifest
} from 'orbital.core.common';
import {
    ContributionGroupKey,
    ContributionRole,
    IContributableDefinition,
    IContributingDefinition,
    IKeyString,
    IOrbitalPackageForNode,
    IPackageNode,
    ISerializableManifest,
    IServiceClosure,
    PackageState
} from 'orbital.core.types';
import * as path from 'path';
import {
    getId,
    validateContributableFields,
    validateContributableIdDefinition,
    validateContributingFile,
    validateContributionFields,
    validateContributionId,
    validateTarget
} from './util';

const magenta = chalk.magenta.bold;
const yellow = chalk.yellow.bold;

function getChildNodeByName(node: IPackageNode, name: string): IPackageNode | null {
    let dependency = null;
    node.children.some((child) => {
        if (child.package.name === name) {
            dependency = child;
            return true;
        }
        return false;
    });
    return dependency;
}

/*
 * dependencies : Array of <Package> created from depStringMap.
 *     dependencies should be synchronized with depStringMap after init().
 *     <IPackageRegistry>.addPackage(IOrbitalPackage), updatePackage(IOrbitalPackage)
 *     calls validatePackages() then synchronizes depStringMap_ to dependencies
 *     and removes orphan dependencies too.
 * depStringList_ : List version of depStringMap. (for convenience)
 * depStringMap_ : Map of manifest's resolved npm dependencies.
 */
class Package extends AbstractPackage implements IOrbitalPackageForNode {

    private _node!: IPackageNode;

    constructor(node: IPackageNode, logger: IServiceClosure) {
        super(logger);
        this.initPackageNode(node);
    }

    getErrorString() {
        const msg = super.getErrorString();
        if (this.getFlag(PackageState.STOPPED
                | PackageState.STOPPED_BY_DEPENDENCY)) {
            return magenta(msg);
        }
        return yellow(msg);
    }

    getManifest(): ISerializableManifest {
        const meta = this.packageJson;
        const node = this._node;
        const depNameVersionMap: IKeyString = {};
        this.dependencies.forEach((depPack) => {
            const depMeta = depPack.packageJson;
            depNameVersionMap[depMeta.name] = depMeta.version;
        });
        return new SerializableManifest(meta, {
            depNameVersionMap,
            errorReasons: this.getErrorReasons_(),
            parent: getId(node.parent),
            path: node.path.replace(/\\/g, '/'),
            state: this.getBitMask()
        });
    }

    initPackageNode(node: IPackageNode) {
        this._node = node;
        super.init(pkg.normalizeOrbitalPackageJson(node.package));
        this._validateDefinition();
    }

    protected createDepCache_() {
        Reflect.ownKeys(this.packageJson.dependencies).forEach((depName) => {
            const dep = this._getDependency(depName as string);
            if (dep && dep.package && dep.package.orbital) {
                const depMeta = dep.package;
                this.depStringMap_[depMeta.name] = depMeta.version;
                this.depStringList_.push(pkg.getPackageId(depMeta));
            }
        });
    }

    protected initFlags_() {
        super.initFlags_();
        const {state} = this.packageJson.orbital;
        if (state === 'inactive') {
            this.setFlag(PackageState.INACTIVE, true);
        } else if (state === 'stopped') {
            this.setFlag(PackageState.STOPPED, true);
        }
    }

    private _forEachContributionGroupKey(iteratee: (groupKey: ContributionGroupKey) => void) {
        forEachEnum(ContributionGroupKey, (val) => {
            iteratee(val as ContributionGroupKey);
        });
    }

    private _getBaseDir(): string {
        return this._node.realpath;
    }

    /**
     * Find rpt node with depName,
     * walking from this node's children to the root.
     * @param {string} depName
     */
    private _getDependency(depName: string) {
        let mod = this._node;
        while (mod) {
            const dependency = getChildNodeByName(mod, depName);
            if (dependency) {
                return dependency;
            }
            mod = mod.parent;
        }
        return null;
    }

    private _validateActivator() {
        const {activator} = this.packageJson.orbital;
        if (activator) {
            const realizedPath = path.join(this._getBaseDir(), activator);
            try {
                validateContributingFile(realizedPath);
            } catch (e) {
                this.handleError_('activator', e, PackageState.MODULE_NOT_FOUND);
            }
        }
    }

    private _validateContributable() {
        const {contributable} = this.packageJson.orbital;
        this._forEachContributionGroupKey((groupKey) => {
            (contributable[groupKey] as IContributableDefinition[])
                .forEach((definition) => {
                    this._validateContributableDefinition(definition, groupKey);
                });
        });
    }

    private _validateContributableDefinition(
            definition: IContributableDefinition, groupKey: ContributionGroupKey) {
        try {
            validateContributionId(this, ContributionRole.CONTRIBUTABLE, groupKey, definition);
            validateContributableIdDefinition(this, definition, groupKey);
            validateContributableFields(this, definition, groupKey);
        } catch (e) {
            if (e.type) {
                this.handleError_(groupKey, e, e.type);
            } else {
                this.handleError_(groupKey, e, PackageState.UNKNOWN_ERROR);
            }
        }
    }

    private _validateContributes() {
        const {contributes} = this.packageJson.orbital;
        this._forEachContributionGroupKey((groupKey) => {
            (contributes[groupKey] as IContributingDefinition[])
                .forEach((definition) => {
                    this._validateContributesDefinition(definition, groupKey);
                });
        });
    }

    private _validateContributesDefinition(
            contribution: IContributingDefinition, groupKey: ContributionGroupKey) {
        try {
            const basedir = this._getBaseDir();
            const realizedPath = path.join(basedir, contribution.realize);
            validateContributionId(this, ContributionRole.CONTRIBUTES, groupKey, contribution);
            validateContributionFields(this, contribution, groupKey);
            validateContributingFile(realizedPath);
        } catch (e) {
            if (e.type) {
                this.handleError_(groupKey, e, e.type);
            } else {
                this.handleError_(groupKey, e, PackageState.UNKNOWN_ERROR);
            }
        }
    }

    private _validateDefinition() {
        this._validateTarget();
        this._validateActivator();
        this._validateContributable();
        this._validateContributes();
    }

    private _validateTarget() {
        try {
            const {target} = this.packageJson.orbital;
            validateTarget(target);
        } catch (e) {
            this.handleError_('target', e, PackageState.INVALID_MANIFEST);
        }
    }
}

export default Package;
