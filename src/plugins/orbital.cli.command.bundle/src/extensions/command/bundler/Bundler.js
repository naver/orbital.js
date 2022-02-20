const msg = require('./message');
const fse = require('fs-extra');
const common = require('orbital.core.common');
const path = require('path');

const INDEX_FILE = 'resources.json';
const JSON_OPTION = {spaces: 2};
const META_FILE = 'package.json';
const MODULES_PATH = 'node_modules';

class Bundler extends common.Base {

    constructor(manifest, context) {
        super();
        const bundleName = manifest.orbital.bundle.bundler;
        const configFile = bundleName + '.config.js';
        this.define('context', context);
        this.define('manifest', manifest);
        this.lib = this.getLib(bundleName);
        this.config = this.getConfig(configFile);
        this.define('logger', context.getService('orbital.core:logger'));
        if (!this.lib) {
            this.logger.warn(
                bundleName + ' not found from all node_modules. '
                + 'internal version will be used instead.');
        }
        if (!this.config) {
            this.logger.warn(
                configFile + ' not found. '
                + 'internal config will be used instead.');
        }
    }

    createIndex() {
        const logger = this.logger;
        logger.info(INDEX_FILE, msg.creating);
        const builtDir = this.getBuildDir();
        fse.readdir(builtDir, (err, files) => {
            if (err) {
                return logger.error(err);
            }
            const indexFilePath = path.resolve(builtDir, INDEX_FILE);
            fse.writeJson(indexFilePath, files, JSON_OPTION)
                .then(() => {
                    logger.info(INDEX_FILE, msg.done);
                })
                .catch((e) => {
                    logger.error(e);
                });
        });
    }

    getBuildDir() {
        this.shouldImplement('getBuildDir');
    }

    getConfig(configFileName) {
        let commonCfg = null;
        let localCfg = null;
        const project = this.context.getService('orbital.core:project');
        const projectRoot = project.getRealPath().root;
        const cwd = process.cwd();
        const localFile = path.resolve(cwd, configFileName);
        if (fse.pathExistsSync(localFile)) {
            localCfg = require(localFile);
        }
        const dirs = cwd.split(path.sep);
        while (dirs.length) {
            dirs.pop();
            const current = dirs.join(path.sep);
            const configFile = path.resolve(current, configFileName);
            if (fse.pathExistsSync(configFile)) {
                commonCfg = require(configFile);
                break;
            }
            if (current === projectRoot) {
                break;
            }
        }
        if (commonCfg && localCfg) {
            return Object.assign(commonCfg, localCfg);
        }
        return commonCfg || localCfg;
    }

    getLib(bundlerName) {
        const cwd = process.cwd();
        const dirs = cwd.split(path.sep);
        const modulePath = MODULES_PATH + path.sep + bundlerName;
        while (dirs.length) {
            const thisPath = dirs.join(path.sep);
            const bundlerPath = path.resolve(thisPath, modulePath);
            const metafile = path.resolve(bundlerPath, META_FILE);
            if (fse.pathExistsSync(metafile)) {
                const meta = fse.readJsonSync(metafile);
                const libPath = path.resolve(bundlerPath, meta.main);
                return require(libPath);
            }
            dirs.pop();
        }
        return null;
    }

    buildFiles() {
        const promises = [];
        const config = this.manifest.orbital;
        if (config.activator) {
            promises.push(this.build(config.activator, 'activator'));
        }
        Promise.all(promises.concat(this.buildContributions()))
            .then(() => {
                this.createIndex();
            })
            .catch((e) => {
                if (e) {
                    this.logger.error(e);
                }
            });
    }

    buildContributions() {
        const promises = [];
        const contributes = this.manifest.orbital.contributes;
        ['services', 'extensions'].forEach((type) => {
            contributes[type].forEach((contribution, index) => {
                const bundledModuleId = common.getBundledModuleId(
                    type, contribution.id, index);
                promises.push(
                    this.build(contribution.realize, bundledModuleId)
                );
            });
        });
        return promises;
    }

    build(sourcePath, bundledModuleId) {
        if (path.extname(sourcePath) === '.json') {
            return this.copy(sourcePath, bundledModuleId, 'json');
        }
        const targetFile = bundledModuleId + '.js';
        this.log(sourcePath, targetFile, 'building');
        return this.runBuild(sourcePath, bundledModuleId)
            .then(() => {
                this.log(sourcePath, targetFile, 'done');
            })
            .catch((e) => {
                this.logger.nl();
                if (e instanceof common.Warn) {
                    logger.warn(e);
                } else {
                    logger.error(e);
                }
            });
    }

    copy(sourcePath, bundledModuleId, ext) {
        const targetFile = bundledModuleId + '.' + ext;
        this.log(sourcePath, targetFile, 'copying');
        const bundleCfg = this.manifest.orbital.bundle;
        return fse.copy(sourcePath,
            path.resolve(process.cwd(), bundleCfg.path, targetFile))
            .then(() => {
                this.log(sourcePath, targetFile, 'done');
            });
    }

    log(source, target, state) {
        this.logger.info(source, msg.arrow, target, msg[state]);
    }

    runBuild() {
        this.shouldImplement('runBuild');
    }
}

module.exports = Bundler;
