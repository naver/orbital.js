import * as events from 'events';
import {IBase} from 'orbital.core.types';

class Base extends events.EventEmitter implements IBase {

    constructor() {
        super();
        this.setMaxListeners(0);
    }

    define(prop: string, value: any, option?: PropertyDescriptor) {
        if (typeof option === 'object') {
            Object.assign(option, {value});
            Object.defineProperty(this, prop, option);
        } else {
            Object.defineProperty(this, prop, {value});
        }
    }

    off(eventName: string | symbol, listener: (...args: any[]) => void): this {
        return super.removeListener(eventName, listener);
    }

    toString() {
        let className = '';
        if (this.constructor.name) {
            className = `<${this.constructor.name}>`;
        }
        return className;
    }
}

export default Base;
