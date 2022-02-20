import {ContributingDescriptor, deepFreeze} from 'orbital.core.common';
import {
    IContributingExtension,
    IContributingExtensionDescriptor,
    IExtensionMeta,
    IManifest
} from 'orbital.core.types';

class ContributingExtensionDescriptor extends ContributingDescriptor
    implements IContributingExtensionDescriptor {

    readonly meta: IExtensionMeta | null;

    constructor(
        manifest: IManifest,
        contributingExtension: IContributingExtension,
        index: number
    ) {
        super(manifest, contributingExtension, index);
        this.meta = contributingExtension.meta || null;
        deepFreeze(this);
    }

    toString() {
        return `<ContributingExtensionDescriptor>(${this.id}-${this.realize})`;
    }
}

export default ContributingExtensionDescriptor;
