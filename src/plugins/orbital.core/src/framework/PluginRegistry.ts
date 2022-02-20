import {$logger, Base, freeze, trace} from 'orbital.core.common';
import {
    IKeyValue, IPlugin, IPluginRegistration, IPluginRegistry, PluginState
} from 'orbital.core.types';
import InstallError from './exceptions/InstallError';
import PluginError from './exceptions/PluginError';
import PluginRegistration from './PluginRegistration';

interface IPluginsGroupByPackageName {
    [packageVersion: string]: IPluginRegistration;
}

class PluginRegistry extends Base implements IPluginRegistry {

    /*
     * <Map>_pluginsMap {
     *   key: 'packageName1' => value: {
     *     'version1': <IPluginRegistration>#1,
     *     'version2': <IPluginRegistration>#2,
     *     ...
     *   },
     *   key: 'packageName2' => value: {
     *     'version3': <IPluginRegistration>#3,
     *     ...
     *   }
     * }
     */
    private readonly _pluginsMap: Map<string, IPluginsGroupByPackageName>;

    constructor() {
        super();
        this._pluginsMap = new Map();
        freeze(this, ['_pluginsMap'], false);
    }

    getDependencies(plugin: IPlugin): IPlugin[] {
        return plugin.getManifest().getDependencyList().map((depPackageId) => {
            const depPlugin = this.getPluginById(depPackageId);
            if (!depPlugin) {
                throw new PluginError(PluginError.DEPENDENCY_NOT_FOUND, depPackageId);
            }
            return depPlugin;
        });
    }

    getPluginById(packageId: string): IPlugin | null {
        const token = packageId.split('@');
        const name = token[0];
        const version = token[1];
        return this.getPluginByNameAndVersion(name, version);
    }

    getPluginByNameAndVersion(packageName: string, packageVersion: string): IPlugin | null {
        const pluginsSet = this._pluginsMap.get(packageName);
        if (typeof pluginsSet === 'object' && pluginsSet[packageVersion]) {
            return pluginsSet[packageVersion].getPlugin() || null;
        }
        return null;
    }

    getPlugins(): IPlugin[] {
        const plugins: IPlugin[] = [];
        this._pluginsMap.forEach((regByName) => {
            Reflect.ownKeys(regByName).forEach((version) => {
                plugins.push(regByName[version].getPlugin());
            });
        });
        return plugins;
    }

    getPluginsByName(packageName: string): IPlugin[] {
        const regSet = this._pluginsMap.get(packageName);
        if (regSet) {
            return Reflect.ownKeys(regSet).map((version) => {
                return regSet[version].getPlugin();
            });
        }
        return [];
    }

    getPluginsRequires(requiredPlugin: IPlugin): IPlugin[] {
        const plugins: IPlugin[] = [];
        this.getPlugins().forEach((plugin) => {
            if (this.getDependencies(plugin).indexOf(requiredPlugin) > -1) {
                plugins.push(plugin);
            }
        });
        return plugins;
    }

    @trace
    install(initiator: IPlugin, plugin: IPlugin): Promise<IPlugin> {
        return new Promise((resolve, reject) => {
            try {
                this._register(initiator, plugin);
                resolve(plugin);
            } catch (e) {
                $logger.warn(this, e);
                reject(e);
            }
        });
    }

    /*
     * Removes from plugin registry.
     * - remove from PluginRegistry
     * - remove from ServiceRegistry
     * - remove from ExtensionRegistry
     * - remove from ExportsRegistry
     * - remove from each plugins' manifest's dependencies
     */
    @trace
    uninstall(packageId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const plugin = this.getPluginById(packageId);
            if (!plugin) {
                reject(new InstallError(InstallError.NOEXIST, packageId));
            } else {
                try {
                    plugin.stop();
                    this._unregister(plugin);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            }
        });
    }

    private _register(initiator: IPlugin, plugin: IPlugin): void {
        const map = this._pluginsMap;
        const name = plugin.getName();
        const version = plugin.getVersion();
        if (!map.has(name)) {
            map.set(name, {});
        }
        const regSetByName = map.get(name) as IKeyValue;
        if (regSetByName[version]) {
            throw new InstallError(InstallError.ALEXIST, plugin.getId());
        }
        regSetByName[version] = new PluginRegistration(initiator.getContext(), plugin);
        plugin.setState(PluginState.INSTALLED);
        if (plugin.getManifest().resolved()) {
            plugin.setState(PluginState.RESOLVED);
        }
    }

    private _unregister(plugin: IPlugin) {
        if (this.getPluginById(plugin.getId())) {
            const plugins = this.getPluginsByName(plugin.getName());
            Reflect.deleteProperty(plugins, plugin.getVersion());
            plugin.setState(PluginState.UNINSTALLED);
        }
    }
}

export default PluginRegistry;
