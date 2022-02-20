import {
    freeze, getPlatform, LoggerService, nodeReq, pkg
} from 'orbital.core.common';
import {
    ILogger, IPackageManager, IPlatform, IPlugin, IProject,
    IRuntimeProjectConfig, ISerializableManifest, IServiceClosure,
    ISystemContainer, ISystemContext, ISystemPlugin, ITargetType, PackageManagerEvent
} from 'orbital.core.types';
import orbitalCoreWeb from 'orbital.core.web';
import Plugin from './Plugin';
import PluginContext from './PluginContext';

const LOGGER_SVC_ID = 'orbital.core:logger';
const OPM_SVC_ID = 'orbital.core:package-manager';
const PROJECT_SVC_ID = 'orbital.core:project';
const SVC_OPTS = {
    priority: 0,
    vendor: 'naver corp.'
};

class SystemContext extends PluginContext implements ISystemContext {

    private readonly _installPlugin: (manifest: ISerializableManifest) => Promise<IPlugin>;
    private _logger!: ILogger;
    private readonly _name: string;
    private readonly _platform: IPlatform;
    private _project!: IProject;
    private readonly _runtimeConfig: IRuntimeProjectConfig;
    private readonly _uninstallPlugin: (packageId: string) => Promise<string>;
    private readonly _updatePlugin: (manifest: ISerializableManifest) => void;

    constructor(plugin: ISystemPlugin, container: ISystemContainer, runtimeConfig: IRuntimeProjectConfig) {
        super(plugin, container);
        const pluginRegistry = container.getPluginRegistry();
        this._name = plugin.getName();
        this._platform = getPlatform();
        this._runtimeConfig = runtimeConfig;
        this._installPlugin = (manifest: ISerializableManifest): Promise<IPlugin> => {
            const existence = pluginRegistry.getPluginById(manifest.orbital._id);
            if (existence) {
                return Promise.resolve(existence);
            }
            return pluginRegistry.install(this.getPlugin(), new Plugin(manifest, container));
        };
        this._uninstallPlugin = (packageId: string): Promise<string> => {
            return new Promise((resolve, reject) => {
                try {
                    pluginRegistry
                        .uninstall(packageId)
                        .then(() => {
                            resolve(packageId);
                        }).catch((e) => {
                        reject(e);
                    });
                } catch (e) {
                    reject(e);
                }
            });
        };
        this._updatePlugin = (manifest: ISerializableManifest): void => {
            const target = pluginRegistry.getPluginById(manifest.orbital._id);
            if (target) {
                target.getManifest().update(manifest);
            }
        };
        freeze(this, [
            '_name', '_platform', '_runtimeConfig'
        ], false);
    }

    createSystemServices() {
        // TODO async await
        this._createLogger();
        this._createProject()
            .then(() => this._createPackageManager())
            .then((opm: IServiceClosure) => {
                opm.on(PackageManagerEvent.packageAdded, (manifest: ISerializableManifest) => {
                    this._installPlugin(manifest);
                });
                opm.on(PackageManagerEvent.packageResolved, (manifest: ISerializableManifest) => {
                    if (manifest.orbital.target.indexOf(this._platform as ITargetType) > -1
                        && manifest.name !== this._name) {
                        this._startPlugin(manifest);
                    }
                });
                opm.on(PackageManagerEvent.packageUnresolved, (manifest: ISerializableManifest) => {
                    // TODO stop
                });
                opm.on(PackageManagerEvent.packageResolutionChanged, (manifest: ISerializableManifest) => {
                    this._updatePlugin(manifest);
                });
                return opm.init();
            }).catch((e) => console.warn(e));
    }

    getRuntimeProjectConfig(): IRuntimeProjectConfig {
        return this._runtimeConfig;
    }

    toString() {
        return `<SystemContext>(${this.getPluginVersion()})`;
    }

    private _createLogger() {
        this.publishService(LOGGER_SVC_ID, new LoggerService(this), SVC_OPTS);
        this._logger = this.getService(LOGGER_SVC_ID) as ILogger;
    }

    private _createPackageManager() {
        return new Promise((resolve, reject) => {
            try {
                const platform = this._platform;
                let PackageManager;
                if (platform === 'node') {
                    const orbitalCoreNode = nodeReq('orbital.core.node');
                    PackageManager = orbitalCoreNode.PackageManager;
                } else {
                    PackageManager = orbitalCoreWeb.PackageManager;
                }
                this.publishService(OPM_SVC_ID, new PackageManager(this), SVC_OPTS);
                const opm = this.getService(OPM_SVC_ID) as IPackageManager;
                resolve(opm);
            } catch (e) {
                reject(e);
            }
        });
    }

    private _createProject() {
        return new Promise((resolve, reject) => {
            try {
                const platform = this._platform;
                let Project;
                if (platform === 'node') {
                    const orbitalCoreNode = nodeReq('orbital.core.node');
                    Project = orbitalCoreNode.Project;
                } else {
                    Project = orbitalCoreWeb.Project;
                }
                const project = this._project = new Project(this);
                project.readConfig(() => {
                    this.publishService(PROJECT_SVC_ID, project, SVC_OPTS);
                    const {level} = project.getConfig().log;
                    this._logger.setLevel(level);
                    this._logger.release();
                    resolve(true);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    private _startPlugin(manifest: ISerializableManifest) {
        const config = this._project.getConfig();
        const {startup} = config.packages;
        const installation = this._installPlugin(manifest);
        if (startup.length) {
            if (this._startupHas(manifest)) {
                installation.then((plugin) => {
                    plugin.start({boot: true, force: true});
                });
            }
        } else {
            installation.then((plugin) => {
                plugin.start({boot: true});
            });
        }
    }

    private _startupHas(manifest: ISerializableManifest): boolean {
        const config = this._project.getConfig();
        const {startup} = config.packages;
        const packageName = manifest.name;
        return (startup.indexOf(packageName) > -1)
            || (startup.indexOf(pkg.getPackageId(manifest)) > -1)
            || startup.some((item: string) => {
                if (item.endsWith('*')) {
                    const namespace = item.substring(0, item.length - 1);
                    return packageName.startsWith(namespace);
                }
                return false;
            });
    }
}

export default SystemContext;
