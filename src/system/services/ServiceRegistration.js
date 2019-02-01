/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Base from '../bases/Base';
import ServiceError from '../exceptions/ServiceError';
import Manifest from '../Manifest';

let serviceUid = 0;

/**
 * Represents a service contribution.
 */
class ServiceRegistration extends Base {

    constructor(registry, publisher, version, serviceId, service) {
        super();
        const providerName = Manifest.getPackageName(serviceId);
        const specProvider = publisher
            .getPluginByNameAndVersion(providerName, version);
        this.define('_descriptor', specProvider.getManifest()
            .getContributableServiceDescriptor(serviceId));
        this.define('_registry', registry);
        this.define('_context', publisher);
        this.define('_service', service);
        this.define('_users', []);
        this.define('id', ++serviceUid);
        this.define('state', null, {
            writable: true
        });
        this.define('options', {}, {
            writable: true
        });
    }

    register(options) {
        const registry = this._registry;
        const State = ServiceRegistration.State;
        //TODO context.checkValid();
        this.options = this._createOptions(options);
        registry.addServiceRegistration(this);
        this.state = State.REGISTERED;
        registry.emit('registered', this);
    }

    unregister() {
        const registry = this._registry;
        const State = ServiceRegistration.State;
        if (this.state !== State.REGISTERED) {
            throw new ServiceError(ServiceError.ALREADY_UNREG);
        }
        this.state = State.UNREGISTERING;
        registry.emit('unregistering', this);
        registry.removeServiceRegistration(this);
        this._releaseUsers();
        this.state = State.UNREGISTERED;
        registry.emit('unregistered', this);
    }

    /**
     * Adds a new user for this Service.
     * @param {PluginContext} user
     */
    addUser(user) {
        this._users.push(user);
    }

    /**
     * Removes a user from this service's users.
     * @param {PluginContext} user
     */
    removeUser(user) {
        const users = this._users;
        const index = users.indexOf(user);
        if (index > -1) {
            users.splice(index, 1);
        }
        this.emit('userRemoved', user, this);
    }

    /**
     * Returns the PluginContexts that are using the service
     * referenced by this ServiceRegistration.
     * @return {Array.<PluginContext>}
     */
    getUsers() {
        return this._users;
    }

    /**
     * Returns the PluginContext that registered the service
     * referenced by this ServiceRegistration.
     * @return {PluginContext}
     */
    getPublisher() {
        return this._context;
    }

    /**
     * Returns the ServiceClosure which wraps the service implementaion.
     * @return {ServiceClosure}
     */
    getService() {
        return this._service;
    }

    /**
     * Returns contributable {@link ServiceDescriptor}
     * for this contribution.
     * @returns {Object}
     */
    getServiceDescriptor() {
        return this._descriptor;
    }

    /**
     * Returns contributable spec provider packages's name.
     * @returns {string}
     */
    getSpecProviderName() {
        return this.getServiceDescriptor().provider;
    }

    /**
     * Returns contributable spec provider packages's version.
     * @returns {string}
     */
    getSpecProviderVersion() {
        return this.getServiceDescriptor().version;
    }

    /**
     * Returns contributable service point id.
     * @returns {string}
     */
    getServiceId() {
        return this.getServiceDescriptor().id;
    }

    /**
     * Returns contributable spec based on the package.json.
     * @returns {string}
     */
    getServiceSpec() {
        return this.getServiceDescriptor().spec;
    }

    toString() {
        return '<ServiceRegistration>('
            + this.getPublisher().getPlugin().getId() + "'s "
            + this.getServiceDescriptor().getServicePoint() + ')';
    }

    _releaseUsers() {
        const users = this._users.concat();
        while (users.length) {
            const user = users.pop();
            this.removeUser(user);
        }
    }

    _createOptions(options) {
        const props = {};
        if (!options) {
            options = {};
        }
        Reflect.ownKeys(options).forEach((key) => {
            props[key] = options[key];
        });
        if (typeof options.priority === 'number') {
            if (options.type !== 'super' && options.priority < 0) {
                throw new ServiceError(ServiceError.OUTOFBOUND_PRIORITY);
            }
            this.define('priority', options.priority);
        } else {
            this.define('priority', 0);
        }
        return props;
    }
}

ServiceRegistration.State = {
    REGISTERED: 1,
    UNREGISTERING: 1 << 1,
    UNREGISTERED: 1 << 2
};

export default ServiceRegistration;
