import {$logger, Base, freeze, pkg, SerializableManifest, trace} from 'orbital.core.common';
import {
    IRuntimeCallback, IRuntimeProjectConfig, PluginEvent, PluginState
} from 'orbital.core.types';
import * as systemMeta from '../../package.json';
import SystemContainer from '../framework/SystemContainer';
import SystemPlugin from '../framework/SystemPlugin';

class Starter extends Base {

    private readonly _callback: IRuntimeCallback;
    private readonly _runtimeConfig: IRuntimeProjectConfig;

    constructor(callback: IRuntimeCallback, runtimeConfig: IRuntimeProjectConfig) {
        super();
        this._callback = callback;
        this._runtimeConfig = runtimeConfig;
        freeze(this, [
            '_callback', '_runtimeConfig'
        ], false);
    }

    /**
     * Starts the platform and sets it up
     * to run a single application.
     */
    @trace
    startup() {
        this._createSystem((system) => {
            system.on(PluginEvent.stateChange, (who, state) => {
                if (state === PluginState.ACTIVE) {
                    system.getContext().createSystemServices();
                }
            });
            system.install().then(() => {
                system.start();
            }).catch((e) => {
                $logger.error(e);
            });
        });
    }

    private _createSystem(callback: (system: SystemPlugin) => void) {
        const manifest = new SerializableManifest(pkg.normalize(systemMeta));
        callback(
            new SystemPlugin(
                manifest, new SystemContainer(), this._runtimeConfig
            )
        );
    }
}

export default Starter;
