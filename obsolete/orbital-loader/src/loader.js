/**
 * orbital loader for webpack.
 */

import {logger} from 'orbital.core.common';
import {OrbitalPackage, OrbitalPackageRegistry} from '../../src/manifest';
import {loadLiveUpdateManager} from '../../src/manifest/util';

const registry = new OrbitalPackageRegistry('./');

function orbitalize(code, callback, registry) {
    logger.info('orbital-loader compiling orbital packages ...');
    const promiseBlocks = [];
    const {STOPPED, STOPPED_BY_DEPENDENCY} = OrbitalPackage.FLAGS;
    registry.forEachPacks((pack) => {
        if (pack.isLessOrEqualState(STOPPED | STOPPED_BY_DEPENDENCY)) {
            promiseBlocks.push(`
                promises.push(new Promise(function (resolve, reject) {
                    try {
                        require(${JSON.stringify(pack.exports.paths)}, function () {
                            var args = arguments;
                            var exports = {};
                            var ids = ${JSON.stringify(pack.exports.ids)};
                            ids.forEach(function (id, i) {
                                merge(exports, objectify(id, esDefault(args[i])));
                            });
                            ExportsRegistry.register(
                                '${pack.getName()}', '${pack.getVersion()}', exports);
                            resolve(${JSON.stringify(pack.getManifest())});
                        });
                    } catch (e) {
                        console.warn(e);
                        reject(e);
                    }
                }));
            `);
            logger.log(`${pack.getId()} webpack compiled`);
        } else {
            promiseBlocks.push(`
                promises.push(new Promise(function (resolve, reject) {
                    try {
                        resolve(${JSON.stringify(pack.getManifest())});
                    } catch (e) {
                        console.warn(e);
                        reject(e);
                    }
                }));
            `);
            logger.warn(`${pack.getId()} webpack compiled, but will not start `
                + pack.getErrorString());
        }
    });

    const newCode = `
        function esDefault(mod) {
            var result = mod;
            if (mod.__esModule && mod.default) {
                result = mod.default;
            }
            return result;
        }
        var merge = require('lodash.merge');
        var promises = [];
        var Starter = arguments[0];
        var onDiscover = arguments[1];
        ${promiseBlocks.join('')}
        Promise.all(promises).then(function (results) {
            onDiscover(results);
        });
    `;
    code = code.replace('return require(pkg);', '');
    code = code.replace('delete require.cache[require.resolve(path)];', '');
    code = code.replace(/'webpack-orbital-loader-code-block';/, newCode);
    callback(null, code);
}

export default function (code) {
    logger.info('orbital-loader');
    const callback = this.async();
    if (!registry.isInitialized) {
        registry
            .initPackages()
            .then(() => {registry.printDependencies();})
            .then(() => {orbitalize(code, callback, registry);})
            .then(() => {
                setTimeout(() => {
                    loadLiveUpdateManager(registry, 'webpack');
                }, 1000);
            });
    } else {
        const length = registry.queue.length;
        logger.log('waiting queue jobs ', length);
        if (length) {
            orbitalize(code, callback, registry);
            for (let i = 0; i < length; i++) {
                //TODO update code with the given queue
                registry.queue.shift();
            }
        }
    }
}
