/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import nextTick from '../util/nextTick';
import Notice from '../util/Notice';
import Base from './bases/Base';
import PluginState from './PluginState';
import ExportsRegistry from './resolution/ExportsRegistry';

/**
 * A plugins's execution context within the Framework.
 * The context is used to interact with the Framework.
 */
class PluginContext extends Base {

    /**
     * @param {Plugin} plugin
     * @param {SystemContainer} container
     */
    constructor(plugin, container) {
        super();
        this.define('_plugin', plugin);
        this.define('_syscon', container);
        this.define('_activator', null, {
            writable: true
        });
        this.define('_pluginReg', container.getPluginRegistry());
        this.define('_extensionReg', container.getExtensionRegistry());
        this.define('_servicesInUse', new Map());
        this._listenRegistry();
    }

    close(resolve) {
        const container = this.getSystemContainer();
        const serviceRegistry = container.getServiceRegistry();
        const extensionRegistry = container.getExtensionRegistry();

        // TODO serviceRegistry.removeAllServiceListeners(this);
        serviceRegistry.unregisterServices(this);
        serviceRegistry.releaseServicesInUse(this);
        extensionRegistry.unregisterExtensions(this);
        resolve(this.getPlugin());
    }

    getDependencyVersion(packageName) {
        if (packageName === this.getPlugin().getName()) {
            return this.getPlugin().getVersion();
        }
        const manifest = this.getPlugin().getManifest();
        return manifest.dependencies[packageName];
    }

    /**
     * Returns array of {@link ExtensionRegistration}
     * with the given extensionId.
     * @example
     * refreshAside() {
     *    const contributions = [];
     *    this.context.getExtensions('examples.shop.layout:aside')
     *        .forEach((ext) => {
     *            contributions.push(ext.getView(this.context));
     *        });
     *    const aside = this.root.querySelector('aside');
     *    aside.innerHTML = contributions.join('\n');
     * }
     * @param {string} extensionId
     * @returns {Array.<ExtensionRegistration>}
     */
    getExtensions(extensionId) {
        const container = this.getSystemContainer();
        const registry = container.getExtensionRegistry();
        return registry.getExtensions(extensionId);
    }

    getExtensionRegistrations(extensionId) {
        const container = this.getSystemContainer();
        return container.getExtensionRegistry()
            .getExtensionRegistrations(extensionId);
    }

    /**
     * Convenient method which returns ExtensionRegistry.
     * @returns {ExtensionRegistry}
     */
    getExtensionRegistry() {
        return this._extensionReg;
    }

    /**
     * Returns the given context's Plugin object.
     * @returns {Plugin}
     */
    getPlugin() {
        return this._plugin;
    }

    /**
     * Returns the Plugin instance with the given package id.
     * The format is of [packageName]@[packageVersion]
     * @param {string} id package id
     * @returns {Plugin}
     */
    getPluginById(id) {
        return this.getPluginRegistry().getPluginById(id);
    }

    /**
     * Returns the Plugin instance with the given package name and version.
     * @param {string} name package name
     * @param {string} version package version
     * @returns {Plugin}
     */
    getPluginByNameAndVersion(name, version) {
        return this.getPluginRegistry()
            .getPluginByNameAndVersion(name, version);
    }

    /**
     * Convenient method which returns PluginRegistry.
     * @returns {PluginRegistry}
     */
    getPluginRegistry() {
        return this._pluginReg;
    }

    /**
     * Returns the array of all Plugins registered.
     * @example
     * onStart(context) {
     *     this.context = context;
     *     context.getPlugins().forEach((plugin) => {
     *         plugin.on('stateChange', this.stateListener);
     *     });
     * }
     * @returns {Array.<Plugin>}
     */
    getPlugins() {
        return this.getPluginRegistry().getPlugins();
    }

    /**
     * Returns the array of Plugins with the given package name.
     * Because packages with same name but different version
     * can be installed together.
     * @param {string} name package name
     * @returns {Array.<Plugin>}
     */
    getPluginsByName(name) {
        return this.getPluginRegistry().getPluginsByName(name);
    }

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
     * export default {
     *    getView(productsContext) {
     *        const api = productsContext.getService('examples.shop.resources:api');
     *        const items = api.getProductCategories().map((name) => {
     *            return `<li><a href='#products/${name}'>${name}</a></li>`;
     *        });
     *        return asideView.replace('{ITEMS}', items.join('\n'));
     *    }
     * };
     *
     * @param {string} serviceId
     * @param {Object} options
     * @property {string} version
     * @property {string} vendor
     * @property {Object} orderBy
     * @return {ServiceClosure}
     */
    getService(serviceId, options) {
        const container = this.getSystemContainer();
        const registry = container.getServiceRegistry();
        return registry.getService(
            this, serviceId, options);
    }

    getServicesInUse() {
        return this._servicesInUse;
    }

    getSystemContainer() {
        return this._syscon;
    }

