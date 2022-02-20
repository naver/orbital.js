import Base from '../framework/bases/Base';
import {logger, nodeReq} from '../util';
import {OrbitalPackage} from './';
import {getId} from './util';

const {
    STOPPED,
    STOPPED_BY_DEPENDENCY,
    INACTIVE,
    INACTIVE_BY_DEPENDENCY,
    INVALID_MODULE,
    CONTRIBUTION_SYNTAX_ERROR,
    MODULE_NOT_FOUND
} = OrbitalPackage.FLAGS;

class PackageRegistry extends Base {

    constructor(rootPath) {
        super();
        this.define('queue', []);
        this.define('rootPath', rootPath);
        this.define('root', null, {writable: true});
        this.define('packs', {}, {writable: true});
        this.define('isInitialized', false, {writable: true});
    }

    /**
     * Walking through all node packages,
     * collect orbital packages then resolve promise
     */
    initPackages() {
        return new Promise((resolve, reject) => {
            try {
                const chalk = nodeReq('chalk');
                const rpt = nodeReq('read-package-tree');
                const stopped = chalk.magenta.bold('(stopped)');
                const inactive = chalk.yellow.bold('(inactive)');
                const cyan = chalk.cyan.bold;
                const registry = this;
                rpt(this.rootPath, (err, root) => {
                    if (err) {
                        logger.error(err);
                        return;
                    }
                    this.root = root;
                    this.packs = {};
                    (function walk(node) {
                        const pack = node.package;
                        if (Reflect.has(pack, 'orbital')) {
                            let state = '';
                            if (pack.orbital.state === 'stopped') {
                                state = stopped;
                            } else if (pack.orbital.state === 'inactive') {
                                state = inactive;
                            }
                            logger.log(cyan(getId(node)), state, 'detected');
                            registry.add(node);
                        }
                        node.children.forEach((child) => {
                            walk(child);
                        });
                    })(root);
                    resolve();
                    this.isInitialized = true;
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    add(node) {
        if (!this.exists(node)) {
            const pack = new OrbitalPackage(node);
            this.packs[getId(node)] = pack;
            this.validatePackages();
            this.emit('packageAdded', pack);
        }
    }

    addById(id) {
        logger.log(`adding ${id} ...`);
        return new Promise((resolve, reject) => {
            const reg = this;
            const rpt = nodeReq('read-package-tree');
            rpt(this.rootPath, (err, root) => {
                if (err) {
                    logger.error(err);
                    reject(err);
                    return;
                }
                (function walk(node) {
                    if (id === getId(node)) {
                        reg.add(node);
                        resolve(reg.getPackageById(id));
                    }
                    node.children.forEach((child) => {
                        walk(child);
                    });
                })(root);
            });
        });
    }

    exists(node) {
        return this.packs[getId(node)];
    }

    forEachPacks(callback) {
        Reflect.ownKeys(this.packs).forEach((id, i) => {
            callback(this.packs[id], i);
        });
    }

    getManifests() {
        const manifests = [];
        this.forEachPacks((pack) => {
            manifests.push(pack.getManifest());
        });
        return manifests;
    }

    getPackageById(id) {
        return this.packs[id];
    }

    getPackageByProperty(key, value) {
        let pak = null;
        this.forEachPacks((pack) => {
            if (pack.node.package[key] === value) {
                pak = pack;
            }
        });
        return pak;
    }

    getPackageIds() {
        return Reflect.ownKeys(this.packs);
    }

    getPackages() {
        return this.packs;
    }

    getPackagesByName(name) {
        const packages = [];
        const packIds = this.getPackageIds();
        packIds.forEach((id) => {
            if (id.substring(0, id.indexOf('@')) === name) {
                packages.push(this.packs[id]);
            }
        });
        return packages;
    }

    printDependencies() {
        const nl = '\n';
        function log() {
            const args = ([]).slice.call(arguments);
            args.push(nl);
            process.stdout.write(args.join(' '));
        }
        const root = {
            label: getId(this.root),
            nodes: []
        };
        this.forEachPacks((pack) => {
            const id = pack.getId();
            const node = {
                label: id + ' ' + pack.getErrorString(),
                nodes: []
            };
            root.nodes.push(node);
            pack.dependencies.forEach((depPack) => {
                const depId = depPack.getId();
                node.nodes.push({
                    label: depId + ' ' + depPack.getErrorString(),
                    nodes: []
                });
            });
        });
        const archy = nodeReq('archy');
        log('');
        logger.info('orbital dependency graph');
        log(archy(root, '', {unicode: process.platform !== 'win32'}));
        return this;
    }

    /**
     * Find new installed package node,
     * then update registry with the new node.
     */
    refresh(oldNode) {
        this.refreshById(getId(oldNode));
    }

    refreshById(oldId) {
        logger.log(`refreshing ${oldId} ...`);
        const reg = this;
        const rpt = nodeReq('read-package-tree');
        rpt(this.rootPath, (err, root) => {
            if (err) {
                logger.error(err);
                return;
            }
            (function walk(node) {
                if (oldId === getId(node)) {
                    reg.emit('packageWillUpdate', getId(node));
                    reg.update(node);
                }
                node.children.forEach((child) => {
                    walk(child);
                });
            })(root);
        });
    }

    /**
     * @param {OrbitalPackage} packToRemove
     *
     * 1) emit('packageWillRemove')
     *    - uninstallPlugin(id)
     * 2) remove packToRemove from this.packs
     * 3) emit('packageRemoved')
     */
    remove(packToRemove) {
        return new Promise((resolve, reject) => {
            try {
                this.emit('packageWillRemove', packToRemove);
                Reflect.deleteProperty(this.packs, packToRemove.getId());
                packToRemove.removeModules();
                this.emit('packageRemoved', packToRemove);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Update registry with the given new package node.
     */
    update(node) {
        const pack = this.getPackageById(getId(node));
        if (pack) {
            pack.init(node, true);
            this.validatePackages();
            this.emit('packageUpdated', getId(node), pack.getManifest());
        }
    }

    validateDependencies() {
        this.forEachPacks((pack) => {
            pack.depList.forEach((depId) => {
                const depPack = this.getPackageById(depId);
                if (depPack) {
                    if (!pack.dependencyExists(depPack)) {
                        pack.addDependency(depPack);
                    }
                }
            });
        });
    }

    validatePackages() {
        this.validateDependencies();
        this.validateOrphanDependencies();
        this.validatePackagesState();
    }

    validateOrphanDependencies() {
        this.forEachPacks((pack) => {
            const dependencies = pack.dependencies;
            const clone = dependencies.concat();
            clone.forEach((depPack) => {
                const depPackId = depPack.getId();
                if (pack.depList.indexOf(depPackId) === -1) {
                    dependencies.splice(dependencies.indexOf(depPack), 1);
                    logger.log(`orphan dependency ${depPackId}`
                        + ` removed from ${pack.getId()}`);
                }
            });
        });
    }

    validatePackagesState() {
        function isAncestalInactive(pack) {
            if (pack.getFlag(CONTRIBUTION_SYNTAX_ERROR | INACTIVE
                | INACTIVE_BY_DEPENDENCY | INVALID_MODULE
                | MODULE_NOT_FOUND)) {
                return true;
            }
            return pack.dependencies.some((depPack) => {
                return isAncestalInactive(depPack);
            });
        }
        function isAncestalStopped(pack) {
            if (pack.getFlag(STOPPED | STOPPED_BY_DEPENDENCY)) {
                return true;
            }
            return pack.dependencies.some((depPack) => {
                return isAncestalStopped(depPack);
            });
        }
        this.forEachPacks((pack) => {
            let activeAll = true;
            pack.depList.forEach((depId) => {
                const depPack = this.getPackageById(depId);
                if (depPack) {
                    if (isAncestalInactive(depPack)) {
                        if (!pack.getFlag(INACTIVE_BY_DEPENDENCY)) {
                            pack.setFlag(INACTIVE_BY_DEPENDENCY, true);
                        }
                        activeAll = false;
                    }
                    if (isAncestalStopped(depPack)) {
                        if (!pack.getFlag(STOPPED_BY_DEPENDENCY)) {
                            pack.setFlag(STOPPED_BY_DEPENDENCY, true);
                        }
                        activeAll = false;
                    }
                }
            });
            if (activeAll) {
                if (pack.getFlag(INACTIVE_BY_DEPENDENCY)) {
                    pack.setFlag(INACTIVE_BY_DEPENDENCY, false);
                }
                if (pack.getFlag(STOPPED_BY_DEPENDENCY)) {
                    pack.setFlag(STOPPED_BY_DEPENDENCY, false);
                }
            }
        });
    }
}

export default PackageRegistry;
