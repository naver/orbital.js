import {
    IContributableDefinition,
    IContributableDescriptor,
    IContributablePermission,
    IContributableSpec,
    IManifest,
    IPackageIdentity,
    ISystemContainer
} from 'orbital.core.types';
import {Base} from '../common';
import ContributablePermission from './ContributablePermission';

class ContributableDescriptor extends Base implements IContributableDescriptor {

    readonly desc: string;
    readonly id: string;
    readonly permission: IContributablePermission;
    readonly spec: IContributableSpec;
    readonly specProvider: IPackageIdentity;
    readonly urn: string;

    constructor(
        container: ISystemContainer,
        manifest: IManifest,
        contributable: IContributableDefinition
    ) {
        super();
        const {name, version} = manifest;
        const {desc, id, spec} = contributable;
        this.desc = desc || '';
        this.id = id;
        this.permission = new ContributablePermission(container, manifest, contributable);
        this.spec = spec;
        this.specProvider = {name, version};
        this.urn = `${manifest.getId()}:${id.replace(name, '')}`;
    }
}

export default ContributableDescriptor;
