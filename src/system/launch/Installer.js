/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Plugin from '../Plugin';
import SystemPlugin from '../SystemPlugin';
import Notice from '../../util/Notice';

function getSystemManifest(manifests) {
    let sysMan = null;
    let sysIndex;
    const exist = manifests.some((manifest, i) => {
        if (manifest.name === 'orbital.js') {
            sysIndex = i;
            return true;
        }
    });
    if (exist) {
        sysMan = manifests.splice(sysIndex, 1)[0];
    }
    return sysMan;
}

class Installer {

    /**
     * Installs plugins with the given manifests.
     * Then calls callback with the successfully installed plugins.
     *
     * TODO install using dependency tree
     * Pre-order tree traversal following dependencies
     *
     * TODO Promise context.installPlugin(path)
     *
     * TODO Let's try resolve installed plugin.
     */
    static install(manifests, callback) {
        // TODO make manifests tree
        const promises = [];
        const sysMan = getSystemManifest(manifests);
        sysMan.dependencies = {};
        const system = new SystemPlugin(sysMan);
        const context = system.getContext();
        promises.push(system.install());
        manifests.forEach((manifest) => {
            promises.push(
                Installer.installPlugin(manifest, context)
            );
        });
        Promise.all(promises).then((results) => {
            const installedPlugins = results.filter((result) => {
                return result instanceof Plugin;
            });
            callback(installedPlugins);
            return null;
        });
    }

    static installPlugin(manifest, context) {
        return new Promise((resolve, reject) => {
            const container = context.getSystemContainer();
            const registry = container.getPluginRegistry();
            try {
                const plugin = new Plugin(manifest, container);
                const installed = registry.install(context.getPlugin(), plugin);
                resolve(installed);
            } catch (e) {
                Notice.warn(this, e);
                resolve(e);
            }
        });
    }
}

export default Installer;
