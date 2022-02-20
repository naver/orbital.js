import orderby from 'lodash.orderby';
import {$logger, Base, freeze, getPackageNameFromId, trace} from 'orbital.core.common';
import {
    ContributablePermissionCategory,
    IContributingServiceDescriptor,
    IPluginContext,
    IServiceCallOptions,
    IServiceClass,
    IServiceClosure,
    IServicePublishingOptions,
    IServiceRegistration,
    IServiceRegistry,
    ISystemContainer
} from 'orbital.core.types';
import ServiceError from '../exceptions/ServiceError';
import ServiceClosure from './ServiceClosure';
import ServiceRegistration from './ServiceRegistration';

interface ILazyServiceQueue {
    [serviceId: string]: ILazyServiceRecord[];
}

interface ILazyServiceRecord {
    contributor: IPluginContext;
    descriptor: IContributingServiceDescriptor;
}

interface IServiceClosureCacheByUser {
    [serviceId: string]: {
        [serializedOptions: string]: IServiceClosure
    };
}

interface IServiceRegistrationsByServiceId {
    [serviceId: string]: IServiceRegistration[];
}

function publishService(
    contributor: IPluginContext,
    descriptor: IContributingServiceDescriptor
) {
    return (ServiceClass: IServiceClass) => {
        const {id, priority, vendor} = descriptor;
        return contributor.publishService(
            id, new ServiceClass(contributor),
            {priority, vendor}
        );
    };
}

class ServiceRegistry extends Base implements IServiceRegistry {

    private readonly _getAsyncService: (
        user: IPluginContext,
        serviceId: string,
        options: IServiceCallOptions
    ) => Promise<IServiceClosure>;

    private _lazyServiceQueue: ILazyServiceQueue = {};

    private readonly _register: (
        publisherCtx: IPluginContext,
        serviceId: string,
        service: object,
        options: IServicePublishingOptions
    ) => IServiceRegistration;

    /*
     * <Map>_serviceClosureCache {
     *   key: <IPluginContext>user1 => value: {
     *     'serviceId1 user1 is using': {
     *       'serializedCallOptions1': <IServiceClosure>closure1,
     *       'serializedCallOptions2': <IServiceClosure>closure2,
     *       ...
     *     },
     *     'serviceId7 user1 is using': {
     *       'serializedCallOptions11': <IServiceClosure>closure31,
     *       ...
     *     },
     *   },
     *   key: <IPluginContext>someUser => value: {
     *     'someServiceId someUser is using': {
     *       'someSerializedCallOptions': <IServiceClosure>someClosure,
     *       ...
     *     }
     *   },
     *   ...
     * }
     */
    private _serviceClosureCache: Map<IPluginContext,
        IServiceClosureCacheByUser> = new Map();

    /*
     * <Map>_servicesByName {
     *   key: 'specProviderPackageName1' => value: <IServiceRegistrationsByServiceId> {
     *     'specProviderPackageName1's serviceId1': [
     *       <IServiceRegistration>reg1,
     *       <IServiceRegistration>reg2
     *       ...
     *     ],
     *     'specProviderPackageName1's serviceId3': [
     *       <IServiceRegistration>reg7,
     *       ...
     *     ]
     *   },
     *   key: 'specProviderPackageName8' => value: <IServiceRegistrationsByServiceId> {
     *     'specProviderPackageName8's serviceId7': [
     *       <IServiceRegistration>reg11,
     *       <IServiceRegistration>serviceContributionFromSomePackage
     *       ...
     *     ]
     *   },
     *   ...
     * }
     */
    private _servicesByName: Map<string,
        IServiceRegistrationsByServiceId> = new Map();

    constructor(container: ISystemContainer) {
        super();

        this._getAsyncService = (
            user: IPluginContext,
            serviceId: string,
            options: IServiceCallOptions
        ): Promise<IServiceClosure> => {
            const contributableDescriptor = user
                .getContributableServiceDescriptor(serviceId);
            if (!contributableDescriptor) {
                return Promise.reject(new ServiceError(
                    ServiceError.CONTRIBUTABLE_SERVICE_NOT_FOUND, serviceId));
            }
            if (!contributableDescriptor.isAsync) {
                return Promise.reject(new ServiceError(
                    ServiceError.ILLEGAL_ASYNC_SERVICE_CALL_SYNC, serviceId));
            }
            const promises = [];
            const contributionCache = container.getContributionCache();
            const lazies = this._getLazyDescriptorsByServiceId(serviceId);
            if (!lazies.length) {
                if (this.lookupCurrentRegistration(serviceId, options)) {
                    return Promise.resolve(
                        this._getServiceClosure(user, serviceId, options));
                }
                return Promise.reject(
                    new ServiceError(
                        ServiceError.NO_LAZY_SERVICE + `'${serviceId}'`));
            }
            while (lazies.length) {
                const lazySvcRecord = lazies.shift();
                if (lazySvcRecord) {
                    const {contributor, descriptor} = lazySvcRecord;
                    promises.push(contributionCache
                        .getServiceClass(contributor, descriptor)
                        .then(publishService(contributor, descriptor))
                        .catch((e) => $logger.error(e))
                    );
                }
            }
            return Promise.all(promises).then(() => {
                return this._getServiceClosure(user, serviceId, options);
            });
        };

        this._register = (
            publisher: IPluginContext,
            serviceId: string,
            service: object,
            options: IServicePublishingOptions = {}
        ): IServiceRegistration => {
            if (!service) {
                throw new ServiceError(ServiceError.UNDEFINED_SERVICE);
            }
            this._checkPermission(ContributablePermissionCategory.REALIZE, publisher, serviceId);
            const registration = new ServiceRegistration(
                this, container, publisher, serviceId, service);
            registration.register(options);
            return registration;
        };

        freeze(this, [
            '_lazyServiceQueue',
            '_serviceClosureCache',
            '_servicesByName'
        ]);
    }

