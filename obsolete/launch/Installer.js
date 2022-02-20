import Notice from '../../util/Notice';
import Plugin from '../Plugin';
import SystemPlugin from '../SystemPlugin';
import sort from './sort';

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
        const promises = [];
        const sysMan = getSystemManifest(manifests);
        if (!sysMan) {
            Notice.warn('Installer', 'orbital.js\'s package.json not found.'
                + ' Please confirm ./node_modules/orbital.core.js exists.');
            return;
        }
        const system = new SystemPlugin(sysMan);
        const context = system.getContext();
        sort(manifests, 'manifest');
        promises.push(system.install());
        manifests.forEach((manifest) => {
            promises.push(
                context.installPlugin(manifest)
            );
        });
        Promise.all(promises).then((results) => {
            const installedPlugins = results.filter((result) => {
                return result instanceof Plugin;
            });
            sort(installedPlugins, 'plugin');
            callback(system, installedPlugins);
            return null;
        });
    }
}

export default Installer;
