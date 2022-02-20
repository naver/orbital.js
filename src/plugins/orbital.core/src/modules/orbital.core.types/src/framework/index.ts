/* tslint:disable:max-line-length */
/* tslint:disable:no-empty-interface */

import {
    IBase, IKeyString, IKeyValue, ILogBase
} from '../common';
import {
    ContributablePermissionCategory,
    IExtensionMeta,
    IOrbitalPackageJson,
    IOrbitalPackageResolution,
    IPackageIdentity,
    IPolicyType,
    ISerializableManifest,
    PackageState
} from '../package';
import {
    IRuntimeProjectConfig
} from '../project';

export type IActivatorClass = new <T>() => T;
export type IOrderBy = 'asc' | 'desc';
export type IServiceClass = new <T>(context: IPluginContext) => T;

export enum ContributionRegistrationState {
    REGISTERED = 1,
    UNREGISTERING = 1 << 1,
    UNREGISTERED = 1 << 2
}

export enum ContributionRegistrationEvent {
    registered = 'registered',
    unregistered = 'unregistered',
    unregistering = 'unregistering'
}

export enum ExtensionRegistryEvent {
    registered = 'registered',
    unregistered = 'unregistered',
    unregistering = 'unregistering'
}

export enum ManifestEvent {
    updated = 'updated'
}

export enum ServiceRegistrationEvent {
    userRemoved = 'userRemoved'
}

export enum ServiceRegistryEvent {
    registered = 'registered',
    unregistered = 'unregistered',
    unregistering = 'unregistering'
}

export enum ServiceClosureEvent {
    ready = 'ready',
    refresh = 'refresh'
}

export enum PluginContextEvent {
    extensionRegistered = 'extensionRegistered',
    extensionUnregistered = 'extensionUnregistered',
    serviceRegistered = 'serviceRegistered',
    serviceUnregistered = 'serviceUnregistered'
}

export enum PluginEvent {
    stateChange = 'stateChange'
}

/**
 * UNINSTALLED :
 *  - After Plugin Instantiation.
 *  - After IPluginRegistry.uninstall(packageId) call.
 *  - The package has been removed from the Orbital container.
 * INSTALLED :
 *  - After IPluginRegistry.install(IPlugin, IPlugin) call.
 *  - The package has been installed into the Orbital container,
 *    but some of the package's dependencies have not yet been met.
 * RESOLVED :
 *  - The package is ready to be started.
 *    The package is installed, and the Orbital framework has connected up
 *    all the dependencies and made sure they are all resolved.
 *    If a package is INSTALLED and it's state less than or equal to
 *    (PackageState.STOPPED | PackageState.STOPPED_BY_DEPENDENCY)
 *    the package's state transits to RESOLVED.
 * STARTING :
 *  - A temporary state that the package goes through while the package is starting.
 *  - After IPlugin.start() call.
 * ACTIVE :
 *  - After IPluginContext.start() call.
 *  - After IActivator.onStart() call if IActivator exists.
 * STOPPING :
 *  - A temporary state that the package goes through while the package is stopping.
 *  - After IPlugin.stop() call.
 *  - After IPlugin.start() call but if there is an exception.
 */
export enum PluginState {
    UNINSTALLED = 1,
    INSTALLED = 1 << 1,
    RESOLVED = 1 << 3,
    STARTING = 1 << 2,
    ACTIVE = 1 << 4,
    STOPPING = 1 << 5
}

export interface IActivator {
    onStart(context: IPluginContext): Promise<void> | void;
    onStop(context: IPluginContext): Promise<void> | void;
}

export interface IContributableDescriptor extends IBase {

    /**
     * A description for a contribution point.
     */
    readonly desc: string;

    /**
     * A contribution point id.
     */
    readonly id: string;

    /**
     * A permission instance which can validate other plugin's 'call' and 'realize' permission.
     */
    readonly permission: IContributablePermission;

    /**
     * A specification for a contribution point.
     */
    readonly spec: IContributableSpec;

    /**
     * A {@link IPackageIdentity} of a package which provides a specification.
     */
    readonly specProvider: IPackageIdentity;

    /**
     * A Uniform Resource Name which consists of
     * a packageId and a contribution point.
     * @example
     * {specProvider.name}@{specProvider.version}:{contributionPointId without specProvider.name}
     */
    readonly urn: string;
}

export interface IContributableExtensionDescriptor extends IContributableDescriptor {
    /**
     * Returns an extension (contribution point) id.
     */
    getExtensionId(): string;
}

export interface IContributablePermission {
    allowed(category: ContributablePermissionCategory, context: IPluginContext): boolean;
}