    addServiceRegistration(registration: IServiceRegistration): void {
        const serviceId = registration.getServiceId();
        const registrations = this
            ._getRegistrationsByServiceId(serviceId);
        registrations.push(registration);
        this._setRegistrationsByServiceId(
            serviceId,
            this._sortRegistrations(registrations)
        );
    }

    enqueueLazyService(
        contributor: IPluginContext,
        descriptor: IContributingServiceDescriptor
    ): void {
        const serviceId = descriptor.id;
        const lazyServiceQueue = this._lazyServiceQueue;
        if (!lazyServiceQueue[serviceId]) {
            lazyServiceQueue[serviceId] = [];
        }
        lazyServiceQueue[serviceId].push({
            contributor, descriptor
        });
    }

    @trace
    getAsyncService(
        user: IPluginContext,
        serviceId: string,
        options: IServiceCallOptions
    ): Promise<IServiceClosure> {
        return this._getAsyncService(user, serviceId, options);
    }

    getRegistrationsByUser(context: IPluginContext): IServiceRegistration[] {
        const results: IServiceRegistration[] = [];
        this._forEachRegistrations((reg) => {
            if (reg.getUsers().indexOf(context) > -1) {
                results.push(reg);
            }
        });
        return results;
    }

    @trace
    getService(
        user: IPluginContext,
        serviceId: string,
        options: IServiceCallOptions
    ): IServiceClosure {
        const contributableDescriptor = user
            .getContributableServiceDescriptor(serviceId);
        if (!contributableDescriptor) {
            throw new ServiceError(
                ServiceError.CONTRIBUTABLE_SERVICE_NOT_FOUND, serviceId);
        }
        if (contributableDescriptor.isAsync) {
            throw new ServiceError(
                ServiceError.ILLEGAL_SERVICE_CALL_TO_ASYNC, serviceId);
        }
        return this._getServiceClosure(user, serviceId, options);
    }

    lookupCurrentRegistration(
        serviceId: string,
        options?: IServiceCallOptions
    ): IServiceRegistration | null {
        const registrations = this
            .lookupCurrentRegistrations(serviceId, options);
        return registrations[0] || null;
    }

    lookupCurrentRegistrations(
        serviceId: string,
        options?: IServiceCallOptions
    ): IServiceRegistration[] {
        const registrations = this
            ._getRegistrationsByServiceId(serviceId);
        let results = registrations.concat();
        if (options) {
            if (options.version) {
                const version = options.version;
                results = results.filter((registration) => {
                    return registration.getSpecProviderVersion() === version;
                });
            }
            if (options.vendor) {
                const vendor = options.vendor;
                results = results.filter((registration) => {
                    return registration.options.vendor === vendor;
                });
            }
            if (typeof options.orderBy === 'object') {
                const orders = ['asc', 'desc'];
                const orderBy = options.orderBy;
                if (orderBy.uid) {
                    if (orders.indexOf(orderBy.uid) > -1) {
                        results = orderby(results, ['uid'], [orderBy.uid]);
                    }
                }
                if (orderBy.priority) {
                    if (orders.indexOf(orderBy.priority) > -1) {
                        results = orderby(results, ['priority'], [orderBy.priority]);
                    }
                }
            }
        }
        return results;
    }

    // IPluginContext.publishService() method call this method.
    @trace
    register(
        publisherCtx: IPluginContext,
        serviceId: string,
        service: object,
        options: IServicePublishingOptions = {}
    ): IServiceRegistration {
        return this._register(publisherCtx, serviceId, service, options);
    }

    @trace
    releaseServicesInUse(context: IPluginContext): void {
        this.getRegistrationsByUser(context)
            .forEach((registration) => {
                registration.removeUser(context);
            });
        this._serviceClosureCache.delete(context);
        this._removeLazyServices(context);
    }

