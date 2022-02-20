import {Base, freeze} from 'orbital.core.common';
import {
    IContributionCache, IExtensionRegistry, IPluginRegistry,
    IServiceRegistry, ISystemContainer, ISystemPlugin
} from 'orbital.core.types';
import ExtensionRegistry from './extensions/ExtensionRegistry';
import PluginRegistry from './PluginRegistry';
import ContributionCache from './resolution/ContributionCache';
import ServiceRegistry from './services/ServiceRegistry';

class SystemContainer extends Base implements ISystemContainer {

    private _contributionCache!: IContributionCache;
    private readonly _extensionRegistry: IExtensionRegistry;
    private readonly _pluginRegistry: IPluginRegistry;
    private readonly _serviceRegistry: IServiceRegistry;
    private _system!: ISystemPlugin;

    constructor() {
        super();
        this._pluginRegistry = new PluginRegistry();
        this._serviceRegistry = new ServiceRegistry(this);
        this._extensionRegistry = new ExtensionRegistry(this);
        freeze(this, [
            '_pluginRegistry', '_serviceRegistry', '_extensionRegistry'
        ], false);
    }

    getContributionCache(): IContributionCache {
        return this._contributionCache;
    }

    getExtensionRegistry(): IExtensionRegistry {
        return this._extensionRegistry;
    }

    getPluginRegistry(): IPluginRegistry {
        return this._pluginRegistry;
    }

    getServiceRegistry(): IServiceRegistry {
        return this._serviceRegistry;
    }

    getSystemPlugin(): ISystemPlugin {
        return this._system;
    }

    init(system: ISystemPlugin): void {
        this._system = system;
        this._contributionCache = new ContributionCache(system);
        Object.freeze(this);
    }
}

export default SystemContainer;
