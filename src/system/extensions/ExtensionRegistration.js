/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Base from '../bases/Base';
import ExtensionError from '../exceptions/ExtensionError';
import Manifest from '../Manifest';

let extensionUid = 0;

/**
 * Represents an extension contribution.
 */
class ExtensionRegistration extends Base {

    constructor(registry, contributor, descriptor, module) {
        super();
        const extensionId = descriptor.id;
        const providerName = Manifest.getPackageName(extensionId);
        const version = contributor.getDependencyVersion(providerName);
        const specProvider = contributor
            .getPluginByNameAndVersion(providerName, version);
        this.define('_contributingDescriptor', descriptor);
        this.define('_contributableDescriptor', specProvider.getManifest()
            .getContributableExtensionDescriptor(extensionId));
        this.define('_registry', registry);
        this.define('_context', contributor);
        this.define('_module', module);
        this.define('id', ++extensionUid);
        this.define('state', null, {
            writable: true
        });
    }

    register(options) {
        const registry = this._registry;
        const State = ExtensionRegistration.State;
        //TODO context.checkValid();
        this.options = this._createOptions(options);
        registry.addExtensionRegistration(this);
        this.state = State.REGISTERED;
        registry.emit('registered', this);
    }

    unregister() {
        const registry = this._registry;
        const State = ExtensionRegistration.State;
        if (this.state !== State.REGISTERED) {
            throw new ExtensionError(ExtensionError.ALREADY_UNREG);
        }
        this.state = State.UNREGISTERING;
        registry.emit('unregistering', this);
        registry.removeExtensionRegistration(this);
        this.state = State.UNREGISTERED;
        registry.emit('unregistered', this);
    }

    _createOptions(options) {
        const props = {};
        if (!options) {
            return props;
        }
        Reflect.ownKeys(options).forEach((key) => {
            props[key] = options[key];
        });
        if (typeof options.priority === 'number') {
            if (options.priority < 0) {
                const pluginName = this.getContributor().getPluginName();
                const extId = this.getExtensionId();
                throw new ExtensionError(
                    ExtensionError.OUTOFBOUND_PRIORITY, pluginName, extId);
            }
            this.define('priority', options.priority);
        } else {
            this.define('priority', 0);
        }
        return props;
    }

    getContributingDescriptor() {
        return this._contributingDescriptor;
    }

    /**
     * Returns contributor plugin's {@link PluginContext}
     * for this extension contribution.
     * @returns {PluginContext}
     */
    getContributor() {
        return this._context;
    }

    getMeta() {
        return this.getContributingDescriptor().meta;
    }

    /**
     * Returns extension contribution module object
     * which implements contributable spec.
     * @returns {Object}
     */
    getModule(sync = false) {
        if (sync) {
            return this._module;
        }
        return Promise.resolve(this._module);
    }

    /**
     * Returns contributable {@link ExtensionDescriptor}
     * for this contribution.
     * @returns {Object}
     */
    getExtensionDescriptor() {
        return this._contributableDescriptor;
    }

    /**
     * Returns contributable spec provider packages's name.
     * @returns {string}
     */
    getSpecProviderName() {
        return this.getExtensionDescriptor().provider;
    }

    /**
     * Returns contributable spec provider packages's version.
     * @returns {string}
     */
    getSpecProviderVersion() {
        return this.getExtensionDescriptor().version;
    }

    /**
     * Returns contributable extension point id.
     * @returns {string}
     */
    getExtensionId() {
        return this.getExtensionDescriptor().id;
    }

    /**
     * Returns contributable spec based on the package.json.
     * @returns {string}
     */
    getExtensionSpec() {
        return this.getExtensionDescriptor().spec;
    }

    toString() {
        return '<ExtensionRegistration>('
            + this.getContributor().getPlugin().getId() + "'s "
            + this.getExtensionDescriptor().getExtensionPoint() + ')';
    }
}

ExtensionRegistration.State = {
    REGISTERED: 1,
    UNREGISTERING: 1 << 1,
    UNREGISTERED: 1 << 2
};

export default ExtensionRegistration;
