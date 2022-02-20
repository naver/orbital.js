const EntryBundler = require('./EntryBundler');
const IndexHtml = require('./IndexHtml');
const chalk = require('chalk');
const common = require('orbital.core.common');
const fs = require('fs');
const fse = require('fs-extra');
const node = require('orbital.core.node');
const types = require('orbital.core.types');
const path = require('path');

const cyan = chalk.cyan;
const green = chalk.green;

const PLUGINS_DIR = 'plugins';
const PLUGIN_META_FILE = 'plugin.json';

class ResourceGenerator extends common.Base {

    constructor(context) {
        super();
        this.context = context;
        this.logger = context.getService('orbital.core:logger');
        this.opm = context.getService('orbital.core:package-manager');
        const project = this.project = context.getService('orbital.core:project');
        this.projectConfig = project.getConfig();
        this.realPath = project.getRealPath();
        this.webAppPath = project.getWebAppPath();
        this.root = this.realPath.root;
        this.packages = [];
        this.writtenPackages = [];
        this.runtime = {
            amdLibPath: null,
            amdLoaders: []
        };
        this.amdConfig = {
            paths: {}
        };
        this.extensionPromises = [];
        this.indexHtml = new IndexHtml(
            this.realPath.input.web.index,
            this.realPath.output.web.index,
            this
        );
        this.startExtensionPlugins();
    }

    copyContribution(pack) {
        const logger = this.logger;
        const packId = pack.getId();
        const manifest = pack.getManifest();
        const bundle = manifest.orbital.bundle;
        const pluginAssetDir = path.resolve(
            this.realPath.output.web.packages.dir, packId);
        let sourceDir;
        let targetDir;
        if (bundle) {
            sourceDir = path.resolve(manifest.orbital._resolution.path, bundle.path);
            targetDir = path.resolve(pluginAssetDir, bundle.path);
        } else {
            sourceDir = manifest.orbital._resolution.path;
            targetDir = pluginAssetDir;
        }
        return node.realPath(sourceDir)
            .then((realDir) => {
                if (pack.getManifest().orbital.target.includes('web')) {
                    const modulesPath = realDir + 'node_modules';
                    const testPath = realDir + 'test';
                    return fse.copy(realDir, targetDir, {filter(src) {
                        return src.indexOf(modulesPath) === -1
                            && src.indexOf(testPath) === -1;
                    }}).then(() => {
                        logger.info(this.emp(targetDir), 'copied');
                    });
                }
                return true;
            })
            .then(() => {
                return this.writeManifest(pluginAssetDir, manifest);
            })
            .then(() => {
                return packId;
            })
            .catch(e => logger.error(e));
    }

    copyContributions() {
        const logger = this.logger;
        const promises = [];
        this.packages = this.opm.list();
        if (this.packages.length) {
            logger.info('Generating static resources for web ...');
            this.packages.forEach((pack) => {
                promises.push(this.copyContribution(pack));
            });
        } else {
            logger.warn('There is nothing to generate.');
        }
        return Promise.all(promises)
            .then((packs) => {
                this.writtenPackages = packs.filter((packId) => {
                    return packId !== null;
                });
            });
    }

    copyAmd() {
        const logger = this.logger;
        const engine = this.projectConfig.webApp.amd.engine;
        const sourceFile = require.resolve(engine);
        const basename = path.basename(sourceFile);
        this.runtime.amdLibPath = this.webAppPath.runtime.amd.dir + '/' + basename;
        const targetDir = this.realPath.output.web.runtime.amd.dir;
        const targetFile = path.resolve(targetDir, basename);
        return fse.ensureDir(targetDir)
            .then(() => fse.copy(sourceFile, targetFile))
            .then(() => {
                logger.info(this.emp(targetFile), 'written');
            });
    }

    copyAmdPlugins() {
        return Promise.all(this.extensionPromises)
            .then(() => {
                const promises = [];
                const amdLoaders = this.runtime.amdLoaders;
                amdLoaders.forEach((amlPlugin) => {
                    promises.push(this.copyAmdPlugin(amlPlugin));
                });
                return Promise.all(promises);
            });
    }

    copyAmdPlugin(amdLoader) {
        const logger = this.logger;
        const amdLoadersDir = this.realPath.output.web.runtime.amd.loaders;
        const amdLoadersWebAppPath = this.webAppPath.runtime.amd.loaders;
        const fileName = path.basename(amdLoader.path);
        const sourceFile = amdLoader.path;
        const targetFile = path.resolve(amdLoadersDir, fileName);
        return fse.ensureDir(amdLoadersDir)
            .then(() => fse.copy(sourceFile, targetFile))
            .then(() => {
                amdLoader.fileTypes.forEach((fileType) => {
                    this.amdConfig.paths[fileType] = amdLoadersWebAppPath
                        + '/' + path.basename(fileName, '.js');
                });
                logger.info(this.emp(targetFile), 'written');
            })
            .catch((e) => {
                logger.error(e);
            });
    }

    emp(str) {
        const publicDir = this.projectConfig.path.output.web.dir;
        const tokens = str.replace(this.root + path.sep, '').split(path.sep);
        tokens.reverse();
        tokens.some((token, i) => {
            tokens[i] = cyan(token);
            return token === publicDir;
        });
        tokens.reverse();
        return tokens.join('/');
    }

