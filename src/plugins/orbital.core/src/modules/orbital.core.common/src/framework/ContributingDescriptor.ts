import {
    IContributingDefinition,
    IContributingDescriptor,
    IManifest,
    IPackageIdentity
} from 'orbital.core.types';
import {Base} from '../common';
import {getPackageId, getPackageNameFromId} from '../package';

class ContributingDescriptor extends Base implements IContributingDescriptor {

    readonly id: string;
    readonly index: number;
    readonly priority: number;
    readonly realize: string;
    readonly specContributor: IPackageIdentity;
    readonly specProvider: IPackageIdentity;
    readonly urn: string;
    readonly vendor: string;

    constructor(manifest: IManifest, contribution: IContributingDefinition, index: number) {
        super();
        const {name, version} = manifest;
        const {id, priority, realize, vendor} = contribution;
        const specProviderName = getPackageNameFromId(id);
        this.id = id;
        this.index = index;
        this.priority = priority || 0;
        this.realize = realize;
        this.specContributor = {name, version};
        this.specProvider = {
            name: specProviderName,
            version: manifest.getDependencyVersionByName(specProviderName)
        };
        this.urn = `${getPackageId(this.specProvider)}:${id.replace(name, '')}-${index}`;
        this.vendor = vendor || '';
    }
}

export default ContributingDescriptor;
