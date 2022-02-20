const json = require('.././util/json');
const logger = require('./logger');
const readdir = require('./readdir');
const path = require('path');

const META_FILE = 'package.json';
const ROOT_META_FILE = path.resolve(__dirname, '../../', META_FILE);
const RUNTIME_DIR = path.resolve(__dirname, '../../runtime');

function joinPaths(...arr) {
    return arr.join(path.sep);
}

function updateRuntimeManifests(mode) {
    let rootPack;
    const metas = {};
    return json.read(ROOT_META_FILE)
        .then((meta) => {
            rootPack = meta;
            return readdir(RUNTIME_DIR)
        })
        .then((dirs) => {
            const promises = dirs.map(cat => {
                const catDir = joinPaths(RUNTIME_DIR, cat);
                return readdir(catDir)
                    .then(dirs => {
                        const promises = dirs.map(dir => {
                            const mfPath = joinPaths(catDir, dir, META_FILE);
                            return json.read(mfPath)
                                .then(meta => {
                                    metas[meta.name] = Object.assign({}, meta, {
                                        _path_: {
                                            cat,
                                            mfPath
                                        }
                                    });
                                });
                        });
                        return Promise.all(promises);
                    });
            });
            return Promise.all(promises)
                .then(() => {
                    return metas;
                });
        })
        .then(metas => {
            const packageNames = Reflect.ownKeys(metas);
            const promises = packageNames.map(name => {
                const meta = metas[name];
                const dependencies = meta.dependencies;
                const thisCat = meta._path_.cat;
                Reflect.ownKeys(dependencies).forEach((dependency) => {
                    if (packageNames.includes(dependency)) {
                        const depPack = metas[dependency];
                        const depCat = depPack._path_.cat;
                        if (mode === 'dev') {
                            let filePath;
                            if (thisCat === depCat) {
                                filePath = 'file:../';
                            } else {
                                filePath = 'file:../../' + depCat + '/';
                            }
                            dependencies[dependency] = filePath + dependency;
                        } else if (mode === 'pub') {
                            dependencies[dependency] = '^' + depPack.version;
                        }
                    } else if (dependency === 'orbital.js') {
                        if (mode === 'dev') {
                            dependencies[dependency] = 'file:../../../';
                        } else if (mode === 'pub') {
                            dependencies[dependency] = '^' + rootPack.version;
                        }
                    }
                });
                const {mfPath} = meta._path_;
                const metaClone = Object.assign({}, meta);
                Reflect.deleteProperty(metaClone, '_path_');
                return json.write(mfPath, metaClone)
                    .then((size) => {
                        logger.log(`${mfPath} (${size} byte) written`);
                    });
            });
            return Promise.all(promises);
        })
        .catch(e => {logger.error(e);});
}

module.exports = updateRuntimeManifests;
