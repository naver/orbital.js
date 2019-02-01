/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

function emitCartChange() {
    const container = document.querySelector('#cart');
    const ev = document.createEvent('Event');
    ev.initEvent('cartChange', true, true);
    container.dispatchEvent(ev);
}

export default emitCartChange;
