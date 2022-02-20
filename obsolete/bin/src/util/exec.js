import {logger} from './logger';
import {spawn} from 'child_process';

export function exec(cmd, option = {}) {
    if (!cmd.trim()) {
        return;
    }
    logger.log(cmd);
    const args = cmd.split(' ');
    if (option.parentArgs) {
        args.push(`orbitalprocessargv=${JSON.stringify(process.argv)}`);
    }
    const command = args.shift();
    return spawn(command, args, {
        stdio: 'inherit'
    });
}
