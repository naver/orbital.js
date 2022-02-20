const chalk = require('chalk');

const message = {
    arrow: chalk.green('→'),
    building: chalk.yellowBright('building ...'),
    copying: chalk.yellowBright('copying ...'),
    creating: chalk.yellowBright('creating ...'),
    done: chalk.cyanBright('done!')
};

module.exports = message;
