const exec = require('../util/exec');
const logger = require('../util/logger');
const fs = require('fs');

fs.readdir('./runtime/plugins', (e, dirs) => {
    logger.log('installing runtime plugins (local) ...');
    if (e) {
        return logger.err(e);
    }
    const items = dirs.map((name) => {
        return 'runtime/plugins/' + name;
    });
    exec('npm install --no-save ' + items.join(' '));
});
