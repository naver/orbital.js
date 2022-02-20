/* tslint:disable: max-line-length */

import {
    $logger, Base, freeze, getPackageNameFromId, nextTick, trace
} from 'orbital.core.common';
import {
    IActivator,
    IContributableExtensionDescriptor,
    IContributableServiceDescriptor,
    IExtensionModuleQueryResult, IExtensionRegistration,
    IPlugin, IPluginContext,
    IServiceCallOptions, IServiceClosure, IServicePublishingOptions,
    IServiceRegistration,
    ISystemContainer,
    PluginState
} from 'orbital.core.types';
import PluginError from './exceptions/PluginError';

class PluginContext extends Base implements IPluginContext {

    private _activator!: IActivator;
    private readonly _close: () => void;
    private readonly _forEachContributors: (callback: (contributor: IPluginContext) => void) => void;
    private readonly _getAsyncService: (serviceId: string, options: IServiceCallOptions) => Promise<IServiceClosure>;
    private readonly _getContributableExtensionDescriptor: (extensionId: string) => IContributableExtensionDescriptor | null;
    private readonly _getContributableServiceDescriptor: (serviceId: string) => IContributableServiceDescriptor | null;
    private readonly _getExtensionRegistrations: (extensionId: string) => IExtensionRegistration[];
    private readonly _getExtensions: (extensionId: string) => Promise<IExtensionModuleQueryResult[]>;
    private readonly _getService: (serviceId: string, options: IServiceCallOptions) => IServiceClosure;
    private readonly _getServicesInUse: () => IServiceRegistration[];
    private readonly _loadActivator: (callback: (activator: IActivator) => void) => void;
    private readonly _plugin: IPlugin;
    private readonly _publishService: (
        serviceId: string, service: object, options: IServicePublishingOptions) => IServiceRegistration;

    constructor(plugin: IPlugin, container: ISystemContainer) {
        super();
        const extensionRegistry = container.getExtensionRegistry();
        const serviceRegistry = container.getServiceRegistry();
        const pluginRegistry = container.getPluginRegistry();
        const contributionCache = container.getContributionCache();
        this._plugin = plugin;
        this._close = () => {
            // TODO serviceRegistry.removeAllServiceListeners(this);
            serviceRegistry.unregisterServices(this);
            serviceRegistry.releaseServicesInUse(this);
            extensionRegistry.unregisterExtensions(this);
            plugin.setState(PluginState.RESOLVED);
        };
        this._forEachContributors = (callback) => {
            pluginRegistry.getPluginsRequires(this.getPlugin()).forEach((plugin) => {
                callback(plugin.getContext());
            });
        };
        this._getAsyncService = (serviceId: string, options: IServiceCallOptions = {}): Promise<IServiceClosure> => {
            return serviceRegistry.getAsyncService(this, serviceId, options);
        };
        this._getContributableExtensionDescriptor = (extensionId: string): IContributableExtensionDescriptor | null => {
            const specProviderName = getPackageNameFromId(extensionId);
            const specProviderVersion = this.getDependencyVersionByName(specProviderName);
            const specProviderPlugin = pluginRegistry.getPluginByNameAndVersion(
                specProviderName, specProviderVersion);
            if (!specProviderPlugin) {
                throw new PluginError(
                    PluginError.SPEC_PROVIDER_NOT_FOUND, extensionId);
            }
            return specProviderPlugin.getManifest()
                .getOwnContributableExtensionDescriptor(extensionId);
        };
        this._getContributableServiceDescriptor = (serviceId: string): IContributableServiceDescriptor | null => {
            const specProviderName = getPackageNameFromId(serviceId);
            const specProviderVersion = this.getDependencyVersionByName(specProviderName);
            const specProviderPlugin = pluginRegistry.getPluginByNameAndVersion(
                specProviderName, specProviderVersion);
            if (!specProviderPlugin) {
                throw new PluginError(
                    PluginError.SPEC_PROVIDER_NOT_FOUND, serviceId);
            }
            return specProviderPlugin.getManifest()
                .getOwnContributableServiceDescriptor(serviceId);
        };
        this._getExtensionRegistrations = (extensionId: string): IExtensionRegistration[] => {
            return extensionRegistry.getExtensionRegistrations(this, extensionId);
        };
        this._getExtensions = (extensionId: string): Promise<IExtensionModuleQueryResult[]> => {
            return extensionRegistry.getExtensions(this, extensionId);
        };
        this._getService = (serviceId: string, options: IServiceCallOptions = {}): IServiceClosure => {
            return serviceRegistry.getService(this, serviceId, options);
        };
        this._getServicesInUse = (): IServiceRegistration[] => {
            return serviceRegistry.getRegistrationsByUser(this);
        };
        /*
         * Load Activator Class then make it as an instance.
         * Since contributon cache could load modules asynchronously,
         * Activator modules are also could be loaded lazily.
         */
        this._loadActivator = (callback: (activator: IActivator) => void) => {
            contributionCache.getActivator(this)
                .then((Activator) => {
                    callback(new Activator());
                }).catch((e) => {
                $logger.error(this, e);
            });
        };
        this._publishService = (
            serviceId: string, service: object, options: IServicePublishingOptions): IServiceRegistration => {
            // TODO checkValid();
            return serviceRegistry.register(this, serviceId, service, options);
        };
        freeze(this, [
            '_plugin'
        ], false);
    }

