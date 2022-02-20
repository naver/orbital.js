const logger = require('./util/logger');

const mode = process.argv[2];
if (mode !== 'remote' && mode !== 'local') {
    logger.error("argument should be one of 'remote' or 'local'");
} else {
    require(`./runtime/install-plugins-${mode}.js`);
}
