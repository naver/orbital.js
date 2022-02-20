import {ContributableDescriptor, deepFreeze} from 'orbital.core.common';
import {
    IContributableExtension,
    IContributableExtensionDescriptor,
    IManifest,
    ISystemContainer
} from 'orbital.core.types';

class ContributableExtensionDescriptor extends ContributableDescriptor
    implements IContributableExtensionDescriptor {

    constructor(
        container: ISystemContainer,
        manifest: IManifest,
        contributableExtension: IContributableExtension
    ) {
        super(container, manifest, contributableExtension);
        deepFreeze(this);
    }

    getExtensionId() {
        return this.id;
    }

    toString() {
        return `<ContributableExtensionDescriptor>(${this.id})`;
    }
}

export default ContributableExtensionDescriptor;
