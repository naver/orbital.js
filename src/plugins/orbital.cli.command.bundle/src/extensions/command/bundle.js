/**
 * A package should be bundled in these cases.
 * 1) when publishing a package (O)
 * 2) when sources are changed while developing (Todo)
 * 3) when install local packages (O)
 */

const common = require('orbital.core.common');
const fs = require('fs');
const path = require('path');
const readJson = require('read-package-json');
const BundlerFactory = require('./bundler/BundlerFactory');

const COMMAND = 'bundle';
const META_FILE = 'package.json';
const MODULES_PATH = 'node_modules';
const REMOTE_INSTALL = 'REMOTE';
const REMOTE_INSTALL_MSG = 'building has been skipped. remote install does not require building';
const DESC = 'Bundle orbital package with given argument path. '
    + 'If argument is empty, current directory will be used.';

function bundle(manifest, context) {
    const bundler = BundlerFactory.getBundler(manifest, context);
    if (bundler) {
        bundler.buildFiles();
    }
}

function changeDir(dir) {
    if (dir !== process.cwd()) {
        process.chdir(dir);
    }
}

function getPackageDir(context, cb) {
    const cliArgsService = context.getService('orbital.cli:arguments');
    cliArgsService.getArgValue(COMMAND).then(argV => {
        let dir;
        if (typeof argV === 'string') {
            if (path.isAbsolute(argV)) {
                dir = argV;
            } else {
                dir = path.resolve(argV);
            }
        } else {
            dir = process.cwd();
        }
        fs.lstat(dir, (err, stats) => {
            if (err) {
                cb(null, err);
            } else if (stats.isSymbolicLink()) {
                fs.readlink(dir, (e, target) => {
                    if (e) {
                        cb(null, e);
                        return;
                    }
                    cb(target);
                });
            } else if (dir.indexOf(MODULES_PATH) > -1) {
                const e = new Error(REMOTE_INSTALL_MSG);
                e.type = REMOTE_INSTALL;
                cb(null, e);
            } else {
                cb(dir);
            }
        });
    });
}

/**
 *
 1. 특정 패키지에 대한 빌드 (경로 지정 또는 지정안함)
 2. 프로젝트의 모든 패키지에 대한 빌드 (경로 지정 또는 지정안함)
 3. watch 모드는 어떻게 ?

 watching = compiler.watch()
 watcher = watch( rollup, config );
 */

const extension = {
    command: COMMAND,
    alias: 'b',
    desc: DESC,
    execute(context) {
        const logger = context.getService('orbital.core:logger');
        getPackageDir(context, (dir, e) => {
            if (e) {
                if (e.type === REMOTE_INSTALL) {
                    logger.info(e.message);
                } else {
                    logger.warn(e.message);
                }
                return;
            }
            changeDir(dir);
            const metaPath = path.resolve(dir, META_FILE);
            readJson(metaPath, (err, meta) => {
                if (err) {
                    logger.warn('bundling aborted due to the following reason.');
                    logger.warn(err.code);
                    return;
                }
                const manifest = common.normalize(meta);
                const bundleCfg = manifest.orbital.bundle;
                if (bundleCfg) {
                    logger.info('building', common.getPackageId(manifest),
                        'with', bundleCfg.bundler, '...');
                    bundle(manifest, context);
                }
            });
        });
    }
};

module.exports = extension;
