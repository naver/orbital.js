import {Base, deepFreeze, freeze} from 'orbital.core.common';
import {
    IContributableExtensionDescriptor, IContributableServiceDescriptor,
    IContributingExtensionDescriptor, IContributingServiceDescriptor,
    IKeyString, IManifest, IOrbitalMetaResolved, IOrbitalPackageJson,
    IOrbitalPackageResolution, IPolicyType, ISerializableManifest,
    ISystemContainer, ManifestEvent, PackageState
} from 'orbital.core.types';
import ManifestError from './exceptions/ManifestError';
import ContributableExtensionDescriptor from './extensions/ContributableExtensionDescriptor';
import ContributingExtensionDescriptor from './extensions/ContributingExtensionDescriptor';
import ContributableServiceDescriptor from './services/ContributableServiceDescriptor';
import ContributingServiceDescriptor from './services/ContributingServiceDescriptor';

class Manifest extends Base implements IManifest {

    /*
     * <ISerializableManifest>_meta => {
     *   name: string,
     *   version: string,
     *   dependencies?: {
     *     'some-package': 'some-package-repository',
     *     'another-package': 'another-package-repository',
     *     ...
     *   },
     *   description?: string,
     *   license?: string,
     *   main?: string,
     *   module?: string,
     *   orbital: {
     *     activator: 'path/to/Activator',
     *     bundle: {
     *       bundler: 'webpack' | 'rollup',
     *       format: 'amd' | 'cjs' | 'umd',
     *       path: './dist/'
     *     },
     *     contributable: {
     *       extensions: {
     *       },
     *       services: {
     *       }
     *     },
     *     contributes: {
     *       extensions: {
     *       },
     *       services: {
     *       }
     *     },
     *     policies: [ 'eager' ],
     *     state: 'inactive' | 'stopped' | '',
     *     target: [ 'node' | 'web' ]
     *     _id: 'this-package-id',
     *     _resolution: {
     *       depNameVersionMap: {
     *         depPack1Name: depPack1Version,
     *         depPack2Name: depPack2Version,
     *         ...
     *       },
     *       errorReasons: [
     *         'some error message (with a reason)',
     *         'other error message (with a reason)'
     *       ],
     *       parent: '',
     *       path: 'path/for/this/package',
     *       state: PackageState
     *     }
     *   }
     * }
     */

    readonly name: string;
    readonly version: string;
    private _contributableExtensions: IContributableExtensionDescriptor[] = [];
    private _contributableServices: IContributableServiceDescriptor[] = [];
    private _contributingExtensions: IContributingExtensionDescriptor[] = [];
    private _contributingServices: IContributingServiceDescriptor[] = [];
    private readonly _id: string;
    private _meta: ISerializableManifest;
    private _update: (serializableManifest: ISerializableManifest) => void;

    constructor(serializableManifest: ISerializableManifest, container: ISystemContainer) {
        super();
        const {name, version, orbital} = serializableManifest;
        this.name = name;
        this.version = version;
        this._id = orbital._id;
        this._meta = serializableManifest;
        this._update = (manifest: ISerializableManifest) => {
            deepFreeze(manifest);
            this._meta = manifest;
            if (this.resolved()) {
                this._createDescriptors(container);
            }
            this.emit(ManifestEvent.updated);
        };
        freeze(this, ['name', 'version', '_id'], false);
        this.update(serializableManifest);
    }

    getDependencyList(): string[] {
        const depNameVersionMap = this.getDependencyMap();
        return Object.getOwnPropertyNames(depNameVersionMap)
            .map((name) => {
                return name + '@' + depNameVersionMap[name];
            });
    }

    getDependencyMap(): IKeyString {
        return this._meta.orbital._resolution.depNameVersionMap;
    }

    getDependencyVersionByName(packageName: string): string {
        if (packageName === this.name) {
            return this.version;
        }
        const version = this.getDependencyMap()[packageName];
        if (!version) {
            throw new ManifestError(
                ManifestError.MISSING_DEPENDENCY, packageName, this.name);
        }
        return version;
    }

    getId(): string {
        return this._id;
    }

    getMeta(): IOrbitalPackageJson {
        return this._meta as IOrbitalPackageJson;
    }

    getOwnContributableExtensionDescriptor(extensionId: string): IContributableExtensionDescriptor | null {
        let result = null;
        this.getOwnContributableExtensionDescriptors().some((descriptor) => {
            if (descriptor.id === extensionId) {
                result = descriptor;
                return true;
            }
            return false;
        });
        return result;
    }

    getOwnContributableExtensionDescriptors() {
        return this._contributableExtensions;
    }

    getOwnContributableServiceDescriptor(serviceId: string): IContributableServiceDescriptor | null {
        let result = null;
        this.getOwnContributableServiceDescriptors().some((descriptor) => {
            if (descriptor.id === serviceId) {
                result = descriptor;
                return true;
            }
            return false;
        });
        return result;
    }

    getOwnContributableServiceDescriptors() {
        return this._contributableServices;
    }

    getOwnContributingExtensionDescriptors() {
        return this._contributingExtensions;
    }

    getOwnContributingServiceDescriptors() {
        return this._contributingServices;
    }

    getResolution(): IOrbitalPackageResolution {
        return this._meta.orbital._resolution;
    }

    getState(): PackageState {
        return this._meta.orbital._resolution.state;
    }

    hasPolicy(policy: IPolicyType): boolean {
        return this._meta.orbital.policies.indexOf(policy) > -1;
    }

    hasState(state: PackageState): boolean {
        return (this.getState() & state) !== 0;
    }

    resolved(): boolean {
        return this.getState() <= (PackageState.STOPPED | PackageState.STOPPED_BY_DEPENDENCY);
    }

    toString() {
        return `<Manifest>(${this._id})`;
    }

    update(serializableManifest: ISerializableManifest) {
        this._update(serializableManifest);
    }

    private _createDescriptors(container: ISystemContainer) {

        const {orbital} = this.getMeta();

        this._contributableServices = orbital.contributable
            .services.map((contributableService) => {
                return new ContributableServiceDescriptor(
                    container,
                    this,
                    contributableService
                );
            });
        this._contributingServices = orbital.contributes
            .services.map((contributingService, index) => {
                return new ContributingServiceDescriptor(
                    this,
                    contributingService,
                    index
                );
            });
        this._contributableExtensions = orbital.contributable
            .extensions.map((contributableExtension) => {
                return new ContributableExtensionDescriptor(
                    container,
                    this,
                    contributableExtension
                );
            });
        this._contributingExtensions = orbital.contributes
            .extensions.map((contributingExtension, index) => {
                return new ContributingExtensionDescriptor(
                    this,
                    contributingExtension,
                    index
                );
            });
    }
}

export default Manifest;
