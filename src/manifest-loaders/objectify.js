/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

function objectify(path, value) {
    if (typeof path !== 'string') return value;
    var tokens = path.split('/').reverse();
    return tokens.reduce(function (prev, cur) {
        var o = {};
        o[cur] = prev;
        return o;
    }, value);
}

export default objectify;
