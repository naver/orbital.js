const exec = require('././util/exec');
const logger = require('././util/logger');
const updateCoreManifest = require('./manifest/updateCoreManifest');
const updateRuntimeManifests = require('./manifest/updateRuntimeManifests');

const mode = 'dev';

updateCoreManifest(mode)
    .then(() => {
        return updateRuntimeManifests(mode);
    })
    .then(() => {
        exec('npm install');
    })
    .catch(e => logger.error(e));
