const exec = require('././util/exec');
const logger = require('././util/logger');
const updateCoreManifest = require('./manifest/updateCoreManifest');
const updateRuntimeManifests = require('./manifest/updateRuntimeManifests');

const mode = 'pub';

updateCoreManifest(mode)
    .then(() => {
        return updateRuntimeManifests(mode);
    })
    .then(() => {
        exec('npm publish');
    })
    .catch(e => logger.error(e));
