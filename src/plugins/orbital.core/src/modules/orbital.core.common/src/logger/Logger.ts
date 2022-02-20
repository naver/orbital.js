import {
    ILogBufferFrame,
    ILogger,
    ILoggerOptions,
    LoggerLevel
} from 'orbital.core.types';
import commandMap from './commandMap';

export default class Logger implements ILogger {

    static singleton: ILogger;
    static getSingleton(): ILogger {
        if (!Logger.singleton) {
            Logger.singleton = new Logger({
                defaultLevel: LoggerLevel.warn
            });
        }
        return Logger.singleton;
    }

    private _buffer: ILogBufferFrame[] = [];
    private _level: LoggerLevel = LoggerLevel.warn;
    private _released: boolean = false;
    private _releasing: boolean = false;

    constructor(options: ILoggerOptions) {
        this.setLevel(options.defaultLevel);
    }

    debug(...args: any[]) {
        this._addToBuffer('debug', args);
    }

    emphasize(...args: any[]) {
        this._addToBuffer('emphasize', args);
    }

    error(...args: any[]) {
        this._addToBuffer('error', args);
    }

    getLevel(): LoggerLevel {
        return this._level;
    }

    info(...args: any[]) {
        this._addToBuffer('info', args);
    }

    isReleased() {
        return this._released;
    }

    log(...args: any[]) {
        this._addToBuffer('log', args);
    }

    nl() {
        this._addToBuffer('nl');
    }

    pause() {
        this._released = false;
    }

    release() {
        if (!this._released) {
            this._released = true;
            this._flush();
        }
    }

    setLevel(level: LoggerLevel) {
        this._level = level;
    }

    setPrompt(prompt: string) {
        commandMap.setPrompt(prompt);
    }

    silly(...args: any[]) {
        this._addToBuffer('silly', args);
    }

    spin(...args: any[]) {
        this._addToBuffer('spin', args);
    }

    trace(template: string, className: any,
          method: string, params: any[], result?: any) {
        this._addToBuffer('trace',
            [template, className, method, params, result]);
    }

    update(...args: any[]) {
        this._addToBuffer('update', args);
    }

    warn(...args: any[]) {
        this._addToBuffer('warn', args);
    }

    private _addToBuffer(level: string, args?: any[]) {
        this._buffer.push({
            args,
            date: new Date(),
            level
        });
        /*
        if (this.released) {
            setTimeout(() => {this.flush();}, 0);
        }
        */
        if (this._released) {
            this._flush();
        }
        if (!this._released && level === 'error') {
            this.release();
        }
    }

    private _flush() {
        if (this._releasing) {
            return;
        }
        this._releasing = true;
        const buffer = this._buffer;
        const Level = LoggerLevel as any;
        try {
            while (buffer.length) {
                const frame = buffer.shift();
                if (frame) {
                    const {date, level, args} = frame;
                    if (Level[level] <= this._level) {
                        commandMap[level](date, args);
                    }
                }
            }
        } finally {
            this._releasing = false;
        }
    }
}
