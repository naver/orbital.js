import {
    getPackageNameFromId
} from 'orbital.core.common';
import {
    ContributionGroupKey,
    IContributableDefinition,
    IOrbitalPackage,
    PackageState
} from 'orbital.core.types';
import PackageError from '../../exceptions/PackageError';

function validateContributableIdDefinition(
    pack: IOrbitalPackage,
    contributable: IContributableDefinition,
    groupKey: ContributionGroupKey
) {
    const packageName = pack.getName();
    const contributableId = contributable.id;
    if (getPackageNameFromId(contributableId) !== packageName) {
        const contributableIdToBe = packageName
            + ':' + contributableId.split(':')[1];
        const error = new PackageError(
            PackageError.PACKAGE_NAME_MISSMATCH,
            pack.getId(),
            groupKey,
            contributableId,
            contributableIdToBe
        );
        error.code = PackageState.CONTRIBUTABLE_SYNTAX_ERROR;
        throw error;
    }
}

export default validateContributableIdDefinition;
