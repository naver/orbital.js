import {
    ContributionGroupKey,
    IContributingDefinition,
    IOrbitalPackage,
    PackageState
} from 'orbital.core.types';
import PackageError from '../../exceptions/PackageError';

function validateContributionFields(
    pack: IOrbitalPackage,
    contribution: IContributingDefinition,
    groupKey: ContributionGroupKey
) {
    if (!contribution.realize) {
        const error = new PackageError(
            PackageError.FIELD_MISSING,
            'realize', pack.getId(), 'contributes', groupKey, contribution.id
        );
        error.code = PackageState.CONTRIBUTION_SYNTAX_ERROR;
        throw error;
    }
}

export default validateContributionFields;
