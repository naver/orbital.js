const exec = require('../util/exec');
const json = require('../util/json');
const logger = require('.././logger');

json.read('./scripts/jsons/plugins.json')
    .then((items) => {
        exec('npm install --no-save ' + items.join(' '));
    })
    .catch(e => logger.error(e));
