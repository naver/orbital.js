import {pkg} from 'orbital.core.common';
import {IPackageNode} from 'orbital.core.types';

function getId(node: IPackageNode) {
    if (node && node.package) {
        return pkg.getPackageId(node.package);
    }
    return null;
}

export default getId;
