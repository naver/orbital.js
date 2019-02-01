/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import orbitalConfig from '../system/bases/orbitalConfig';

function formated(type, thrower, error) {
    let msg = `[ORBITAL] ${type}\n`
            + `Location: ${thrower}\n`
            + `Reason: ${error}`;
    if (error.stack) {
        msg += `\n${error.stack}`;
    }
    return msg;
}

class Notice {

    static log(...args) {
        if (orbitalConfig.log) {
            if (args[0]) {
                args[0] = '' + args[0];
            }
            console.log(...args);
        }
    }

    static warn(thrower, error) {
        console.warn(formated('WARNING', thrower, error));
    }

    static error(thrower, error) {
        console.warn(formated('ERROR', thrower, error));
    }
}

export default Notice;
