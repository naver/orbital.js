import {
    IKeyValue,
    ILogger,
    IOrbitalError,
    IOrbitalPackage,
    IOrbitalPackageJson,
    IPackageRegistry,
    ISerializableManifest,
    IServiceClosure,
    PackageEvent,
    PackageState
} from 'orbital.core.types';
import {FlagSupport} from '../common';
import {forEachEnum, freeze} from '../object';
import getPackageId from './getPackageId';

function forEachPackageState(iteratee: (state: PackageState, key: string) => void) {
    forEachEnum(PackageState, (val, key) => {
        const state = val as PackageState;
        iteratee(state, key);
    });
}

function getReadableFlag(state: PackageState) {
    return PackageState[state].toLowerCase().replace(/_/g, ' ');
}

function isAncestalInactive(pack: IOrbitalPackage): boolean {
    if (pack.getFlag(PackageState.CONTRIBUTION_SYNTAX_ERROR | PackageState.INACTIVE
        | PackageState.INACTIVE_BY_DEPENDENCY | PackageState.INVALID_MODULE
        | PackageState.MODULE_NOT_FOUND)) {
        return true;
    }
    return pack.dependencies.some((depPack) => {
        return isAncestalInactive(depPack);
    });
}

function isAncestalStopped(pack: IOrbitalPackage): boolean {
    if (pack.getFlag(PackageState.STOPPED | PackageState.STOPPED_BY_DEPENDENCY)) {
        return true;
    }
    return pack.dependencies.some((depPack) => {
        return isAncestalStopped(depPack);
    });
}

abstract class AbstractPackage extends FlagSupport implements IOrbitalPackage {

    readonly dependencies: IOrbitalPackage[] = [];  // [ <IOrbitalPackage>pack, ... ]
    packageJson!: IOrbitalPackageJson;

    protected depStringList_: string[] = []; // [ 'abc@1.2.3', ... ]
    protected depStringMap_: IKeyValue = {};  // { 'abc': '1.2.3', ... }
    protected readonly errorReasons_: IKeyValue = {};
    protected readonly logger_: IServiceClosure;

    private _valid: boolean = false;

    constructor(logger: IServiceClosure) {
        super();
        this.logger_ = logger as ILogger;
        freeze(this, [
            'dependencies', 'errorReasons_', 'logger_'
        ], false);
    }

    getErrorState(): PackageState {
        return this.getBitMask();
    }

    getErrorString(): string {
        const result: string[] = [];
        forEachPackageState((state) => {
            if (this.getFlag(state)) {
                result.push(getReadableFlag(state));
            }
        });
        return result.length ? `(${result.join(', ')})` : '';
    }

    getId() {
        return getPackageId(this.packageJson);
    }

    abstract getManifest(): ISerializableManifest;

    getName() {
        return this.packageJson.name;
    }

    getVersion(): string {
        return this.packageJson.version;
    }

    init(packageJson: IOrbitalPackageJson) {
        this.packageJson = packageJson;
        this._valid = false;
        this.initFlags_();
        this.createDepCache_();
        this._resolveDependency();
        this.logger_.log(this.getId() + ' initialized');
    }

    setFlag(flag: PackageState, value: boolean, message?: string) {
        super.setFlag(flag, value);
        if (message) {
            this.errorReasons_[flag] = message;
        }
    }

    toString() {
        return '<Package>' + this.getId();
    }

    /**
     * Returns true if the state transition succeeds.
     * This is a "test and set" operation.
     * The method returns the result of the first test.
     */
    validate(registry: IPackageRegistry) {
        const depsLenOld = this.dependencies.length;
        this._validateDependencies(registry);
        this._removeOrphanDependencies();
        this._validateState();
        if (depsLenOld !== this.dependencies.length) {
            this.emit(PackageEvent.resolutionChanged);
        }
        if (!this._valid && this._isLessOrEqualState(
            PackageState.STOPPED | PackageState.STOPPED_BY_DEPENDENCY)) {
            this._valid = true;
            this.emit(PackageEvent.resolved);
        } else if (this._valid && (this.getErrorState() >= PackageState.UNRESOLVED_DEPEDENCY)) {
            this._valid = false;
            this.emit(PackageEvent.unresolved);
        }
    }

    /**
     * Since packageJson.dependencies doesn't have version info.
     * like this { 'orbital.cli': 'file:../orbital.cli' }...
     * This method create map & list for orbital dependencies
     * of this package so that we can easily resolve dependencies.
     * For example, if this package requires
     * acme.main@0.1.0 and acme.other@1.2.3
     * depStringMap_ = {acme.main: '0.1.0', acme.other: '1.2.3'}
     * depStringList_ = ['acme.main@0.1.0', 'acme.other@1.2.3']
     */
    protected abstract createDepCache_(): void;

