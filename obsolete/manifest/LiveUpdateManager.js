import {getOrbitalConfig, logger, nodeReq} from '../util';
import {getId} from './util';

const DEFAULT_ROOT_PATH = '.';
const DEFAULT_PLUGINS_PATH = './src/plugins';

function getRootPath(config) {
    return config.path && config.path.root || DEFAULT_ROOT_PATH;
}

function getPluginsPath(config) {
    return config.path && config.path.plugins || DEFAULT_PLUGINS_PATH;
}

class LiveUpdateManager {

    constructor(registry, platform) {
        this.registry = registry;
        this.platform = platform;
        this.startPluginWatcher();
    }

    close() {
        this.watcher.close();
        logger.log('live-update-manager stopped.');
    }

    startPluginWatcher() {
        const config = getOrbitalConfig();
        const chalk = nodeReq('chalk');
        const chokidar = nodeReq('chokidar');
        this.rootPath = getRootPath(config);
        this.pluginsPath = getPluginsPath(config);
        this.startWatcher = chokidar
            .watch(this.pluginsPath, {ignoreInitial: true, persistent: true})
            .on('all', this.handleChange.bind(this))
            .on('error', (err) => {
                logger.log(err);
            });
        logger.nl();
        logger.log('live-update-manager is watching '
            + `'${chalk.bold.cyan(this.pluginsPath)}'. ctrl+c to exit.\n`);
    }

    copy(source, target) {
        const fse = nodeReq('fs-extra');
        const path = nodeReq('path');
        return new Promise((resolve, reject) => {
            fse.ensureDir(path.dirname(target))
                .then(() => {
                    fse.copy(source, target, (err) => {
                        if (err) {
                            reject(err);
                            logger.error(err);
                            return;
                        }
                        delete require.cache[target];
                        logger.log(`cache cleared (${target})`);
                        resolve();
                    });
                })
                .catch((err) => {
                    reject(err);
                    logger.error(err);
                });
        });
    }

    /**
     * For WDS, copy is just enough.
     * But manifest change needs to call registry.refresh()
     * and it could be handled by registry.queue and orbital-loader.
     */
    copySource(source, target, event, node) {
        return this.copy(source, target)
            .then(() => {
                this.logState(event, target);
                if (node) {
                    if (this.platform === 'node') {
                        this.registry.refresh(node);
                    }
                }
            });
    }

    execSync(cmd) {
        const childProcess = nodeReq('child_process');
        logger.log(cmd);
        childProcess.execSync(cmd, {
            stdio: 'inherit'
        });
    }

    getEldestNode(seed) {
        let node = seed;
        const rootId = this.registry.root.package._id;
        while (node && (node.parent.package._id !== rootId)) {
            node = node.parent;
        }
        return node;
    }

    getManifestPath(node) {
        const path = nodeReq('path');
        return path.resolve(
            node.package._from, 'package.json');
    }

    handleChange(event, changedPath) {
        const path = nodeReq('path');
        const filepath = path.relative(process.cwd(), changedPath);
        if (this.isRemovedManifestHandled(event, filepath)) {
            return;
        } else if (this.isNewManifestHandled(event, filepath)) {
            return;
        }
        const fs = nodeReq('fs');
        const rpj = nodeReq('read-package-json');
        const rpt = nodeReq('read-package-tree');
        const cwd = process.cwd();
        const absSourceFile = cwd + path.sep + filepath;
        const absPluginsDir = fs.realpathSync(this.pluginsPath);
        const relFile = path.relative(absPluginsDir, absSourceFile);
        const relTokens = relFile.split(path.sep);
        const relSourcePackageDir = relTokens.shift();
        const relSourceFile = relTokens.join(path.sep);
        const manifestPath = absPluginsDir + path.sep
            + relSourcePackageDir + path.sep + 'package.json';
        rpj(manifestPath, (err, manifest) => {
            if (err) {
                logger.error(`Error reading manifest file (${manifestPath})`);
                return;
            }
            //find a package inside of the rpt
            //Node {path, realpath, error, id, package, parent, isLink, children}
            rpt(this.rootPath, (err, root) => {
                this.walk(root, {
                    event,
                    manifest,
                    source: {
                        absolute: absSourceFile,
                        relative: relSourceFile
                    }
                });
            });
        });
    }

    handleSourceChange(source, target, event, node) {
        const fs = nodeReq('fs');
        if (fs.existsSync(target)) {
            if (this.isSame(source, target)) {
                this.logState('nothing changed');
            } else {
                this.handleSourceChangeByType(source, target, event, node);
            }
        } else {
            this.handleSourceChangeByType(source, target, event, node);
        }
    }

    handleSourceChangeByType(source, target, event, node) {
        if (this.getManifestPath(node) === source) {
            this.logState('manifest changed');
            const registry = this.registry;
            const id = getId(node);
            if (registry.exists(node)) {
                this.updateEldestNode(node)
                    .then(() => {
                        logger.log(
                            `${id} exists, refreshing package in registry`);
                        registry.refresh(node);
                    });
            } else {
                this.installEldestNode(node)
                    .then(() => {
                        logger.log(
                            `${id} does not exists, add package to registry`);
                        registry.add(node);
                    });
            }
        } else {
            this.copySource(source, target, event, node);
        }
    }

    handleSourceRemove(source, target, event, node) {
        if (this.getManifestPath(node) === source) {
            logger.warn('abnormal manifest unlink case', source, target, node);
        } else {
            this.removeTarget(target, event, node);
        }
    }

