import {getPlatform, logger} from '../util';
import {OrbitalPackageRegistry} from './';
import {loadLiveUpdateManager} from './util';

const loaders = {
    amd() {
        console.log('amd');
    },
    node(Starter, onDiscover) {
        const registry = new OrbitalPackageRegistry('./');
        registry
            .initPackages()
            .then(() => {registry.printDependencies();})
            .then(() => {loadLiveUpdateManager(registry, 'node', Starter);})
            .then(() => {onDiscover(registry.getManifests());})
            .catch((e) => {
                logger.error(e);
                logger.warn(e.stack);
            });
    },
    webpack() {
        'webpack-orbital-loader-code-block';
    },
    unknown() {
        console.log('unknown platform');
    }
};

class ManifestLoader {
    static discover(Starter, onDiscover) {
        loaders[getPlatform()](Starter, onDiscover);
    }
}

export default ManifestLoader;
