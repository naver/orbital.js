/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Base from './bases/Base';
import PluginState from './PluginState';
import InstallError from './exceptions/InstallError';

const privates = {
    getPluginsByName(map, name) {
        if (!map.has(name)) {
            map.set(name, {});
        }
        return map.get(name);
    }
};

class PluginRegistry extends Base {

    /**
     * <Map>_pluginsByName
     * -packageName1
     *   -version1: <Plugin>#1
     *   -version2: <Plugin>#2
     *   -...
     * -packageName2
     * -...
     * TODO -<Plugin>#1 => -<PluginRegistration>#1
     * TODO add who, when, ...
     */
    constructor() {
        super();
        this.define('_pluginsByName', new Map());
    }

    /**
     * @return {object}
     */
    getPluginsByName(name) {
        const pluginsSet = this._pluginsByName.get(name);
        if (pluginsSet) {
            return Reflect.ownKeys(pluginsSet).map((version) => {
                return pluginsSet[version];
            });
        }
        return [];
    }

    getPluginByNameAndVersion(name, version) {
        const pluginsSet = this._pluginsByName.get(name);
        if (typeof pluginsSet === 'object') {
            return pluginsSet[version] || null;
        }
        return null;
    }

    getPluginById(id) {
        const token = id.split('@');
        const name = token[0];
        const version = token[1];
        return this.getPluginByNameAndVersion(name, version);
    }

    /**
     * TODO Temp Check logic
     */
    getPlugins() {
        const plugins = [];
        this._pluginsByName.forEach((regByName) => {
            Reflect.ownKeys(regByName).forEach((version) => {
                plugins.push(regByName[version]);
            });
        });
        return plugins;
    }

    getPluginsRequires(requiredPlugin) {
        const plugins = [];
        this.getPlugins().forEach((plugin) => {
            if (plugin.getDependencies().indexOf(requiredPlugin) > -1) {
                plugins.push(plugin);
            }
        });
        return plugins;
    }

    /**
     * @return {Plugin}
     */
    install(initiator, plugin) {
        this.register(initiator, plugin);
        return plugin;
    }

    /**
     * Removes from plugin registry.
     * - remove from PluginRegistry
     * - remove from ServiceRegistry
     * - remove from ExtensionRegistry
     * - remove from ExportsRegistry
     * - remove from each plugins' manifest's dependencies
     * @param {Plugin} plugin
     * @return {Promise}
     */
    uninstall(plugin) {
        this.debug('uninstall(' + plugin.getId() + ')');
        return new Promise(() => {
            plugin.stop().then(() => {
                this.remove(plugin);
            });
        });
    }

    remove(plugin) {
        if (this.getPluginById(plugin.getId())) {
            const plugins = this.getPluginsByName(plugin.getName());
            Reflect.deleteProperty(plugins, plugin.getVersion());
        }
    }

    /**
     * TODO use fn.call()
     */
    register(initiator, plugin) {
        const pluginName = plugin.getName();
        const pluginVersion = plugin.getVersion();
        const plugins = privates.getPluginsByName(
            this._pluginsByName, pluginName);
        if (Reflect.has(plugins, pluginVersion)) {
            throw new Error(`${InstallError.ALEXIST}(${plugin.getId()})`);
        }
        plugins[pluginVersion] = plugin;
        plugin.setState(PluginState.INSTALLED);
    }

    /**
     * 1) Check extension provider plugin & extension-point exists
     * 2) Check service provider & service exists
     * @return {Promise}
     */
    resolve(plugin) {
        return new Promise((resolve) => {
            // do some resolving ...
            // if resolving is finished
            resolve(plugin);
        });
    }
}

export default PluginRegistry;
