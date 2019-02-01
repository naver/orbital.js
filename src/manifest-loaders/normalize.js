/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

function normalize(manifest) {
    function applyNorm(manifest, type) {
        if (!manifest[type]) {
            manifest[type] = {
                services: [],
                extensions: []
            };
        } else {
            if (!manifest[type].services) {
                manifest[type].services = [];
            }
            if (!manifest[type].extensions) {
                manifest[type].extensions = [];
            }
        }
    }
    ['contributable', 'contributes'].forEach(function (type) {
        applyNorm(manifest, type);
    });
    return manifest;
}

export default normalize;
