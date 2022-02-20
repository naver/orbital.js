import {validate} from 'jsonschema';
import {stringify} from 'orbital.core.common';
import {
    ContributionGroupKey,
    IContributableDefinition,
    IOrbitalPackage,
    PackageState
} from 'orbital.core.types';
import PackageError from '../../exceptions/PackageError';
import permissionSchema from './schemas/permission';

function validateContributableFields(
    pack: IOrbitalPackage,
    contribution: IContributableDefinition,
    groupKey: ContributionGroupKey
) {
    const {permission, spec} = contribution;
    if (typeof permission === 'object') {
        try {
            validate(permission, permissionSchema, {
                throwError: true
            });
        } catch (e) {
            const error = new PackageError(
                PackageError.INVALID_PERMISSION,
                pack.getId(), contribution.id, groupKey,
                stringify(permission), `(${e})`
            );
            error.code = PackageState.CONTRIBUTABLE_SYNTAX_ERROR;
            throw error;
        }
    } else {
        const error = new PackageError(
            PackageError.INVALID_PERMISSION,
            pack.getId(), contribution.id, groupKey, permission
        );
        error.code = PackageState.CONTRIBUTABLE_SYNTAX_ERROR;
        throw error;
    }

    if (!spec) {
        const error = new PackageError(
            PackageError.FIELD_MISSING,
            'spec', pack.getId(), 'contributable', groupKey, contribution.id
        );
        error.code = PackageState.CONTRIBUTABLE_SYNTAX_ERROR;
        throw error;
    }
}

export default validateContributableFields;
