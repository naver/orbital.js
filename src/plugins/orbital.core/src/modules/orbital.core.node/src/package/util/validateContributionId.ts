import {
    ContributionGroupKey,
    ContributionRole,
    IContributableDefinition,
    IContributingDefinition,
    IOrbitalPackage,
    PackageState
} from 'orbital.core.types';
import PackageError from '../../exceptions/PackageError';

function validateContributionId(
    pack: IOrbitalPackage,
    role: ContributionRole,
    groupKey: ContributionGroupKey,
    definition: IContributableDefinition | IContributingDefinition
) {
    const packageId = pack.getId();
    const contributionId = definition.id;
    if (!contributionId) {
        const error = new PackageError(
            PackageError.DEFINITION_ID_MISSING,
            packageId, role, groupKey);
        error.code = PackageState.CONTRIBUTION_SYNTAX_ERROR;
        throw error;
    }
    const index = contributionId.indexOf(':');
    if (index <= 0 || index === (contributionId.length - 1)) {
        const error = new PackageError(
            PackageError.DEFINITION_ID_SYNTAX_ERROR,
            packageId, role, groupKey, contributionId);
        error.code = PackageState.CONTRIBUTION_SYNTAX_ERROR;
        throw error;
    }
}

export default validateContributionId;
