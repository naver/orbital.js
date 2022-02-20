import {IPackageJson} from 'orbital.core.types';

export default function getPackageId(packJson: IPackageJson) {
    if (typeof packJson === 'object' && packJson.name && packJson.version) {
        return packJson.name + '@' + packJson.version;
    }
    throw new Error('pack.getId requires an IPackageJson type parameter.');
}
