const common = require('orbital.core.common');
const LEVELS = common.LEVELS;
const COMMAND = 'log';
const DEFAULT_LEVEL = 2;
const explain = "('error', 'warn', 'info(default)', 'log', 'debug', 'silly')";

const extension = {
    command: COMMAND,
    alias: 'l',
    desc: `Set orbital logger's levels. ${explain}`,
    default(context) {
        const logger = context.getService('orbital.core:logger');
        logger.setLevel(DEFAULT_LEVEL);
        logger.release();
    },
    execute(context) {
        const cliArgsService = context.getService('orbital.cli:arguments');
        const logger = context.getService('orbital.core:logger');
        cliArgsService.getArgValue(COMMAND).then(argV => {
            const typeofArgv = typeof argV;
            let level;
            if (typeofArgv === 'string') {
                level = LEVELS[argV];
                if (typeof level !== 'number') {
                    logger.warn('invalid log level', argV);
                    level = DEFAULT_LEVEL;
                }
            } else {
                level = DEFAULT_LEVEL;
            }
            logger.setLevel(level);
            logger.release();
        });
    }
};

module.exports = extension;
