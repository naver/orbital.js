export enum LoggerLevel {
    nl = -2,
    error = 0,
    warn = 1,
    info = 2,
    spin = 2,
    update = 2,
    log = 3,
    emphasize = 3,
    debug = 4,
    trace = 4,
    silly = 5
}

export type ILoggerCommandMapMethod = (date: Date, ...args: any[]) => void;
export type ILogMethod = (...args: any[]) => void;
export type ILogTrace = (template: string, className: string, method: string, params: any[], result?: any) => void;

export interface ILogBufferFrame {
    args?: any[];
    date: Date;
    level: string;
}

export interface ILogger {
    debug: ILogMethod;
    emphasize: ILogMethod;
    error: ILogMethod;
    getLevel: () => LoggerLevel;
    info: ILogMethod;
    isReleased: () => boolean;
    log: ILogMethod;
    nl: () => void;
    pause: () => void;
    release: () => void;
    setLevel: (level: LoggerLevel) => void;
    setPrompt: (prompt: string) => void;
    silly: ILogMethod;
    spin: ILogMethod;
    trace: ILogTrace;
    update: ILogMethod;
    warn: ILogMethod;
}

export interface ILoggerCommandMap {
    debug: ILoggerCommandMapMethod;
    emphasize: ILoggerCommandMapMethod;
    error: ILoggerCommandMapMethod;
    info: ILoggerCommandMapMethod;
    log: ILoggerCommandMapMethod;
    nl: () => void;
    setPrompt: (prompt: string) => void;
    silly: ILoggerCommandMapMethod;
    spin: ILoggerCommandMapMethod;
    trace: ILoggerCommandMapMethod;
    update: ILoggerCommandMapMethod;
    warn: ILoggerCommandMapMethod;
}

export interface ILoggerOptions {
    defaultLevel: LoggerLevel;
}

export interface ILogWriter {
    err: (date: Date, args: any[]) => void;
    nl: () => void;
    out: (type: string, date: Date, args: any[]) => void;
    setPropmt: (prompt: string) => void;
    spin: (date: Date, args: any[]) => void;
    trace: (date: Date, args: any[]) => void;
    update: (date: Date, args: any[]) => void;
}
