import {logger} from './logger';
import childProcess from 'child_process';

export function execSync(cmd) {
    if (!cmd.trim()) {
        return;
    }
    logger.log(cmd);
    childProcess.execSync(cmd, {stdio: 'inherit'});
}
