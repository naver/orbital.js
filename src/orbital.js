/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import 'es6-shim';
import Starter from './runtime/Starter';

function orbital(callback, cfg) {
    Starter.startup(callback, cfg);
}

export default orbital;