export interface IContributableServiceDescriptor extends IContributableDescriptor {
    readonly isAsync: boolean;
    readonly isTolerant: boolean;
    /**
     * Returns service (contribution point) id.
     */
    getServiceId(): string;
}

export interface IContributableSpec {
    [key: string]: any;
}

export interface IContributingDescriptor extends IBase {
    /**
     * A contribution point id. This value is equal to the id value of
     * an {@link IContributableDescriptor} which this IContributingDescriptor implements.
     */
    readonly id: string;
    /**
     * An index number of a contribution inside of a group of contributions.
     * For example, a group of contributions means the 'orbital.contributes.extensions' field
     * or the 'orbital.contributes.services' field in the package.json.
     */
    readonly index: number;
    /**
     * A priority of an order between contributions.
     */
    readonly priority: number;
    /**
     * A path of a file which implements the spec of the {@link IContributableDescriptor}.
     */
    readonly realize: string;
    /**
     * An {@link IPackageIdentity} of a package which describes
     * this {@link IContributingDescriptor}.
     */
    readonly specContributor: IPackageIdentity;
    /**
     * An {@link IPackageIdentity} of a package which provides
     * the {@link IContributableDescriptor} which
     * this {@link IContributingDescriptor} should implement.
     */
    readonly specProvider: IPackageIdentity;
    /**
     * A Uniform Resource Name which consists of
     * a packageId, a contribution point and
     * an index number of a contribution.
     * @example
     * {specProvider.name}@{specProvider.version}:{contributionPointId without specProvider.name}-{index}
     */
    readonly urn: string;
    /**
     * A company or individual(s) who contributes this contribution.
     */
    readonly vendor: string;
}

export interface IContributingExtensionDescriptor extends IContributingDescriptor {
    readonly meta: IExtensionMeta | null;
}

export interface IContributingServiceDescriptor extends IContributingDescriptor {}

export interface IContributionCache {
    getActivator(contributor: IPluginContext): Promise<IActivatorClass>;

    /**
     * Returns Promise to load extension contribution module.
     */
    getExtensionModule(
        contributor: IPluginContext,
        descriptor: IContributingExtensionDescriptor
    ): Promise<IExtensionModule>;

    /**
     * Returns Promise to load service contribution module.
     */
    getServiceClass(
        contributor: IPluginContext,
        descriptor: IContributingServiceDescriptor
    ): Promise<IServiceClass>;
}

export interface IContributionModule {
    [key: string]: any;
}

export interface IContributionOptions {
    priority?: number;
    vendor?: string;
}

export interface IContributionRegistration extends IBase {

    /**
     * Returns the specification provider plugin.
     * Because of the dynamic nature, it could be null.
     */
    getSpecProvider(): IPlugin | null;

    /**
     * Returns specification provider packages's name.
     */
    getSpecProviderName(): string;

    /**
     * Returns specification provider packages's version.
     */
    getSpecProviderVersion(): string;
}

export interface IContributionResolver extends IBase {
    readonly plugin: IPlugin;
    readonly report: IContributionResolutionReport;
    resolve(): Promise<IContributionResolutionReport>;
    wireActivator(container: ISystemContainer): Promise<void>;
    wireExtensions(container: ISystemContainer): Promise<void>;
    wireServices(container: ISystemContainer): Promise<void>;
}

export interface IContributionResolutionReport extends IBase {
    addFailure(error: Error): void;
    addWarning(warning: Error): void;
    getFailures(): Error[];
    getWarnings(): Error[];
    hasNoFailure(): boolean;
    showFailures(): void;
    showWarnings(): void;
}

export interface IExtensionModule extends IContributionModule {
    [key: string]: any;
}

export interface IExtensionModuleQueryResult {
    module: IExtensionModule;
    registration: IExtensionRegistration;
}

/**
 * Represents an extension contribution.
 */
export interface IExtensionRegistration extends IContributionRegistration {

    options: IContributionOptions;
    priority: number;
    state: ContributionRegistrationState;
    readonly uid: number;

    getContributableDescriptor(): IContributableExtensionDescriptor;
    getContributingDescriptor(): IContributingExtensionDescriptor;

    /**
     * Returns extension contributor's {@link IPluginContext}
     */
    getContributorContext(): IPluginContext;

    /**
     * Returns the extension point id to implement.
     */
    getExtensionId(): string;

    /**
     * Returns the extension point spec to implement.
     */
    getExtensionSpec(): IContributableSpec;

