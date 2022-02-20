import orderby from 'lodash.orderby';
import {$logger, Base, freeze, getPackageNameFromId, trace} from 'orbital.core.common';
import {
    ContributablePermissionCategory,
    IContributableExtensionDescriptor, IContributingExtensionDescriptor,
    IContributionOptions, IExtensionModule, IExtensionModuleQueryResult,
    IExtensionRegistration, IExtensionRegistry, IPluginContext, ISystemContainer
} from 'orbital.core.types';
import ExtensionError from '../exceptions/ExtensionError';
import ExtensionRegistration from './ExtensionRegistration';

interface IExtensionRegistrationsByExtensionId {
    [extensionId: string]: IExtensionRegistration[];
}

class ExtensionRegistry extends Base implements IExtensionRegistry {

    private readonly _addExtension: (
        contributorContext: IPluginContext,
        descriptor: IContributingExtensionDescriptor,
        module: IExtensionModule | null,
        options: IContributionOptions
    ) => IExtensionRegistration;

    /*
     * <Map>_extensionsByName {
     *   key: 'specProviderPackageName1' => value: {
     *     'specProviderPackageName1's extensionId1': [
     *       <IExtensionRegistration>reg1,
     *       <IExtensionRegistration>reg2
     *       ...
     *     ],
     *     'specProviderPackageName1's extensionId3': [
     *       <IExtensionRegistration>reg7,
     *       ...
     *     ]
     *   },
     *   key: 'specProviderPackageName8' => value: {
     *     'specProviderPackageName8's extensionId7': [
     *       <IExtensionRegistration>reg11,
     *       <IExtensionRegistration>extensionContributionFromSomePackage
     *       ...
     *     ]
     *   },
     *   ...
     * }
     */
    private readonly _extensionsByName: Map<string,
        IExtensionRegistrationsByExtensionId> = new Map();

    constructor(container: ISystemContainer) {
        super();
        this._addExtension = (
            contributorContext: IPluginContext,
            descriptor: IContributingExtensionDescriptor,
            module: IExtensionModule | null,
            options: IContributionOptions
        ): IExtensionRegistration => {
            this._checkPermission(
                ContributablePermissionCategory.REALIZE, contributorContext, descriptor.id);
            const registration: IExtensionRegistration = new ExtensionRegistration(
                this, container, contributorContext, descriptor, module);
            registration.register(options);
            return registration;
        };
        freeze(this, ['_extensionsByName']);
    }

    @trace
    addExtension(
        contributorContext: IPluginContext,
        descriptor: IContributingExtensionDescriptor,
        module: IExtensionModule | null,
        options: IContributionOptions
    ): IExtensionRegistration {
        return this._addExtension(contributorContext, descriptor, module, options);
    }

    addExtensionRegistration(registration: IExtensionRegistration) {
        const specProviderName = registration.getSpecProviderName();
        const extensionId = registration.getExtensionId();
        const registrations = this._getRegistrationsByExtensionId(extensionId);
        registrations.push(registration);
        this._setRegistrationsByExtensionId(
            specProviderName,
            extensionId,
            this._sortRegistrations(registrations)
        );
    }

    getExtensionRegistrations(user: IPluginContext, extensionId: string) {
        this._checkPermission(
            ContributablePermissionCategory.CALL, user, extensionId);
        return this._getRegistrationsByExtensionId(extensionId);
    }

    getExtensions(user: IPluginContext, extensionId: string): Promise<IExtensionModuleQueryResult[]> {
        const modules: Array<Promise<IExtensionModuleQueryResult>> = [];
        this.getExtensionRegistrations(user, extensionId)
            .forEach((registration) => {
                modules.push(registration.getModule().then((module) => {
                    return {
                        module,
                        registration
                    };
                }));
            });
        return Promise.all(modules);
    }

    registerContributableExtension(descriptor: IContributableExtensionDescriptor) {
        // TODO
    }

    removeExtensionRegistration(registration: IExtensionRegistration) {
        this._forEachRegistrations((reg, extensionId, regsByExtensionId) => {
            if (registration === reg) {
                const regs = regsByExtensionId[extensionId];
                const index = regs.indexOf(reg);
                if (index > -1) {
                    regs.splice(index, 1);
                    $logger.debug('{0} removed', registration, '%f');
                }
            }
        });
    }

    unregisterExtensions(contributor: IPluginContext) {
        this._getRegistrationsByContributor(contributor)
            .forEach((registration) => {
                registration.unregister();
            });
    }

    /*
     * If problem occurs throws an error.
     */
    private _checkPermission (
        category: ContributablePermissionCategory,
        user: IPluginContext,
        extensionId: string
    ): void {
        const contributableDescriptor = user.getContributableExtensionDescriptor(extensionId);
        if (!contributableDescriptor) {
            throw new ExtensionError(
                ExtensionError.CONTRIBUTABLE_EXTENSION_NOT_FOUND, extensionId);
        }
        if (!contributableDescriptor.permission.allowed(category, user)) {
            throw new ExtensionError(ExtensionError.NO_PERMISSION, user, category, extensionId);
        }
    }

    private _forEachRegistrations(cb: (
            reg: IExtensionRegistration,
            extensionId: PropertyKey,
            regsByExtensionId: IExtensionRegistrationsByExtensionId
        ) => void
    ) {
        this._extensionsByName.forEach((regsByExtensionId) => {
            Reflect.ownKeys(regsByExtensionId).forEach((extensionId) => {
                const regs = regsByExtensionId[extensionId];
                regs.forEach((reg) => {
                    cb(reg, extensionId, regsByExtensionId);
                });
            });
        });
    }

    private _getRegistrationsByContributor(context: IPluginContext) {
        const results: IExtensionRegistration[] = [];
        this._forEachRegistrations((reg: IExtensionRegistration) => {
            if (reg.getContributorContext() === context) {
                results.push(reg);
            }
        });
        return results;
    }

    /*
     * TODO consider returning clone
     */
    private _getRegistrationsByExtensionId(extensionId: string): IExtensionRegistration[] {
        const specProviderName = getPackageNameFromId(extensionId);
        const registrationsSet = this
            ._getRegistrationsBySpecProviderName(specProviderName);
        if (!registrationsSet.hasOwnProperty(extensionId)) {
            registrationsSet[extensionId] = [];
        }
        return registrationsSet[extensionId];
    }

    private _getRegistrationsBySpecProviderName(specProviderName: string) {
        const map = this._extensionsByName;
        if (!map.has(specProviderName)) {
            map.set(specProviderName, {});
        }
        return map.get(specProviderName) as IExtensionRegistrationsByExtensionId;
    }

    private _setRegistrationsByExtensionId(
            specProviderName: string, extensionId: string,
            registrations: IExtensionRegistration[]) {
        const registrationsSet = this
            ._getRegistrationsBySpecProviderName(specProviderName);
        registrationsSet[extensionId] = registrations;
    }

    private _sortRegistrations(registrations: IExtensionRegistration[]) {
        return orderby(
            registrations, ['priority', 'uid'], ['desc', 'asc']);
    }
}

export default ExtensionRegistry;
