/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import path from 'path';

function orbitalize (options) {
    if (!options) options = {};
    return {
        name: 'orbitalize',
        transform: function transform (code, id) {
            if (id.indexOf(path.sep + 'Starter.js') > -1) {
                code = code.replace(/'\.\/ManifestLoader'/gm,
                    "'../manifest-loaders/manifest-loader-" + options.env + "'");
            }
            return {
                code,
                map: {mappings: ''}
            };
        }
    };
}

export default orbitalize;