    @trace
    close() {
        this._close();
    }

    forEachContributors(callback: (contributor: IPluginContext) => void): void {
        this._forEachContributors(callback);
    }

    @trace
    getAsyncService(serviceId: string, options: IServiceCallOptions = {}): Promise<IServiceClosure> {
        return this._getAsyncService(serviceId, options);
    }

    getContributableExtensionDescriptor(extensionId: string): IContributableExtensionDescriptor | null {
        return this._getContributableExtensionDescriptor(extensionId);
    }

    getContributableServiceDescriptor(serviceId: string): IContributableServiceDescriptor | null {
        return this._getContributableServiceDescriptor(serviceId);
    }

    getDependencyVersionByName(packageName: string): string {
        return this._plugin.getManifest()
            .getDependencyVersionByName(packageName);
    }

    getExtensionRegistrations(extensionId: string): IExtensionRegistration[] {
        return this._getExtensionRegistrations(extensionId);
    }

    getExtensions(extensionId: string): Promise<IExtensionModuleQueryResult[]> {
        return this._getExtensions(extensionId);
    }

    /**
     * Convenient method for {Plugin}
     * @return {String}
     */
    getId(): string {
        return this._plugin.getId();
    }

    getPlugin(): IPlugin {
        return this._plugin;
    }

    getPluginName(): string {
        return this.getPlugin().getName();
    }

    getPluginVersion(): string {
        return this.getPlugin().getVersion();
    }

    getService(serviceId: string, options: IServiceCallOptions = {}): IServiceClosure {
        return this._getService(serviceId, options);
    }

    getServicesInUse(): IServiceRegistration[] {
        return this._getServicesInUse();
    }

    @trace
    publishService(serviceId: string, service: object, options: IServicePublishingOptions): IServiceRegistration {
        return this._publishService(serviceId, service, options);
    }

    /*
     * Call plugin's PluginActivator.start()
     * This method is called by Plugin.startWorker().
     */
    @trace
    start() {
        try {
            const {ACTIVE} = PluginState;
            const plugin = this.getPlugin();
            const {orbital} = plugin.getManifest().getMeta();
            if (orbital.activator) {
                this._loadActivator((activator) => {
                    this._activator = activator as IActivator;
                    nextTick(() => {
                        const startResult = activator.onStart(this);
                        if (startResult instanceof Promise) {
                            startResult
                                .then(() => {
                                    plugin.setState(ACTIVE);
                                }).catch((e) => {
                                $logger.warn(this, e);
                            });
                        } else {
                            plugin.setState(ACTIVE);
                        }
                    });
                });
            } else {
                plugin.setState(ACTIVE);
            }
        } catch (e) {
            $logger.warn(this, e);
        }
    }

    @trace
    stop() {
        try {
            const plugin = this.getPlugin();
            const {orbital} = plugin.getManifest().getMeta();
            if (orbital.activator && this._activator
                && typeof this._activator.onStop === 'function') {
                this._activator.onStop(this);
            }
        } catch (e) {
            $logger.warn(this, e);
        }
    }

    toString() {
        return `<PluginContext>(${this.getId()})`;
    }

    // TODO SECURITY
    unpublishService(serviceRegistration: IServiceRegistration): void {
        serviceRegistration.unregister();
    }
}

export default PluginContext;
