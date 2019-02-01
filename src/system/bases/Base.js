/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import EventEmitter from 'events';
import orbitalConfig from './orbitalConfig';

class Base extends EventEmitter {

    constructor() {
        super();
        this.setMaxListeners(0);
    }

    define(key, value, option) {
        if (typeof option === 'object') {
            Object.assign(option, {value});
            Reflect.defineProperty(this, key, option);
        } else {
            Reflect.defineProperty(this, key, {value});
        }
    }

    shouldImplement(method) {
        throw new Error(`${this} should implement ${method}`);
    }

    debug(...args) {
        if (orbitalConfig.debug) {
            args[0] = this + ' ' + args[0];
            console.info(...args);
        }
    }

    off(eventName, listener) {
        this.removeListener(eventName, listener);
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
