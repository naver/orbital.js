import * as events from 'events';

export type IVoidFunction = () => void;

export interface IBase extends events.EventEmitter {
    define(prop: string, value: any, option?: PropertyDescriptor): void;
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
    toString(): string;
}
.
export interface IEnum {
    [key: string]: number | string;
    [key: number]: number | string;
}

export interface IFlag extends IBase {
    getBitMask(): number;
    getFlag(flag: number): boolean;
    resetFlags(): void;
    setFlag(flag: number, value: boolean): void;
}

export interface IKeyString {
    [key: string]: string;
    [key: number]: string;
}

export interface IKeyValue {
    [key: string]: any;
    [key: number]: any;
}

export interface ILogBase extends IBase {
    debug(...args: any[]): void;
    info(...args: any[]): void;
    log(...args: any[]): void;
    warn(...args: any[]): void;
}
