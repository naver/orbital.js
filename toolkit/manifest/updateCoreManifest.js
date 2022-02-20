const json = require('.././util/json');
const logger = require('.././util/logger');
const path = require('path');

const p = {
    common: path.resolve(__dirname, '../jsons/package/common.json'),
    dev: path.resolve(__dirname, '../jsons/package/dev.json'),
    pub: path.resolve(__dirname, '../jsons/package/pub.json'),
    package: path.resolve(__dirname, '../../package.json')
};

function updateCoreManifest(mode) {
    return json.read(p.common)
        .then((mfCommon) => {
            return json.read(p[mode])
                .then((mfMode) => {
                    const dependencies = Object.assign(
                        {}, mfCommon.dependencies, mfMode.dependencies);
                    return Object.assign({}, mfCommon, mfMode, {dependencies});
                });
        }).then((packageJson) => {
            return json.write(p.package, packageJson)
                .then((size) => {
                    logger.log(`${p.package} (${size} byte) written`);
                });
        })
        .catch(e => {logger.error(e);});
}

module.exports = updateCoreManifest;
