import {Base, clone, freeze, getPackageNameFromId, trace} from 'orbital.core.common';
import {
    ContributionRegistrationState,
    IContributableServiceDescriptor,
    IContributableSpec,
    IPlugin,
    IPluginContext,
    IServicePublishingOptions,
    IServiceRegistration,
    IServiceRegistry,
    ISystemContainer,
    PluginContextEvent,
    ServiceRegistrationEvent,
    ServiceRegistryEvent
} from 'orbital.core.types';
import ServiceError from '../exceptions/ServiceError';

let serviceUid = 0;

/**
 * Represents a service contribution.
 */
class ServiceRegistration extends Base implements IServiceRegistration {

    options: IServicePublishingOptions = {};
    priority: number = 0;
    state: ContributionRegistrationState = 0;
    readonly uid: number;

    private readonly _getSpecProvider: () => IPlugin;
    private readonly _publisherCtx: IPluginContext;
    private readonly _register: (options: IServicePublishingOptions) => void;
    private readonly _service: object;
    private readonly _serviceId: string;
    private readonly _specProviderName: string;
    private readonly _specProviderVersion: string;
    private readonly _unregister: () => void;
    private readonly _users: IPluginContext[] = []; // TODO SECURITY

    /**
     * Registers the specified service object
     * with the specified options into the Framework.
     */
    constructor(registry: IServiceRegistry, container: ISystemContainer,
                publisherCtx: IPluginContext, serviceId: string, service: object) {
        super();
        this._publisherCtx = publisherCtx;
        this._service = service;
        this._serviceId = serviceId;
        this._specProviderName = getPackageNameFromId(serviceId);
        this._specProviderVersion = publisherCtx
            .getDependencyVersionByName(this._specProviderName);
        this.uid = ++serviceUid;

        this._getSpecProvider = (): IPlugin => {
            const provider = container.getPluginRegistry().getPluginByNameAndVersion(
                this._specProviderName, this._specProviderVersion
            );
            if (!provider) {
                throw new ServiceError(
                    ServiceError.SPEC_PROVIDER_NOT_FOUND,
                    this._specProviderName, this._specProviderVersion,
                    this._serviceId
                );
            }
            return provider;
        };

        this._register = function (options: IServicePublishingOptions) {
            // TODO context.checkValid();
            this.options = this._createOptions(options);
            registry.addServiceRegistration(this);
            this.state = ContributionRegistrationState.REGISTERED;
            registry.emit(ServiceRegistryEvent.registered, this);
            this.getSpecProvider().getContext()
                .emit(PluginContextEvent.serviceRegistered, this);
        };

        this._unregister = function () {
            if (this.state !== ContributionRegistrationState.REGISTERED) {
                throw new ServiceError(ServiceError.ALREADY_UNREG);
            }
            this.state = ContributionRegistrationState.UNREGISTERING;
            registry.emit(ServiceRegistryEvent.unregistering, this);
            registry.removeServiceRegistration(this);
            this._releaseUsers();
            this.state = ContributionRegistrationState.UNREGISTERED;
            registry.emit(ServiceRegistryEvent.unregistered, this);
            this.getSpecProvider().getContext()
                .emit(PluginContextEvent.serviceUnregistered, this);
        };

        freeze(this, [
            '_publisherCtx',
            '_register',
            '_service',
            '_serviceId',
            '_specProviderName',
            '_specProviderVersion',
            '_unregister',
            '_users',
            'uid'
        ]);
    }

    @trace
    addUser(user: IPluginContext) {
        this._users.push(user);
    }

    getContributableDescriptor(): IContributableServiceDescriptor {
        const specProvider = this.getSpecProvider();
        const descriptor = specProvider.getManifest()
            .getOwnContributableServiceDescriptor(this._serviceId);
        if (!descriptor) {
            throw new ServiceError(
                ServiceError.CONTRIBUTABLE_SERVICE_NOT_FOUND, this._serviceId
            );
        }
        return descriptor;
    }

    getPublisher(): IPluginContext {
        return this._publisherCtx;
    }

    getServiceId(): string {
        return this._serviceId;
    }

    getServiceInstance(): object {
        return this._service;
    }

    getServiceSpec(): IContributableSpec {
        return this.getContributableDescriptor().spec;
    }

    getSpecProvider(): IPlugin {
        return this._getSpecProvider();
    }

    getSpecProviderName(): string {
        return this._specProviderName;
    }

    getSpecProviderVersion(): string {
        return this._specProviderVersion;
    }

    getUsers(): IPluginContext[] {
        return this._users;
    }

    @trace
    register(options: IServicePublishingOptions) {
        this._register(options);
    }

    /**
     * Removes a user from this service's users.
     */
    @trace
    removeUser(user: IPluginContext) {
        const users = this._users;
        const index = users.indexOf(user);
        if (index > -1) {
            users.splice(index, 1);
        }
        this.emit(ServiceRegistrationEvent.userRemoved, user, this);
    }

    toString() {
        return '<ServiceRegistration>('
            + this.getServiceId() + ' published by '
            + this.getPublisher().getPlugin().getId() + ')';
    }

    @trace
    unregister() {
        this._unregister();
    }

    private _createOptions(options: IServicePublishingOptions) {
        if (!options) {
            return {};
        }
        const props: IServicePublishingOptions = clone(options);
        if (typeof options.priority === 'number') {
            if (options.type !== 'super' && options.priority < 0) {
                throw new ServiceError(ServiceError.OUTOFBOUND_PRIORITY);
            }
            this.priority = options.priority;
        }
        return props;
    }

    private _releaseUsers() {
        const users = this._users.concat();
        while (users.length) {
            const user = users.pop();
            if (user) {
                this.removeUser(user);
            }
        }
    }
}

export default ServiceRegistration;