    installEldestNode(node) {
        return new Promise((resolve, reject) => {
            try {
                const fs = nodeReq('fs');
                const eldest = this.getEldestNode(node);
                const from = fs.realpathSync(eldest.package._from);
                this.installPath(from);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    installPath(path) {
        this.execSync(`npm install ${path}`);
    }

    /**
    * 1) Validate manifest path (src\plugins\examples.rest.products\package.json)
    * 2) Locate path to install
    * 3) npm install <package>
    * 4) registry.initPackages()
    */
    isNewManifestHandled(event, filepath) {
        const path = nodeReq('path');
        if (path.basename(filepath) === 'package.json') {
            const relativePath = path.relative(this.pluginsPath, filepath);
            const packageDir = path.dirname(relativePath);
            if (packageDir.indexOf(path.sep) === -1) {
                this.logState(`manifest ${event}`, filepath);
                try {
                    const registry = this.registry;
                    const manifest = this.readManifest(filepath);
                    const packageId = `${manifest.name}@${manifest.version}`;
                    const srcPath = path.dirname(filepath);
                    if ((event === 'add')
                        || ((event === 'change')
                            && !registry.getPackageById(packageId)
                        )) {
                        this.logState(`manifest ${event} success`,
                            `installing ${packageDir} ...`);
                        this.installPath(srcPath);
                        registry.addById(packageId)
                            .then(() => {
                                registry.printDependencies();
                            });
                        return true;
                    }
                    return false;
                } catch (e) {
                    logger.warn('manifest error.',
                        `${e.message} (${filepath})`);
                    return true;
                }
            }
            logger.warn(`${packageDir} is not a valid package path`);
            return false;
        }
        return false;
    }

    /**
    * 1) Locate installed path
    * 2) npm uninstall <package>
    * 3) registry.initPackages()
    */
    isRemovedManifestHandled(event, filepath) {
        const fs = nodeReq('fs');
        const path = nodeReq('path');
        if (event === 'unlink' && path.basename(filepath) === 'package.json') {
            const registry = this.registry;
            const from = path.dirname(filepath);
            const pack = registry.getPackageByProperty('_from', from);
            if (pack) {
                const installedPath = fs.realpathSync(
                    './node_modules' + pack.node.package._location);
                this.logState(`manifest ${event} success`,
                    `uninstalling ${pack.getId()} ...`);
                registry.remove(pack)
                    .then(() => {
                        registry.printDependencies();
                    })
                    .then(() => {
                        this.remove(installedPath)
                            .then(() => {
                                this.logState('manifest removed',
                                    pack.getId() + ' uninstalled');

                            });
                    });
                return true;
            }
        }
        return false;
    }

    isSame(source, target) {
        const fs = nodeReq('fs');
        const sCode = fs.readFileSync(source);
        const tCode = fs.readFileSync(target);
        return sCode.toString() === tCode.toString();
    }

    logState(state, path) {
        const chalk = nodeReq('chalk');
        logger.log(
            chalk.bold.white.bgGreen(` ${state.toUpperCase()} `),
            path ? path.replace(process.cwd(), '') : '');
    }

    readManifest(filepath) {
        const fs = nodeReq('fs');
        const manifest = JSON.parse(fs.readFileSync(filepath));
        if (!manifest.name) {
            throw new Error(`package.json should have a 'name' field.`);
        } else if (!manifest.version) {
            throw new Error(`package.json should have a 'version' field.`);
        } else if (typeof manifest.orbital === 'undefined') {
            throw new Error(`orbital's package.json should have an 'orbital' field.`);
        } else if (typeof manifest.orbital !== 'object') {
            throw new Error(`'orbital' field should be an object.`);
        }
        return manifest;
    }

    remove(target) {
        const fse = nodeReq('fs-extra');
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                fse.remove(target, (err) => {
                    if (err) {
                        reject(err);
                        logger.error(err);
                        return;
                    }
                    delete require.cache[target];
                    resolve();
                });
            }, 300);
        });
    }

    removeTarget(target, event, node) {
        this.remove(target)
            .then(() => {
                this.logState(event, target);
                if (node) {
                    this.registry.refresh(node);
                }
            });
    }

    update(node, opt) {
        const path = nodeReq('path');
        const event = opt.event;
        const source = opt.source.absolute;
        const target = node.realpath + path.sep + opt.source.relative;
        if (event === 'change') {
            this.handleSourceChange(source, target, event, node);
        } else if (event === 'unlink') {
            this.handleSourceRemove(source, target, event, node);
        } else if (event === 'add') {
            this.handleSourceChangeByType(source, target, event, node);
        } else if (event === 'addDir') {
            this.copySource(source, target, event);
        } else if (event === 'unlinkDir') {
            this.removeTarget(target, event);
        } else {
            logger.warn('live-update-manager received an unhandled event', event);
        }
    }

    updateEldestNode(node) {
        return new Promise((resolve, reject) => {
            try {
                const eldest = this.getEldestNode(node);
                this.updateNode(eldest);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    updateNode(node) {
        this.execSync(`npm uninstall ${node.package.name}`);
        this.execSync(`npm install ${node.package._from}`);
    }

    walk(node, opt) {
        if (opt.manifest._id === node.package._id) {
            this.update(node, opt);
        }
        if (node.children) {
            node.children.forEach((childNode) => {
                this.walk(childNode, opt);
            });
        }
    }
}

export default LiveUpdateManager;
