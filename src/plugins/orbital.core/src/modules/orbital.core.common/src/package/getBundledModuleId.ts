import {ContributionGroupKey} from 'orbital.core.types';

function getBundledModuleId(
    groupKey: ContributionGroupKey,
    contributionId: string,
    index: number
) {
    return [groupKey.slice(0, -1), contributionId, index]
        .join('-').replace(':', '~');
}

export default getBundledModuleId;
