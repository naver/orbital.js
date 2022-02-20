import {
    ILogger, IOrbitalPackage, IPackageManager, IPackageRegistry,
    IPackageRegistryCallback, IPluginContext,
    IServiceClosure, PackageEvent, PackageManagerEvent
} from 'orbital.core.types';
import {Base} from '../common';
import {freeze} from '../object';

class PackageRegistry extends Base implements IPackageRegistry {

    private readonly _logger: IServiceClosure;
    private readonly _opm: IPackageManager;
    private readonly _packs: {
        [packageId: string]: IOrbitalPackage;
    } = {};

    constructor(context: IPluginContext, packageManager: IPackageManager) {
        super();
        this._logger = context.getService('orbital.core:logger') as ILogger;
        this._opm = packageManager;
        freeze(this, ['_logger', '_opm', '_packs']);
    }

    addPackage(pack: IOrbitalPackage) {
        if (!this.exists(pack)) {
            const opm = this._opm;
            pack.on(PackageEvent.resolved, () => {
                opm.emit(PackageManagerEvent.packageResolved, pack.getManifest());
            });
            pack.on(PackageEvent.unresolved, () => {
                opm.emit(PackageManagerEvent.packageUnresolved, pack.getManifest());
            });
            pack.on(PackageEvent.resolutionChanged, () => {
                opm.emit(PackageManagerEvent.packageResolutionChanged, pack.getManifest());
            });
            this._packs[pack.getId()] = pack;
            this._logger.log(pack.getId() + ' registered');
            opm.emit(PackageManagerEvent.packageAdded, pack.getManifest());
            this._validatePackages();
            return true;
        }
        return false;
    }

    exists(pack: IOrbitalPackage): boolean {
        return !!this._packs[pack.getId()];
    }

    forEachPacks(callback: IPackageRegistryCallback) {
        Reflect.ownKeys(this._packs).forEach((id, i) => {
            callback(this._packs[id], i);
        });
    }

    getPackageById(id: string): IOrbitalPackage {
        return this._packs[id];
    }

    removePackage(pack: IOrbitalPackage) {
        // TODO
        return true;
    }

    private _validatePackages() {
        this.forEachPacks((pack: IOrbitalPackage) => {
            pack.validate(this);
        });
    }
}

export default PackageRegistry;