    generate() {
        const indexHtml = this.indexHtml;
        this.copyContributions()
            .then(() => this.writePackageList())
            .then(() => this.copyAmd())
            .then(() => this.copyAmdPlugins())
            .then(() => this.processEntry())
            .then(() => this.writeAppConfig())
            .then(() => this.writeAmlConfig())
            .then(() => indexHtml.parse())
            .then(() => indexHtml.addScript(this.runtime.amdLibPath))
            .then(() => indexHtml.addScript(this.webAppPath.runtime.amd.config))
            .then(() => indexHtml.addScript(this.webAppPath.app.entry))
            .then(() => indexHtml.write())
            .catch(e => this.logger.error(e));
    }

    getEntryCode(sysLibPath) {
        const bundler = this.projectConfig.bundle.entry.bundler;
        const entryPath = this.realPath.input.web.entry;
        function codeGen(code) {
            const pad = '    ';
            const lines = code.trim().split('\n').map((line) => {
                return pad + line;
            });
            const padCode = lines.join('\n');
            return `require(['${sysLibPath}'], function (orbital) {\n`
                + padCode + '\n'
                + '});\n';
        }
        return new Promise((resolve, reject) => {
            if (bundler) {
                const entryBundler = new EntryBundler(bundler);
                this.logger.info('entryBundler', entryBundler);
            } else {
                fs.readFile(entryPath, 'utf8', (e, entry) => {
                    if (e) {
                        reject(e);
                    } else {
                        resolve(codeGen(entry));
                    }
                });
            }
        });
    }

    getSystemPackagePath() {
        return new Promise((resolve, reject) => {
            const sysPack = this.packages.filter((pack) => {
                return pack.getName() === 'orbital.core';
            })[0];
            if (!sysPack) {
                reject(new Error('system package not found'));
                return;
            }
            if (!this.writtenPackages.includes(sysPack.getId())) {
                reject(new Error('system package has not been written'));
                return;
            }
            const sysLibPath = [PLUGINS_DIR, sysPack.getId(),
                sysPack.getManifest().main].join('/');
            resolve(sysLibPath);
        });
    }

    processEntry() {
        return this.getSystemPackagePath()
            .then(sysLibPath => this.getEntryCode(sysLibPath))
            .then(entryCode => this.writeEntryCode(entryCode));
    }

    startExtensionPlugins() {
        const context = this.context;
        const {ACTIVE, STOPPING} = types.PluginState;
        context.on('extensionRegistered', (registration) => {
            const extensionId = registration.getExtensionId();
            const contributor = registration.getContributorContext();
            registration.getModule().then((module) => {
                if (extensionId === 'orbital.cli.command.web:amd-loader') {
                    this.runtime.amdLoaders.push({
                        fileTypes: module.fileTypes,
                        path: module.getSourcePath(contributor)
                    });
                }
            });
        });
        context.forEachContributors((contributor) => {
            this.extensionPromises.push(new Promise((resolve) => {
                const plugin = contributor.getPlugin();
                plugin.on('stateChange', (who, state) => {
                    if (state === ACTIVE) {
                        resolve();
                    } else if (state === STOPPING) {
                        resolve();
                    }
                });
                try {
                    plugin.start();
                } catch (e) {
                    this.logger.error(e);
                    resolve();
                }
            }));
        });
    }

    writeAmlConfig() {
        const configFile = this.realPath.output.web.runtime.amd.config;
        const config = JSON.stringify(this.amdConfig, null, 4);
        const contents = `require.config(${config});\n`;
        return fse.outputFile(configFile, contents)
            .then(() => {
                this.logger.info(this.emp(configFile), 'written');
            });
    }

    writeAppConfig() {
        const configPath = path.resolve(
            this.realPath.output.web.dir, types.ProjectDefaultOptions.WEB_PROJECT_CONFIG);
        const config = Object.assign({
            _cache: {
                webAppPath: this.webAppPath
            }
        }, this.project.getConfig());
        return fse.outputFile(configPath,
            JSON.stringify(config, null, 4))
            .then(() => {
                this.logger.info(this.emp(configPath), 'written');
            });
    }

    writeEntryCode(code) {
        const webDir = this.realPath.output.web.dir;
        const {dir, entry} = this.realPath.output.web.app;
        console.log('webDir, dir, entry', webDir, dir, entry);
        const entryPath = path.resolve(webDir, dir, entry);
        console.log('webDir', webDir);
        return fse.outputFile(entryPath, code)
            .then(() => {
                this.logger.info(this.emp(entryPath), 'written');
            });
    }

    writeManifest(dir, manifest) {
        const manifestFile = path.resolve(dir, PLUGIN_META_FILE);
        return fse.ensureDir(path.dirname(manifestFile))
            .then(() => {
                return node.writeJson(manifestFile, manifest)
                    .then(() => {
                        this.logger.info(this.emp(manifestFile), 'written');
                    });
            });
    }

    writePackageList() {
        const writtenPackages = this.writtenPackages;
        const pluginsFile = this.realPath.output.web.packages.list;
        return node.writeJson(pluginsFile, writtenPackages)
            .then(() => {
                const count = writtenPackages.length;
                const result = green(`(${count} packages)`);
                this.logger.info(this.emp(pluginsFile), result, 'written');
            });
    }
}

module.exports = ResourceGenerator;
