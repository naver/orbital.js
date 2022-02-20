import {ILogBase} from 'orbital.core.types';
import {$logger} from '../logger';
import Base from './Base';

class LogBase extends Base implements ILogBase {

    debug(...args: any[]): void {
        args[0] = this + ' ' + args[0];
        $logger.debug(...args, '%f');
    }

    info(...args: any[]): void {
        args[0] = this + ' ' + args[0];
        $logger.info(...args, '%f');
    }

    log(...args: any[]): void {
        args[0] = this + ' ' + args[0];
        $logger.log(...args, '%f');
    }

    warn(...args: any[]): void {
        args[0] = this + ' ' + args[0];
        $logger.warn(...args, '%f');
    }
}

export default LogBase;
