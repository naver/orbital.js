/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

/* eslint-disable no-process-env */

/**
 * orbital loader for webpack.
 */

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const rpt = require('read-package-tree');

function getOrbitalConfig() {
    const cwd = process.cwd();
    const DEFAULT_CONFIG = 'orbital.config.js';
    const ENV_CONFIG = process.env.ORBITAL_CONFIG;
    let config = {};
    if (ENV_CONFIG) {
        const envCfgPath = path.resolve(cwd, ENV_CONFIG);
        if (fs.existsSync(envCfgPath)) {
            config = require(envCfgPath);
        }
    } else {
        const defCfgPath = path.resolve(cwd, DEFAULT_CONFIG);
        if (fs.existsSync(defCfgPath)) {
            config = require(defCfgPath);
        }
    }
    return normalizeOrbitalConfig(config);
}

function normalizeOrbitalConfig(config) {
    if (!config.packages) {
        config.packages = {
            ignored: [],
            stopped: []
        };
    }
    if (!config.packages.ignored) {
        config.packages.ignored = [];
    }
    if (!config.packages.stopped) {
        config.packages.stopped = [];
    }
    return config;
}

function log(...args) {
    if (args[0]) {
        args[0] = chalk.white.bold(args[0]);
    }
    const prefix = [
        chalk.green.bold('[ORBITAL-LOADER]'),
        '>'
    ];
    console.log.apply(console, prefix.concat(args));
}

function normalize(manifest) {
    function applyNorm(_manifest, type) {
        if (_manifest[type]) {
            if (!_manifest[type].services) {
                _manifest[type].services = [];
            }
            if (!_manifest[type].extensions) {
                _manifest[type].extensions = [];
            }
        } else {
            _manifest[type] = {
                services: [],
                extensions: []
            };
        }
    }
    ['contributable', 'contributes'].forEach((type) => {
        applyNorm(manifest, type);
    });
    if (!manifest.policies) {
        manifest.policies = [];
    }
    return manifest;
}

function getOrbitalPackages(node) {
    console.log('');
    let n = 0;
    const orbitals = [];
    const orbitalConfig = getOrbitalConfig();
    const ignoredPackages = orbitalConfig.packages.ignored;
    const stoppedPackages = orbitalConfig.packages.stopped;
    (function calculate(module) {
        const pack = module.package;
        const packageId = `${pack.name}@${pack.version}`;
        const packageName = pack.name;
        if (Reflect.has(pack, 'orbital')) {
            n++;
            const ignored = ignoredPackages.some((rule) => {
                if (rule.endsWith('*')) {
                    const packNamespace = rule.substr(0, rule.length - 1);
                    return packageName.includes(packNamespace);
                } else if (rule.indexOf('@') > -1) {
                    return packageId === rule;
                }
                return packageName === rule;
            });
            if (ignored) {
                log(n, chalk.yellow.bold(`${packageId}  ignored`));
            } else {
                if (stoppedPackages.includes(pack.name)) {
                    pack.state = 1;
                } else {
                    pack.state = 0;
                }
                orbitals.push(module);
                log(n, packageId, ' detected');
            }
        }
        module.children.forEach((child) => {
            calculate(child);
        });
    })(node);
    return orbitals;
}

function getDependency(module, depName) {
    let mod = module;
    let dependency;
    while (mod) {
        const inspect = mod.children.some((child) => {
            if (child.package.name === depName) {
                dependency = child;
                return true;
            }
        });
        if (inspect) {
            return dependency;
        }
        mod = mod.parent;
    }
}

function validateContributingId(type, id) {
    if (typeof id !== 'string' || !id) {
        throw new Error(type + ' id should be a string.'
            + ' (eg. some-contributable-package-name:' + type + '-id)');
    }
    const index = id.indexOf(':');
    if (index <= 0) {
        throw new Error(type + ' id ' + id + ' has syntax error.'
            + ' (eg. some-contributable-package-name:' + type + '-id)');
    } else if (index > 0) {
        if (index === (id.length - 1)) {
            throw new Error(type + ' id ' + id + ' has syntax error.'
                + ' (eg. some-contributable-package-name:' + type + '-id)');
        }
    }
}

