import {Base, clone, freeze, trace} from 'orbital.core.common';
import {
    ContributionRegistrationState,
    ExtensionRegistryEvent,
    IContributableExtensionDescriptor,
    IContributableSpec,
    IContributingExtensionDescriptor,
    IContributionOptions,
    IExtensionMeta,
    IExtensionModule,
    IExtensionRegistration,
    IExtensionRegistry,
    IPlugin,
    IPluginContext,
    ISystemContainer,
    PluginContextEvent
} from 'orbital.core.types';
import ExtensionError from '../exceptions/ExtensionError';

let extensionUid = 0;

class ExtensionRegistration extends Base implements IExtensionRegistration {

    options: IContributionOptions = {};
    priority: number = 0;
    state: ContributionRegistrationState = 0;
    readonly uid: number;

    private readonly _contributingDescriptor: IContributingExtensionDescriptor;
    private readonly _contributorCtx: IPluginContext;
    private readonly _extensionId: string;
    private readonly _getModule: () => Promise<IExtensionModule>;
    private readonly _getSpecProvider: () => IPlugin;
    // Without using 'eager' policies, the value of 'module' is null.
    // The module value is retrieved lazily by IContributionCache.
    private readonly _module: IExtensionModule | null;
    private readonly _register: (options: IContributionOptions) => void;
    private readonly _unregister: () => void;

    /**
     * Registers a new ExtensionRegistration object
     * with the specified options into the Framework.
     */
    constructor(registry: IExtensionRegistry, container: ISystemContainer,
                contributorCtx: IPluginContext,
                contributingDescriptor: IContributingExtensionDescriptor,
                module: IExtensionModule | null) {
        super();
        this._contributingDescriptor = contributingDescriptor;
        this._contributorCtx = contributorCtx;
        this._extensionId = contributingDescriptor.id;
        this._module = module;
        this.uid = ++extensionUid;

        this._getModule = (): Promise<IExtensionModule> => {
            if (this._module) {
                return Promise.resolve(this._module);
            } else {
                const context = this.getContributorContext();
                const cache = container.getContributionCache();
                return cache.getExtensionModule(context,
                    this.getContributingDescriptor());
            }
        };

        this._getSpecProvider = (): IPlugin => {
            const {
                id: extensionId,
                specProvider: {name, version}
            } = this.getContributingDescriptor();
            const provider = container.getPluginRegistry()
                .getPluginByNameAndVersion(name, version);
            if (!provider) {
                throw new ExtensionError(
                    ExtensionError.SPEC_PROVIDER_NOT_FOUND,
                    name, version, extensionId
                );
            }
            return provider;
        };

        this._register = function (options: IContributionOptions = {}) {
            // TODO context.checkValid();
            this.options = this._createOptions(options);
            registry.addExtensionRegistration(this);
            this.state = ContributionRegistrationState.REGISTERED;
            registry.emit(ExtensionRegistryEvent.registered, this);
            this.getSpecProvider().getContext()
                .emit(PluginContextEvent.extensionRegistered, this);
        };

        this._unregister = function () {
            if (this.state !== ContributionRegistrationState.REGISTERED) {
                throw new ExtensionError(ExtensionError.ALREADY_UNREG);
            }
            this.state = ContributionRegistrationState.UNREGISTERING;
            registry.emit(ExtensionRegistryEvent.unregistering, this);
            registry.removeExtensionRegistration(this);
            this.state = ContributionRegistrationState.UNREGISTERED;
            registry.emit(ExtensionRegistryEvent.unregistered, this);
            this.getSpecProvider().getContext()
                .emit(PluginContextEvent.extensionUnregistered, this);
        };

        freeze(this, [
            '_contributingDescriptor',
            '_contributorCtx',
            '_extensionId',
            '_module',
            '_register',
            '_unregister',
            'uid'
        ]);
    }

    getContributableDescriptor(): IContributableExtensionDescriptor {
        const descriptor = this.getSpecProvider().getManifest()
            .getOwnContributableExtensionDescriptor(this._extensionId);
        if (!descriptor) {
            throw new ExtensionError(
                ExtensionError.CONTRIBUTABLE_EXTENSION_NOT_FOUND, this._extensionId
            );
        }
        return descriptor;
    }

    getContributingDescriptor(): IContributingExtensionDescriptor {
        return this._contributingDescriptor;
    }

    getContributorContext() {
        return this._contributorCtx;
    }

    getExtensionId() {
        return this._extensionId;
    }

    getExtensionSpec(): IContributableSpec {
        return this.getContributableDescriptor().spec;
    }

    getMeta(): IExtensionMeta | null {
        return this.getContributingDescriptor().meta;
    }

    getModule(): Promise<IExtensionModule> {
        return this._getModule();
    }

    getSpecProvider(): IPlugin {
        return this._getSpecProvider();
    }

    getSpecProviderName() {
        return this.getContributableDescriptor().specProvider.name;
    }

    getSpecProviderVersion() {
        return this.getContributableDescriptor().specProvider.version;
    }

    @trace
    register(options: IContributionOptions = {}) {
        this._register(options);
    }

    toString() {
        return '<ExtensionRegistration>('
            + this.getContributorContext().getPlugin().getId() + '\'s '
            + this.getContributableDescriptor().urn + ')';
    }

    @trace
    unregister() {
        this._unregister();
    }

    private _createOptions(options: IContributionOptions) {
        if (!options) {
            return {};
        }
        const props: IContributionOptions = clone(options);
        const {priority} = options;
        if (typeof priority === 'number') {
            if (priority < 0) {
                const pluginName = this.getContributorContext().getPluginName();
                const extId = this.getExtensionId();
                throw new ExtensionError(
                    ExtensionError.OUTOFBOUND_PRIORITY, pluginName, extId);
            }
            this.priority = priority;
        }
        return props;
    }
}

export default ExtensionRegistration;