    /**
     * Returns meta-data described as a 'meta' in the extensions field.
     * The meta-data is very small amount of data, which could be used
     * without loading extension modules which usually requires time (or expensive).
     * This will be helpful when you want load contribution modules conditionally
     * without loading all the contribution modules.
     * @example
     * "contributes": {
     *   "extensions": [
     *     {
     *       "id": "orbital.i18n:languages",
     *       "realize": "./src/extensions/i18n/en.json",
     *       "meta": {
     *         "locale": "en"
     *       }
     *     },
     *     {
     *       "id": "orbital.i18n:languages",
     *       "realize": "./src/extensions/i18n/fr.json",
     *       "meta": {
     *         "locale": "fr"
     *       }
     *     }
     *   ]
     * }
     */
    getMeta(): IExtensionMeta | null;

    /**
     * Returns a Promise which resolves extension contribution module
     * that implements extension spec.
     */
    getModule(): Promise<IExtensionModule>;

    register(options: IContributionOptions): void;

    unregister(): void;
}

export interface IExtensionRegistry extends IBase {
    addExtension(
        contributorContext: IPluginContext,
        descriptor: IContributingExtensionDescriptor,
        module: IExtensionModule | null,
        options: IContributionOptions
    ): IExtensionRegistration;
    addExtensionRegistration(registration: IExtensionRegistration): void;
    getExtensionRegistrations(user: IPluginContext, extensionId: string): IExtensionRegistration[];
    getExtensions(user: IPluginContext, extensionId: string): Promise<IExtensionModuleQueryResult[]>;
    registerContributableExtension(descriptor: IContributableExtensionDescriptor): void;
    removeExtensionRegistration(registration: IExtensionRegistration): void;
    unregisterExtensions(contributor: IPluginContext): void;
}

export interface IExtensionResolver extends IBase {
    resolve(): Promise<void>;
}

export interface IManifest extends IBase {
    readonly name: string;
    readonly version: string;
    getDependencyList(): string[];
    getDependencyMap(): IKeyString;
    getDependencyVersionByName(packageName: string): string;
    getId(): string;
    getMeta(): IOrbitalPackageJson;
    getOwnContributableExtensionDescriptor(extensionId: string): IContributableExtensionDescriptor | null;
    getOwnContributableExtensionDescriptors(): IContributableExtensionDescriptor[];

    /**
     * Returns an IContributableServiceDescriptor of this plugin with the given service id.
     */
    getOwnContributableServiceDescriptor(serviceId: string): IContributableServiceDescriptor | null;
    getOwnContributableServiceDescriptors(): IContributableServiceDescriptor[];
    getOwnContributingExtensionDescriptors(): IContributingExtensionDescriptor[];
    getOwnContributingServiceDescriptors(): IContributingServiceDescriptor[];
    getResolution(): IOrbitalPackageResolution;
    getState(): PackageState;
    hasPolicy(policy: IPolicyType): boolean;
    hasState(packageState: PackageState): boolean;
    resolved(): boolean;
    update(serializableManifest: ISerializableManifest): void;
}

export interface IPlugin extends ILogBase {

    /**
     * Returns this plugin's {@link IPluginContext}. The returned
     * {@link IPluginContext} can be used by the caller to act
     * on behalf of this plugin.
     *
     * If this plugin is not in the {@link PluginState.STARTING},
     * {@link PluginState.ACTIVE}, or {@link PluginState.STOPPING} states,
     * then this plugin has no valid {@code PluginContext} and throws an Error.
     *
     * @throws {@link SecurityException} If the caller does not have
     *         the appropriate permission.
     */
    getContext(): IPluginContext;

    /**
     * Returns the package id. The format is of [packageName]@[packageVersion]
     */
    getId(): string;

    getManifest(): IManifest;

    /**
     * @return Returns the package name.
     */
    getName(): string;

    /**
     * Returns the state of this plugin.
     * @see {PluginState}
     */
    getState(): PluginState;

    /**
     * Returns the package version.
     */
    getVersion(): string;

    /**
     * Returns true if this plugin is in state of the given bit-wise states.
     */
    isInStates(states: PluginState): boolean;

    refresh(): void;

    setState(state: PluginState): void;

    /**
     * Starts this plugin.
     * Starting will be deferred until all dependencies are active.
     */
    start(options?: IPluginStartOptions): void;

    stop(): void;
}

/**
 * A plugins's execution context within the Framework.
 * The context is used to interact with the Framework.
 */
export interface IPluginContext extends IBase {
    close(): void;

    forEachContributors(callback: (contributor: IPluginContext) => void): void;

    getAsyncService(serviceId: string, options?: IServiceCallOptions): Promise<IServiceClosure>;

