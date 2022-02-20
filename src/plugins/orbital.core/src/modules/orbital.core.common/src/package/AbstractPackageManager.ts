import {
    ILogger, IOrbitalPackage, IPackageManager,
    IPackageRegistry, IPluginContext, IServiceClosure
} from 'orbital.core.types';
import {Base} from '../common';
import {freeze} from '../object';
import PackageRegistry from './PackageRegistry';

abstract class AbstractPackageManager extends Base implements IPackageManager {

    protected readonly context_: IPluginContext;
    protected readonly logger_: IServiceClosure;
    private readonly _registry: IPackageRegistry;

    constructor(context: IPluginContext) {
        super();
        this.context_ = context;
        this.logger_ = context.getService('orbital.core:logger') as ILogger;
        this._registry = new PackageRegistry(this.context_, this);
        freeze(this, ['context', 'logger_', '_registry'], false);
    }

    abstract graph(): void;
    abstract init(): void;
    abstract install(): void;

    /**
     * Returns all installed packages.
     */
    list(): IOrbitalPackage[] {
        const packages: IOrbitalPackage[] = [];
        this.getRegistry_().forEachPacks((pack) => {
            packages.push(pack);
        });
        return packages;
    }

    abstract uninstall(): void;
    abstract update(): void;

    protected getRegistry_() {
        return this._registry;
    }
}

export default AbstractPackageManager;