    /**
     * @return {ServiceRegistration}
     */
    publishService(serviceId, service, options) {
        //TODO checkValid();
        const container = this.getSystemContainer();
        const registry = container.getServiceRegistry();
        return registry.register(this, serviceId, service, options);
    }

    /**
     * Unregisters a service with the given ServiceRegistration.
     * which is registered by this PluginContext's Plugin.
     * A service can only be unregistered by the
     * service provider (an implementer or a spec-consumer).
     * This method is automatically called
     * When the plugin is about to stop.
     *
     * @param {ServiceRegistration} registration
     */
    unpublishService(registration) {
        registration.unregister();
    }

    /**
     * Installs plugin with the given package manifest object.
     * The manifest object is generated by {@link ManifestLoader}
     * @param {Object} manifest
     * @return {Promise}
     */
    installPlugin(manifest) {
        this.debug('installPlugin(manifest)', manifest);
        return new Promise((resolve/*, reject*/) => {
            const container = this.getSystemContainer();
            const registry = container.getPluginRegistry();
            try {
                const plugin = new Plugin(manifest, container);
                const installed = registry.install(
                    this.getPlugin(), plugin);
                resolve(installed);
            } catch (e) {
                Notice.warn(this, e);
                resolve(e);
            }
        });
    }

    /**
     * Uninstalls the plugin with the given package id.
     * 1) stop the plugin
     * 2) remove from plugin registry.
     *    - remove from ServiceRegistry
     *    - remove from ExtensionRegistry
     *    - remove from ExportsRegistry
     *    - remove from each plugins' manifest's dependencies
     * @param {string} id
     * @return {Promise}
     */
    uninstallPlugin(id) {
        this.debug('uninstallPlugin(' + id + ')');
        return new Promise((resolve, reject) => {
            try {
                this.getPluginRegistry()
                    .uninstall(this.getPluginById(id))
                    .then(() => {
                        resolve(id);
                    });
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Call plugin's PluginActivator.start()
     * This method is called by Plugin.startWorker().
     */
    start() {
        this.debug('start()');
        try {
            const {ACTIVE} = PluginState;
            const plugin = this.getPlugin();
            const manifest = plugin.getManifest();
            if (manifest.activator) {
                this._loadActivator((activator) => {
                    this._activator = activator;
                    nextTick(() => {
                        if (typeof activator.onStart === 'function') {
                            activator.onStart(this);
                        }
                        plugin.setState(ACTIVE);
                    });
                });
            } else {
                plugin.setState(ACTIVE);
            }
        } catch (e) {
            Notice.warn(this, e);
        }
    }

    stop() {
        this.debug('stop()');
        try {
            const {RESOLVED} = PluginState;
            const plugin = this.getPlugin();
            const manifest = plugin.getManifest();
            if (manifest.activator) {
                if (this._activator) {
                    if (typeof this._activator.onStop === 'function') {
                        this._activator.onStop(this);
                    }
                    plugin.setState(RESOLVED);
                }
            } else {
                plugin.setState(RESOLVED);
            }
        } catch (e) {
            Notice.warn(this, e);
        }
    }

    toString() {
        return `<PluginContext>(${this.getPlugin()})`;
    }

    _isContributionForThis(registration) {
        const plugin = this.getPlugin();
        const name = plugin.getName();
        const version = plugin.getVersion();
        if (registration.getSpecProviderName() === name
            && registration.getSpecProviderVersion() === version) {
            return true;
        }
        return false;
    }

    _listenRegistry() {
        this.debug('_listenRegistry()');
        const container = this.getSystemContainer();
        const serviceRegistry = container.getServiceRegistry();
        const extensionRegistry = container.getExtensionRegistry();
        serviceRegistry.on('registered', (registration) => {
            if (this._isContributionForThis(registration)) {
                this.emit('serviceRegistered', registration);
            }
        });
        serviceRegistry.on('unregistered', (registration) => {
            if (this._isContributionForThis(registration)) {
                this.emit('serviceUnregistered', registration);
            }
        });
        extensionRegistry.on('registered', (registration) => {
            if (this._isContributionForThis(registration)) {
                this.emit('extensionRegistered', registration);
            }
        });
        extensionRegistry.on('unregistered', (registration) => {
            if (this._isContributionForThis(registration)) {
                this.emit('extensionUnregistered', registration);
            }
        });
    }

    /*
     * This method implementation should be different
     * with respect to each runtime environment.
     * (such as webpack, node, amd)
     * If possible, this method can load Activator.js
     * asynchronously (lazily).
     *
     * TODO check private and other apis too.
     */
    _loadActivator(callback) {
        this.debug('_loadActivator(callback)');
        const exports = ExportsRegistry
            .getExportsByPlugin(this.getPlugin());
        const Activator = exports.Activator;
        const activator = new Activator();
        callback(activator);
    }
}

export default PluginContext;
