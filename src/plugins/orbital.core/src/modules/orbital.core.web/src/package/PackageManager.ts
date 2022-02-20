import {
    AbstractPackageManager, freeze, getPackageId, webReq
} from 'orbital.core.common';
import {
    IPluginContext, IProject, IProjectConfigPathOutputWeb,
    ISerializableManifest, IServiceClosure
} from 'orbital.core.types';
import Package from './Package';

function getStateMsg(manifest: ISerializableManifest) {
    if (manifest.orbital._resolution.errorReasons) {
        return `(${manifest.orbital._resolution.errorReasons})`;
    }
    return '';
}

class PackageManager extends AbstractPackageManager {

    private readonly _project: IServiceClosure;
    private readonly _webAppPath: IProjectConfigPathOutputWeb;

    constructor(context: IPluginContext) {
        super(context);
        this._project = context.getService('orbital.core:project') as IProject;
        this._webAppPath = this._project.getWebAppPath();
        freeze(this, ['_project', '_webAppPath']);
    }

    graph() {
        // TODO
    }

    init() {
        const logger = this.logger_;
        logger.info('discovering orbital packages ...');
        const registry = this.getRegistry_();
        const {packages} = this._webAppPath;
        return new Promise((resolve, reject) => {
            try {
                webReq([packages.list], (plugins: string[]) => {
                    const manifestPaths: string[] = plugins.map((plugin) => {
                        return packages.dir + '/' + plugin + '/plugin.json';
                    });
                    webReq(manifestPaths, (...manifests: ISerializableManifest[]) => {
                        console.info(manifests);
                        // TODO nodes could be sorted by levels option here.
                        this._addSystemPackage(manifests);
                        manifests.forEach((manifest) => {
                            logger.log(manifest.orbital._id, getStateMsg(manifest), 'detected');
                            registry.addPackage(
                                new Package(manifest, logger)
                            );
                        });
                        resolve();
                    });
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    install() {
        // TODO
    }

    uninstall() {
        // TODO
    }

    update() {
        // TODO
    }

    private _addSystemPackage(manifests: ISerializableManifest[]) {
        const index = manifests.findIndex((manifest) => {
            return manifest.name === 'orbital.core';
        });
        const sysManifest = manifests.splice(index, 1)[0];
        if (sysManifest) {
            this.logger_.log(getPackageId(sysManifest), 'detected');
            this.getRegistry_().addPackage(
                new Package(sysManifest, this.logger_)
            );
        }
    }
}

export default PackageManager;
