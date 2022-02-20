import {cliArgs} from '../../util';
import LiveUpdateManager from '../LiveUpdateManager';
import RegistryListener from '../RegistryListener';

function loadLiveUpdateManager(registry, platform, Starter) {
    const args = cliArgs();
    if (args.watch) {
        RegistryListener.listen(registry, platform, Starter);
        const lum = new LiveUpdateManager(registry, platform);
        return lum;
    }
    return null;
}

export default loadLiveUpdateManager;