    protected getErrorReasons_(): string[] {
        const reasons: string[] = [];
        forEachPackageState((state) => {
            if (this.getFlag(state)) {
                let reason = getReadableFlag(state);
                if (this.errorReasons_[state]) {
                    reason += ` (${this.errorReasons_[state]})`;
                }
                reasons.push(reason);
            }
        });
        return reasons;
    }

    protected handleError_(fieldName: string, e: IOrbitalError, defaultCode: PackageState) {
        const nl = '\n          ';
        const code = e.code || defaultCode;
        this.setFlag(code, true, e.message);
        this.logger_.warn(this.getId() + `'s `
            + fieldName + ' field is invalid. '
            + `${getReadableFlag(code)} (${e.message})`);
    }

    protected initFlags_() {
        this.resetFlags();
        this.setFlag(PackageState.UNRESOLVED_DEPEDENCY, true);
    }

    private _addDependency(pack: IOrbitalPackage) {
        this.dependencies.push(pack);
        this._resolveDependency();
    }

    private _dependencyExists(pack: IOrbitalPackage): boolean {
        return this.dependencies.indexOf(pack) > -1;
    }

    private _isLessOrEqualState(state: number) {
        return this.getBitMask() <= state;
    }

    private _removeDependency(toRemove: IOrbitalPackage) {
        const dependencies = this.dependencies;
        if (this._dependencyExists(toRemove)) {
            dependencies.splice(dependencies.indexOf(toRemove), 1);
            this.depStringList_.splice(this.depStringList_.indexOf(toRemove.getId()), 1);
            Reflect.deleteProperty(this.depStringMap_, toRemove.getName());
            this._resolveDependency();
        }
    }

    private _removeOrphanDependencies() {
        const depStringList = this.depStringList_;
        const dependencies = this.dependencies;
        dependencies.concat().forEach((depPack) => {
            const depPackId = depPack.getId();
            if (depStringList.indexOf(depPackId) === -1) {
                dependencies.splice(dependencies.indexOf(depPack), 1);
                this.logger_.log(`orphan dependency ${depPackId}`
                    + ` removed from ${this.getId()}`);
            }
        });
    }

    /*
     * @see {_addDependency}
     * @see {_removeDependency}
     */
    private _resolveDependency() {
        const depStringList = this.depStringList_;
        if (depStringList.length === 0) {
            this.setFlag(PackageState.UNRESOLVED_DEPEDENCY, false);
        } else {
            const dependencies = this.dependencies;
            if (dependencies.length === depStringList.length) {
                const unresolved = depStringList.some((id) => {
                    return !dependencies.some((pack) => {
                        return pack.getId() === id;
                    });
                });
                this.setFlag(PackageState.UNRESOLVED_DEPEDENCY, unresolved);
            } else {
                this.setFlag(PackageState.UNRESOLVED_DEPEDENCY, true);
            }
        }
    }

    private _validateDependencies(reg: IPackageRegistry) {
        this.depStringList_.forEach((depId) => {
            const depPack = reg.getPackageById(depId);
            if (depPack && !this._dependencyExists(depPack)) {
                this._addDependency(depPack);
            }
        });
    }

    private _validateState() {
        let activeAll = true;
        this.dependencies.forEach((depPack) => {
            if (depPack) {
                if (isAncestalInactive(depPack)) {
                    if (!this.getFlag(PackageState.INACTIVE_BY_DEPENDENCY)) {
                        this.setFlag(PackageState.INACTIVE_BY_DEPENDENCY, true);
                    }
                    activeAll = false;
                }
                if (isAncestalStopped(depPack)) {
                    if (!this.getFlag(PackageState.STOPPED_BY_DEPENDENCY)) {
                        this.setFlag(PackageState.STOPPED_BY_DEPENDENCY, true);
                    }
                    activeAll = false;
                }
            }
        });
        if (activeAll) {
            if (this.getFlag(PackageState.INACTIVE_BY_DEPENDENCY)) {
                this.setFlag(PackageState.INACTIVE_BY_DEPENDENCY, false);
            }
            if (this.getFlag(PackageState.STOPPED_BY_DEPENDENCY)) {
                this.setFlag(PackageState.STOPPED_BY_DEPENDENCY, false);
            }
        }
    }
}

export default AbstractPackage;