    /**
     * Returns IContributableExtensionDescriptor for the given extensionId.
     * Note that the IContributableExtensionDescriptor belongs to the plugin's IManifest
     * referencing the extensionId.
     */
    getContributableExtensionDescriptor(extensionId: string): IContributableExtensionDescriptor | null;

    /**
     * Returns IContributableServiceDescriptor for the given serviceId.
     * Note that the IContributableServiceDescriptor belongs to the plugin's IManifest
     * referencing the serviceId.
     */
    getContributableServiceDescriptor(serviceId: string): IContributableServiceDescriptor | null;
    getDependencyVersionByName(packageName: string): string;

    /**
     * Returns an array of {@link IExtensionRegistration}
     * with the given extensionId.
     * @example
     * refreshAside() {
     *    this.context.getExtensionRegistrations('examples.shop.layout:aside')
     *        .forEach((registration) => {
     *            const module = registration.getModule();
     *            const contributor = registration.getContributor();
     *        });
     * }
     */
    getExtensionRegistrations(extensionId: string): IExtensionRegistration[];

    /**
     * Returns a Promise which will resolve extensions
     * with the given extensionId.
     * @example
     * refreshAside() {
     *    const contributions = [];
     *    this.context.getExtensions('examples.shop.layout:aside')
     *        .then((extensions) => {
     *            extensions.forEach((module) => {
     *                contributions.push(module.getView());
     *            });
     *            const aside = this.root.querySelector('aside');
     *            aside.innerHTML = contributions.join('\n');
     *        });
     * }
     * @param {string} extensionId
     * @return {Promise}
     */
    getExtensions(extensionId: string): Promise<IExtensionModuleQueryResult[]>;

    /**
     * Convenient method.
     */
    getId(): string;

    /**
     * Returns this context's {IPlugin} instance.
     */
    getPlugin(): IPlugin;

    getPluginName(): string;
    getPluginVersion(): string;

    /**
     * The returned object is valid at the time of the
     * call to this method. However as the Framework is
     * a very dynamic environment, services can be modified
     * or unregistered at any time.
     *
     * If multiple such services exist, the service with the
     * top priority (highest priority number) is returned.
     *
     * If there is a tie in priority, the service with the
     * lowest service id; that is, the service
     * that was registered first is returned.
     *
     * This method returns Service instance which contains
     * an actual service implementation.
     * the implementation inside of the Service instance
     * can be changed by ServiceRegistry's
     * register, unregister event.
     *
     * @example
     * import asideView from '../views/asideView';
     *
     * export default {
     *     getView(productsContext) {
     *         const api = productsContext.getService('examples.shop.resources:api');
     *         const items = api.getProductCategories().map((name) => {
     *             return `<li><a href='#products/${name}'>${name}</a></li>`;
     *         });
     *         return asideView.replace('{ITEMS}', items.join('\n'));
     *     }
     * };
     */
    getService(serviceId: string, options?: IServiceCallOptions): IServiceClosure;

    /**
     * Returns this context's ServiceRegistration array for all
     * services it is using or empty array if this bundle is not
     * using any services. A context is considered to be using
     * a service if its use count for that service is greater than zero.
     */
    getServicesInUse(): IServiceRegistration[];

    publishService(serviceId: string, service: object, options: IServicePublishingOptions): IServiceRegistration;

    start(): void;
    stop(): void;

    /**
     * Unregisters a service with the given ServiceRegistration.
     * which is registered by this PluginContext's Plugin.
     * A service can only be unregistered by the
     * service provider (an implementer or a service-contributor).
     * This method is automatically called
     * When the plugin is about to stop.
     */
    unpublishService(serviceRegistration: IServiceRegistration): void;
}

export interface IPluginRegistration {
    /**
     * An {@link IPluginContext} which started the installation process.
     * The initiator should have proper permissions to install a package.
     * This means the initiator can get the 'orbital.core:package-manager' service.
     */
    getInitiator(): IPluginContext;
    getInstalledDate(): number;
    getPlugin(): IPlugin;
}

export interface IPluginRegistry {
    /**
     * Returns the array of plugins which this plugin requires.
     */
    getDependencies(plugin: IPlugin): IPlugin[];
    getPluginById(packageId: string): IPlugin | null;
    getPluginByNameAndVersion(packageName: string, packageVersion: string): IPlugin | null;
    getPlugins(): IPlugin[];
    getPluginsByName(packageName: string): IPlugin[];
    getPluginsRequires(requiredPlugin: IPlugin): IPlugin[];
    /**
     * @throws {InstallError} If the plug-in you want to install
     * already exists, it throws an error.
     */
    install(initiator: IPlugin, plugin: IPlugin): Promise<IPlugin>;
    uninstall(packageId: string): Promise<void>;
}

