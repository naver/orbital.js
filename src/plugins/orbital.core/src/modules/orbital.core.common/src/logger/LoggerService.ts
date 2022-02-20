import {ILogger, IPluginContext, LoggerLevel} from 'orbital.core.types';
import $logger from './singleton';

class LoggerService implements ILogger {

    private context: IPluginContext;

    constructor(context: IPluginContext) {
        this.context = context;
    }

    debug(...args: any[]) {
        $logger.debug(...args);
    }

    emphasize(...args: any[]) {
        $logger.emphasize(...args);
    }

    error(...args: any[]) {
        $logger.error(...args);
    }

    getLevel(): LoggerLevel {
        return $logger.getLevel();
    }

    info(...args: any[]) {
        $logger.info(...args);
    }

    isReleased() {
        return $logger.isReleased();
    }

    log(...args: any[]) {
        $logger.log(...args);
    }

    nl() {
        $logger.nl();
    }

    pause() {
        $logger.pause();
    }

    release() {
        $logger.release();
    }

    setLevel(level: LoggerLevel) {
        $logger.setLevel(level);
    }

    setPrompt(prompt: string) {
        $logger.setPrompt(prompt);
    }

    silly(...args: any[]) {
        $logger.silly(...args);
    }

    spin(...args: any[]) {
        $logger.spin(...args);
    }

    trace(template: string, className: string,
          method: string, params: any[], result?: any) {
        $logger.trace(template, className, method, params, result);
    }

    update(...args: any[]) {
        $logger.update(...args);
    }

    warn(...args: any[]) {
        $logger.warn(...args);
    }
}

export default LoggerService;
