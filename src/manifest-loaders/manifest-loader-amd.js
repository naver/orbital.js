/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import normalize from './normalize';

class ManifestLoader {

    static discover(callback, config) {
        console.log('[ORBITAL] amd: ManifestLoader > discover(callback, config)');
        console.log(config.plugins);
        callback([]);
    }
}

export default ManifestLoader;