function getPackageName(id) {
    return id.split(':')[0];
}

module.exports = function orbitalLoader(code) {

    const callback = this.async();
    const orbitalConfig = getOrbitalConfig();

    rpt('./', (err, root) => {

        const promiseBlocks = [];

        if (!root || !root.children) {
            console.log(
                chalk.yellow.bold('[ORBITAL-LOADER]'),
                err
            );
        }

        const orbitalPackages = getOrbitalPackages(root);

        orbitalPackages.forEach((module) => {

            const modulePaths = [];
            const moduleIds = [];
            const basedir = module.realpath;
            const pack = module.package;
            const orb = normalize(pack.orbital);
            const depVerMap = {};
            const contributesCount = {};

            if (typeof pack.dependencies !== 'object') {
                pack.dependencies = {};
            }

            depVerMap[pack.name] = pack.version;
            Reflect.ownKeys(pack.dependencies).forEach((depName) => {
                const dep = getDependency(module, depName);
                const depPack = dep.package;
                depVerMap[depPack.name] = depPack.version;
            });

            if (orb.activator) {
                moduleIds.push('Activator');
                modulePaths.push(path.join(basedir, orb.activator));
            }

            orb.contributes.services.forEach((service) => {
                if (Reflect.has(service, 'realize')) {
                    const serviceId = service.id;
                    validateContributingId('service', serviceId);
                    const provider = getPackageName(serviceId);
                    const version = depVerMap[provider];
                    const uniqueId = `contributes/services/${provider}/${version}/${service.id}`;
                    if (!contributesCount[uniqueId]) {
                        contributesCount[uniqueId] = 0;
                    }
                    moduleIds.push(uniqueId + '/' + contributesCount[uniqueId]++);
                    modulePaths.push(path.join(basedir, service.realize));
                }
            });

            orb.contributes.extensions.forEach((extension) => {
                if (Reflect.has(extension, 'realize')) {
                    const extensionId = extension.id;
                    validateContributingId('extension', extensionId);
                    const provider = getPackageName(extensionId);
                    const version = depVerMap[provider];
                    const uniqueId = `contributes/extensions/${provider}/${version}/${extensionId}`;
                    if (!contributesCount[uniqueId]) {
                        contributesCount[uniqueId] = 0;
                    }
                    moduleIds.push(uniqueId + '/' + contributesCount[uniqueId]++);
                    modulePaths.push(path.join(basedir, extension.realize));
                }
            });

            const modulePathsJSON = JSON.stringify(modulePaths);
            const moduleIdsJSON = JSON.stringify(moduleIds);

            promiseBlocks.push(`
                promises.push(new Promise(function (resolve, reject) {
                    require(${modulePathsJSON}, function () {
                        var args = arguments;
                        var exports = {};
                        var ids = ${moduleIdsJSON};
                        ids.forEach(function (id, i) {
                            merge(exports, objectify(id, esDefault(args[i])));
                        });
                        ExportsRegistry.register('${pack.name}', '${pack.version}', exports);
                        try {
                            var manifest = {
                                activator: ${orb.activator ? JSON.stringify(orb.activator) : null},
                                name: '${pack.name}',
                                version: '${pack.version}',
                                path: '${module.path.replace(/\\/g, '/')}',
                                description: '${pack.description || ''}',
                                license: '${pack.license || ''}',
                                policies: ${JSON.stringify(orb.policies)},
                                contributable: ${JSON.stringify(orb.contributable)},
                                contributes: ${JSON.stringify(orb.contributes)},
                                dependencies: ${JSON.stringify(depVerMap)},
                                state: ${pack.state}
                            };
                            resolve(manifest);
                        } catch (e) {
                            resolve(e);
                        }
                    });
                }));
            `);
        });

        const newCode = `
            var ManifestLoader = {
                discover: function (callback, config) {
                    var promises = [];
                    ${promiseBlocks.join('')}
                    Promise.all(promises).then(function (results) {
                        callback(results, ${JSON.stringify(orbitalConfig)});
                    });
                }
            };
        `;

        code = code.replace(/var ManifestLoader = {.*};/, newCode);

        callback(null, code);
    });
};
