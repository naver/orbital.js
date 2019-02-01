/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

class BaseError extends Error {
    constructor(...args) {
        super();
        let message = args.shift();
        args.forEach((arg, i) => {
            message = message.replace(`#{${i}}`, arg);
        });
        this.name = this.constructor.name;
        this.message = message;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}

export default BaseError;
