import {
    AbstractPackage
} from 'orbital.core.common';

import {
    IOrbitalPackageJson,
    ISerializableManifest,
    IServiceClosure
} from 'orbital.core.types';

/**
 * dependencies : Array of <Package> created from depMap.
 *      dependencies should be synchronized with depMap after init().
 *      In common <PackageRegistry>.addNode(node), update(node)
 *      calls validatePackages() then synchronizes depMap to dependencies
 *      and removes orphan dependencies too.
 * depMap : Map of manifest's resolved npm dependencies.
 * depList : List version of depMap. (for convenience)
 */
class Package extends AbstractPackage {

    constructor(private _manifest: ISerializableManifest, logger: IServiceClosure) {
        super(logger);
        this.init(_manifest as IOrbitalPackageJson);
    }

    getManifest(): ISerializableManifest {
        return this._manifest;
    }

    protected createDepCache_() {
        const {depNameVersionMap} = this._manifest.orbital._resolution;
        const depMap = this.depStringMap_ = depNameVersionMap;
        this.depStringList_ = Reflect.ownKeys(depMap).map((name) => {
            return `${name}@${depMap[name]}`;
        });
    }

    protected initFlags_() {
        super.initFlags_();
        this.setFlag(this._manifest.orbital._resolution.state, true);
    }
}

export default Package;
