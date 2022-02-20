import listenNodeRegistry from './registryListeners/listenNodeRegistry';
import listenWebpackRegistry from './registryListeners/listenWebpackRegistry';

class RegistryListener {

    static listen(registry, platform, Starter) {
        switch (platform) {
            case 'node':
                listenNodeRegistry(registry, Starter);
                break;
            case 'webpack':
                listenWebpackRegistry(registry, Starter);
                break;
            default:
        }
    }
}

export default RegistryListener;