export interface IPluginStartOptions {
    boot?: boolean;
    contributors?: 'all' | 'active';
    force?: boolean;
}

export interface IServiceClosure {
    [key: string]: any;
}

export interface IServiceCallOptions extends IContributionOptions {
    orderBy?: {
        priority?: IOrderBy,
        uid?: IOrderBy
    };
    version?: string;
}

export interface IServicePublishingOptions extends IContributionOptions {
    type?: 'super' | '';
}

export interface IServiceRegistry extends IBase {
    addServiceRegistration(serviceRegistration: IServiceRegistration): void;

    /**
     * Add contributing service descriptor which will be used later
     * when the service is about to be used.
     */
    enqueueLazyService(context: IPluginContext, descriptor: IContributingServiceDescriptor): void;

    getAsyncService(user: IPluginContext, serviceId: string, options?: IServiceCallOptions): Promise<IServiceClosure>;

    /**
     * @returns An array of IServiceRegistration which the given context uses of.
     */
    getRegistrationsByUser(context: IPluginContext): IServiceRegistration[];

    /**
     * This method returns ServiceClosure instance which contains
     * an actual service implementation. The Service instance inside of the IServiceClosure
     * can be changed by IServiceRegistry's register, unregister event at anytime.
     */
    getService(user: IPluginContext, serviceId: string, options: IServiceCallOptions): IServiceClosure;

    lookupCurrentRegistration(serviceId: string, options?: IServiceCallOptions): IServiceRegistration | null;

    /**
     * Returns an array of IServiceRegistration or an empty array.
     */
    lookupCurrentRegistrations(serviceId: string, options?: IServiceCallOptions): IServiceRegistration[];

    /**
     * Registers the specified service object
     * with the specified options into the Framework.
     */
    register(publisherCtx: IPluginContext, serviceId: string, service: object, options: IServicePublishingOptions): IServiceRegistration;

    /**
     * Called when the IPluginContext is closing to
     * unget all services currently used by the plugin.
     * @param context  The IPluginContext of the closing plugin.
     */
    releaseServicesInUse(context: IPluginContext): void;

    /**
     * Removes ServiceRegistration from registry.
     */
    removeServiceRegistration(serviceRegistration: IServiceRegistration): void;

    /**
     * Unregisters a service with the given ServiceRegistration.
     * which is registered by this PluginContext's Plugin.
     * A service can only be unregistered by the
     * service provider (an implementer or a spec-consumer).
     * This method is automatically called
     * When the plugin is about to stop.
     */
    unregister(registration: IServiceRegistration): void;

    /**
     * Called when the Context is closing to unregister
     * all services currently registered by the plugin.
     * @param context  The IPluginContext of the closing plugin.
     */
    unregisterServices(context: IPluginContext): void;
}

export interface IServiceResolver extends IBase {
    resolve(): Promise<void>;
}

export interface IServiceRegistration extends IContributionRegistration {

    options: IServicePublishingOptions;
    priority: number;
    state: ContributionRegistrationState;
    readonly uid: number;

    /**
     * Adds a new user for this Service.
     */
    addUser(user: IPluginContext): void;
    getContributableDescriptor(): IContributableServiceDescriptor;

    /**
     * Returns the IPluginContext that registered the service
     * referenced by this ServiceRegistration.
     */
    getPublisher(): IPluginContext;

    /**
     * Returns the serviceId.
     */
    getServiceId(): string;

    /**
     * Returns the service implementation class's instance.
     */
    getServiceInstance(): IKeyValue;

    /**
     * Returns specification based on the package.json.
     */
    getServiceSpec(): IContributableSpec;

    /**
     * Returns the array of IPluginContext that are using the service
     * referenced by this ServiceRegistration.
     */
    getUsers(): IPluginContext[];
    register(options: IServicePublishingOptions): void;
    removeUser(user: IPluginContext): void;
    unregister(): void;
}

export interface ISystemContainer {
    getContributionCache(): IContributionCache;
    getExtensionRegistry(): IExtensionRegistry;
    getPluginRegistry(): IPluginRegistry;
    getServiceRegistry(): IServiceRegistry;
    getSystemPlugin(): ISystemPlugin;
    init(system: ISystemPlugin): void;
}

export interface ISystemContext extends IPluginContext {
    createSystemServices(): void;
    getRuntimeProjectConfig(): IRuntimeProjectConfig;
}

export interface ISystemPlugin extends IPlugin {
    getContext(): ISystemContext;
    install(): Promise<IPlugin>;
}
