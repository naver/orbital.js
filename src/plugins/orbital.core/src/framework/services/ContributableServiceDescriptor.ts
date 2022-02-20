import {ContributableDescriptor, deepFreeze} from 'orbital.core.common';
import {
    IContributableService,
    IContributableServiceDescriptor,
    IManifest,
    ISystemContainer
} from 'orbital.core.types';

class ContributableServiceDescriptor extends ContributableDescriptor
    implements IContributableServiceDescriptor {

    readonly isAsync: boolean;
    readonly isTolerant: boolean;

    constructor(
        container: ISystemContainer,
        manifest: IManifest,
        contributableService: IContributableService
    ) {
        super(container, manifest, contributableService);
        const {
            async: isAsync,
            tolerant: isTolerant
        } = contributableService;
        this.isAsync = !!isAsync;
        this.isTolerant = !!isTolerant;
        deepFreeze(this);
    }

    getServiceId() {
        return this.id;
    }

    toString() {
        return `<ContributableServiceDescriptor>(${this.id})`;
    }
}

export default ContributableServiceDescriptor;
