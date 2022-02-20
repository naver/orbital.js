import {ContributingDescriptor, deepFreeze} from 'orbital.core.common';
import {
    IContributingService,
    IContributingServiceDescriptor,
    IManifest,
} from 'orbital.core.types';

class ContributingServiceDescriptor extends ContributingDescriptor
    implements IContributingServiceDescriptor {

    constructor(
        manifest: IManifest,
        contributingService: IContributingService,
        index: number
    ) {
        super(manifest, contributingService, index);
        deepFreeze(this);
    }
}

export default ContributingServiceDescriptor;
