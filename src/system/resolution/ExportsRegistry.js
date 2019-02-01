/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import InstallError from '../exceptions/InstallError';

const reg = new Map();

const ExportsRegistry = {

    register (name, version, exports) {
        if (!reg.has(name)) {
            reg.set(name, {});
        }
        const regsByName = reg.get(name);
        if (regsByName[version]) {
            throw new Error(
                    `${InstallError.ALEXIST} (${name}@${version})`);
        } else {
            regsByName[version] = exports;
        }
    },

    getExportsByPlugin(plugin) {
        const name = plugin.getName();
        const version = plugin.getVersion();
        const byName = reg.get(name);
        if (byName) {
            return byName[version];
        }
        return null;
    }
};

export default ExportsRegistry;
