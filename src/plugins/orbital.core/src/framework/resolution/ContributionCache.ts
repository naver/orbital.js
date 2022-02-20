import {
    Base, esDefault, freeze, getBundledModuleId,
    getPlatform, joinPath, nodeReq, trace, webReq
} from 'orbital.core.common';
import {
    ContributionGroupKey,
    IActivatorClass, IBundle,
    IContributingDescriptor,
    IContributingExtensionDescriptor,
    IContributingServiceDescriptor,
    IContributionCache,
    IExtensionModule, IPlugin, IPluginContext,
    IProject, IServiceClass, IServiceClosure, ISystemPlugin
} from 'orbital.core.types';
import path from 'path';
import ResolutionError from '../exceptions/ResolutionError';

const platform = getPlatform();

/* urn = `${specProviderId}:${id without specProviderName}-${index}`; */
interface ICache {
    [urn: string]: ICacheByContributorId;
}

interface ICacheByContributorId {
    activator: IActivatorClass | null;
    extensions: {
        [urn: string]: IExtensionModule
    };
    services: {
        [urn: string]: IServiceClass
    };
}

class ContributionCache extends Base implements IContributionCache {

    /*
     * <ICache>_cache {
     *   'somePackageName@somePackageVersion': <ICacheByContributorId> {
     *     activator: IActivatorClass | null,
     *     extensions: {
     *       `${specProvider1Id}:${extensionId1}-${index}`: <IExtensionModule>module1,
     *       `${specProvider2Id}:${extensionId7}-${index}`: <IExtensionModule>module2
     *       ...
     *     }
     *   }
     * }
     */
    private readonly _cache: ICache;
    private _project: IServiceClosure | null = null;
    private readonly _systemPlugin: ISystemPlugin;

    constructor(systemPlugin: ISystemPlugin) {
        super();
        this._cache = {};
        this._systemPlugin = systemPlugin;
        freeze(this, [
            '_cache', '_systemPlugin'
        ], false);
    }

    getActivator(contributor: IPluginContext): Promise<IActivatorClass> {
        const plugin = contributor.getPlugin();
        const cache = this._getCacheByContributorId(plugin.getId());
        const cachedModule = cache.activator;
        if (cachedModule) {
            return Promise.resolve(cachedModule);
        }
        return this._loadActivator(plugin).then((module) => {
            cache.activator = module;
            return module;
        });
    }

    @trace
    getExtensionModule(
        contributor: IPluginContext,
        descriptor: IContributingExtensionDescriptor
    ): Promise<IExtensionModule> {
        return this._getModule(ContributionGroupKey.EXTENSIONS, contributor, descriptor);
    }

    @trace
    getServiceClass(
        contributor: IPluginContext,
        descriptor: IContributingServiceDescriptor
    ): Promise<IServiceClass> {
        return this._getModule(ContributionGroupKey.SERVICES, contributor, descriptor);
    }

    private _getCacheByContributorId(contributorId: string): ICacheByContributorId {
        const cache = this._cache;
        if (!cache[contributorId]) {
            cache[contributorId] = {
                activator: null,
                extensions: {},
                services: {}
            };
        }
        return cache[contributorId];
    }

    @trace
    private _getModule(
        groupKey: ContributionGroupKey,
        contributor: IPluginContext,
        descriptor: IContributingDescriptor
    ): Promise<any> {
        const plugin = contributor.getPlugin();
        const urn = descriptor.urn;
        const cacheById = this._getCacheByContributorId(plugin.getId());
        const cachedModule = cacheById[groupKey][urn];
        if (cachedModule) {
            return Promise.resolve(cachedModule);
        }
        return this._loadModule(plugin, groupKey, descriptor)
            .then((module) => {
                cacheById[groupKey][urn] = module;
                return module;
            });
    }

    private _getProject() {
        if (!this._project) {
            this._project = this._systemPlugin
                .getContext().getService('orbital.core:project');
        }
        return this._project as IProject;
    }

    private _getWebAppPath(plugin: IPlugin): string {
        const project = this._getProject();
        const appPath = project.getWebAppPath();
        return appPath.packages.dir + '/' + plugin.getId();
    }

    private _loadActivator(plugin: IPlugin): Promise<IActivatorClass> {
        const manifest = plugin.getManifest();
        const {orbital} = manifest.getMeta();
        if (!orbital.activator) {
            throw new ResolutionError(
                ResolutionError.ACTIVATOR_NOT_DEFINED, plugin.getId()
            );
        }
        if (orbital.bundle) {
            return this._loadBundledModule(plugin, 'activator');
        }
        return this._loadSourceModule(plugin, orbital.activator);
    }

    @trace
    private _loadBundledModule(
        plugin: IPlugin,
        moduleId: string,
        isJson: boolean = false
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const manifest = plugin.getManifest();
                const {orbital} = manifest.getMeta();
                const bundle = orbital.bundle as IBundle;
                const bundleRelDir = bundle.path;
                const fileExt = isJson ? '.json' : '.js';
                let packPath: string;
                let bundleDir: string;
                let modulePath: string;
                if (platform === 'node') {
                    const nodePath = nodeReq('path');
                    packPath = manifest.getResolution().path;
                    bundleDir = nodePath.resolve(packPath, bundleRelDir);
                    modulePath = joinPath(bundleDir, moduleId + fileExt);
                    resolve(esDefault(nodeReq(modulePath)));
                } else if (platform === 'web') {
                    packPath = this._getWebAppPath(plugin);
                    bundleDir = path.resolve(packPath, bundleRelDir);
                    modulePath = joinPath(bundleDir, moduleId + fileExt);
                    const resourcesPath = joinPath(bundleDir, 'resources.json');
                    webReq([modulePath, resourcesPath], (module, resources) => {
                        const normModule = esDefault(module);
                        const cssResource = moduleId + '.css';
                        if (resources.includes(cssResource)) {
                            webReq([joinPath(bundleDir, cssResource)], () => {
                                resolve(normModule);
                            });
                        } else {
                            resolve(normModule);
                        }
                    });
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    private _loadModule(
        plugin: IPlugin,
        groupKey: ContributionGroupKey,
        descriptor: IContributingDescriptor
    ): Promise<any> {
        const {id, index} = descriptor;
        const manifest = plugin.getManifest();
        const isJson = descriptor.realize.substr(-5) === '.json';
        const moduleId = getBundledModuleId(groupKey, id, index);
        if (manifest.getMeta().orbital.bundle) {
            return this._loadBundledModule(plugin, moduleId, isJson);
        }
        return this._loadSourceModule(plugin, descriptor.realize);
    }

    private _loadSourceModule(
        plugin: IPlugin,
        realizedPath: string
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                let packPath;
                let modulePath;
                if (platform === 'node') {
                    const nodePath = nodeReq('path');
                    packPath = plugin.getManifest().getResolution().path;
                    modulePath = nodePath.resolve(packPath, realizedPath);
                    resolve(nodeReq(modulePath));
                } else if (platform === 'web') {
                    packPath = this._getWebAppPath(plugin);
                    modulePath = path.resolve(packPath, realizedPath);
                    webReq([modulePath], (module) => {
                        resolve(esDefault(module));
                    });
                }
            } catch (e) {
                reject(e);
            }
        });
    }
}

export default ContributionCache;
