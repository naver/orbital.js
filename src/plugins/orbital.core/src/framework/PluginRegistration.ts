import {Base, freeze} from 'orbital.core.common';
import {
    IPlugin,
    IPluginContext,
    IPluginRegistration
} from 'orbital.core.types';

class PluginRegistration extends Base implements IPluginRegistration {

    private readonly _initiator: IPluginContext;
    private readonly _installedDate: number;
    private readonly _plugin: IPlugin;

    constructor(initiator: IPluginContext, plugin: IPlugin) {
        super();
        this._initiator = initiator;
        this._plugin = plugin;
        this._installedDate = Date.now();
        freeze(this, [
            '_initiator', '_plugin', '_installedDate'
        ], false);
    }

    getInitiator(): IPluginContext {
        return this._initiator;
    }

    getInstalledDate(): number {
        return this._installedDate;
    }

    getPlugin(): IPlugin {
        return this._plugin;
    }
}

export default PluginRegistration;
