const logger = require('./logger');
const childProcess = require('child_process');

function exec(cmd) {
    if (!cmd.trim()) {
        return;
    }
    logger.log(cmd);
    childProcess.execSync(cmd, {stdio: 'inherit'});
}

module.exports = exec;
