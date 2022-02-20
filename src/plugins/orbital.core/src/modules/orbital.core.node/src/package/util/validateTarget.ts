/* tslint:disable:max-line-length */

import {BasicError} from 'orbital.core.common';
import {ITargetType, PackageState} from 'orbital.core.types';

const targets = ['node', 'web'];

function validateTarget(target: any) {
    const typeofTarget = typeof target;
    const isArray = Array.isArray(target);
    if (typeofTarget === 'string' && target !== 'node' && target !== 'web') {
        const error = new BasicError(
            `'${target}' is invalid target. 'target' field should be one of 'node' or 'web'`
        );
        error.code = PackageState.INVALID_MANIFEST;
        throw error;
    } else if (isArray && !target.some((t: ITargetType) => targets.indexOf(t) > -1)) {
        const error = new BasicError(
            `'${target}' is invalid target. 'target' field should be an array includes one of 'node' or 'web'`
        );
        error.code = PackageState.INVALID_MANIFEST;
        throw error;
    } else if (typeofTarget !== 'string' && !isArray) {
        const error = new BasicError(
            `'${target}' is invalid target. 'target' field should be one of 'node' or 'web' or an array includes one of 'node' or 'web'`
        );
        error.code = PackageState.INVALID_MANIFEST;
        throw error;
    }
}

export default validateTarget;
