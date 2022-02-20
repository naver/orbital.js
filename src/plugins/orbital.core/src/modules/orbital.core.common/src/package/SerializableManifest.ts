import {
    IKeyString,
    IOrbitalMetaResolved,
    IOrbitalPackageJson,
    IOrbitalPackageResolution,
    ISerializableManifest,
    PackageState
} from 'orbital.core.types';
import {clone, deepFreeze} from '../object';
import getPackageId from './getPackageId';

export default class SerializableManifest implements ISerializableManifest {

    dependencies: IKeyString;
    description?: string;
    license?: string;
    main?: string;
    name: string;
    orbital: IOrbitalMetaResolved;
    version: string;

    constructor(meta: IOrbitalPackageJson, resolution: IOrbitalPackageResolution = {
        depNameVersionMap: {},
        errorReasons: [],
        parent: '',
        path: '',
        state: PackageState.NORMAL
    }) {
        const res = clone(resolution) as IOrbitalPackageResolution;
        this.dependencies = meta.dependencies;
        this.description = meta.description;
        this.license = meta.license;
        this.main = meta.main;
        this.name = meta.name;
        this.orbital = Object.assign({}, meta.orbital, {
            _id: getPackageId(meta),
            _resolution: res
        });
        this.version = meta.version;
        deepFreeze(this);
    }

    toString() {
        return `<SerializableManifest>(${this.orbital._id})`;
    }
}