    removeServiceRegistration(registration: IServiceRegistration): void {
        this._forEachRegistrations((reg, serviceId, regsByServiceId) => {
            if (registration === reg) {
                const regs = regsByServiceId[serviceId];
                const index = regs.indexOf(reg);
                if (index > -1) {
                    regs.splice(index, 1);
                    $logger.log(
                        '{0} removed from ServiceRegistry', registration, '%f');
                }
            }
        });
    }

    unregister(registration: IServiceRegistration): void {
        registration.unregister();
    }

    unregisterServices(context: IPluginContext): void {
        this._getRegistrationsByPublisher(context)
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
        serviceId: string
    ): void {
        const contributableDescriptor = user.getContributableServiceDescriptor(serviceId);
        if (!contributableDescriptor) {
            throw new ServiceError(
                ServiceError.CONTRIBUTABLE_SERVICE_NOT_FOUND, serviceId);
        }
        if (!contributableDescriptor.permission.allowed(category, user)) {
            throw new ServiceError(ServiceError.NO_PERMISSION, user, category, serviceId);
        }
    }

    private _forEachRegistrations(cb:
        (
            reg: IServiceRegistration,
            serviceId: string,
            regsByServiceId: IServiceRegistrationsByServiceId
        ) => void
    ): void {
        this._servicesByName.forEach((regsByServiceId) => {
            Reflect.ownKeys(regsByServiceId).forEach((serviceId) => {
                const regs = regsByServiceId[serviceId];
                regs.forEach((reg) => {
                    cb(reg, serviceId as string, regsByServiceId);
                });
            });
        });
    }

    private _getLazyDescriptorsByServiceId(serviceId: string): ILazyServiceRecord[] {
        return this._lazyServiceQueue[serviceId] || [];
    }

    private _getRegistrationsByPublisher(context: IPluginContext): IServiceRegistration[] {
        const results: IServiceRegistration[] = [];
        this._forEachRegistrations((reg) => {
            if (reg.getPublisher() === context) {
                results.push(reg);
            }
        });
        return results;
    }

    private _getRegistrationsByServiceId(serviceId: string): IServiceRegistration[] {
        const providerName = getPackageNameFromId(serviceId);
        const servicesByProviderName = this
            ._getServicesBySpecProviderName(providerName);
        if (!Reflect.has(servicesByProviderName, serviceId)) {
            servicesByProviderName[serviceId] = [];
        }
        return servicesByProviderName[serviceId];
    }

    /*
     * The existence of the IContributableServiceDescriptor for the given serviceId
     * should be checked before calling this method so that this method could return
     * a valid IServiceClosure instance.
     */
    private _getServiceClosure(
        user: IPluginContext,
        serviceId: string,
        options: IServiceCallOptions
    ): IServiceClosure {
        this._checkPermission(ContributablePermissionCategory.CALL, user, serviceId);
        const opt = typeof options === 'object'
            ? JSON.stringify(options) : 'none';
        const cache = this._serviceClosureCache;
        let cacheByUser = cache.get(user);
        if (!cacheByUser) {
            cacheByUser = {};
            cache.set(user, cacheByUser);
        }
        if (!cacheByUser[serviceId]) {
            cacheByUser[serviceId] = {};
        }
        if (cacheByUser[serviceId][opt]) {
            return cacheByUser[serviceId][opt];
        }
        const serviceRegisty = this as IServiceRegistry;
        const closure = new ServiceClosure(serviceRegisty, user, serviceId, options);
        cacheByUser[serviceId][opt] = closure;
        return closure;
    }

    private _getServicesBySpecProviderName(providerName: string): IServiceRegistrationsByServiceId {
        const servicesMap = this._servicesByName;
        if (!servicesMap.has(providerName)) {
            servicesMap.set(providerName, {});
        }
        return servicesMap.get(providerName) as IServiceRegistrationsByServiceId;
    }

    private _removeLazyServices(contributor: IPluginContext): void {
        const lazyServiceQueue = this._lazyServiceQueue;
        Reflect.ownKeys(lazyServiceQueue).forEach((serviceId) => {
            const deathNote: number[] = [];
            const lazyServicesById = lazyServiceQueue[serviceId];
            lazyServicesById.forEach((item, i) => {
                if (item.contributor === contributor) {
                    deathNote.push(i);
                }
            });
            deathNote.reverse().forEach((i) => {
                lazyServicesById.splice(i, 1);
            });
        });
    }

    private _setRegistrationsByServiceId(
            serviceId: string, registrations: IServiceRegistration[]): void {
        const providerName = getPackageNameFromId(serviceId);
        const servicesByProviderName = this
            ._getServicesBySpecProviderName(providerName);
        servicesByProviderName[serviceId] = registrations;
    }

    private _sortRegistrations(
            registrations: IServiceRegistration[]): IServiceRegistration[] {
        return orderby(
            registrations, ['priority', 'id'], ['desc', 'asc']);
    }
}

export default ServiceRegistry;
