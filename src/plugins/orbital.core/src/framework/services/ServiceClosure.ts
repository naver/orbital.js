/* tslint:disable:variable-name */

import {$logger, Base, freeze} from 'orbital.core.common';
import {
    IBase,
    IContributableDescriptor,
    IContributableSpec,
    IPluginContext,
    IServiceCallOptions,
    IServiceClosure,
    IServiceRegistration,
    IServiceRegistry,
    ServiceClosureEvent,
    ServiceRegistryEvent
} from 'orbital.core.types';
import ServiceError from '../exceptions/ServiceError';

/**
 * The existence of the IContributableServiceDescriptor for the given serviceId
 * should be checked before creating an instance of this Class.
 */
class ServiceClosure implements IServiceClosure {

    readonly emitter: IBase;

    private readonly __options: IServiceCallOptions;
    private __registration: IServiceRegistration | null = null;
    private readonly __serviceId: string;
    private readonly __serviceRegistry: IServiceRegistry;
    private readonly __spec: IContributableSpec;
    private readonly __user: IPluginContext;

    constructor(serviceRegistry: IServiceRegistry, user: IPluginContext,
                serviceId: string, options: IServiceCallOptions) {
        this.emitter = new Base();
        // TODO ??? The existence of contributableDescriptor should be checked in advance.
        // The user-context can get the ContributableServiceDescriptor
        // because the user-context's package specified the dependency.
        const contributableDescriptor = user
            .getContributableServiceDescriptor(serviceId) as IContributableDescriptor;
        this.__options = options;
        this.__serviceId = serviceId;
        this.__serviceRegistry = serviceRegistry;
        this.__spec = contributableDescriptor.spec;
        this.__user = user; // service caller
        this.__bindServiceEvents();
        this.__refreshService();
        freeze(this, [
            'emitter', '__options', '__serviceId', '__serviceRegistry', '__spec', '__user'
        ], false);
    }

    private __bindServiceEvents() {
        this.__serviceRegistry.on(ServiceRegistryEvent.registered, (reg) => {
            if (this.__serviceId === reg.getServiceId()) {
                this.__refreshService();
            }
        });
        this.__serviceRegistry.on(ServiceRegistryEvent.unregistered, (reg) => {
            if (this.__serviceId === reg.getServiceId()) {
                this.__refreshService();
            }
        });
    }

    private __createEmptyProxy() {
        /* tslint:disable:only-arrow-functions */
        /* tslint:disable:no-empty */
        const serviceId = this.__serviceId;
        this.__forEachSpecMethod((methodName) => {
            Object.defineProperty(this, methodName, {
                value() {
                    throw new ServiceError(
                        ServiceError.NO_SERVICE_IMPLEMENTATION, serviceId
                    );
                },
                writable: true
            });
        });
    }

    private __createProxy() {
        /* tslint:disable:only-arrow-functions */
        /* tslint:disable:no-empty */
        if (!this.__registration) {
            return this.__createEmptyProxy();
        }
        const registration = this.__registration;
        const serviceInstance = registration.getServiceInstance();
        this.__forEachSpecMethod((methodName) => {
            if (methodName === 'emitter') {
                $logger.warn(ServiceError.RESERVED_PROP_EMITTER);
                return;
            }
            let proxy;
            if (typeof serviceInstance[methodName] === 'function') {
                proxy = function (...args: any[]) {
                    return serviceInstance[methodName].apply(serviceInstance, args);
                };
            } else {
                proxy = function () {};
            }
            Object.defineProperty(this, methodName, {
                value: proxy,
                writable: true
            });
        });
    }

    private __forEachSpecMethod(iteratee: (methodName: PropertyKey) => void) {
        const spec = this.__spec;
        Reflect.ownKeys(spec).forEach((key) => {
            // TODO normalize service spec then
            // TODO remove spec[key] === 'function'
            if (spec[key] === 'function' || spec[key].type === 'function') {
                iteratee(key);
            }
        });
    }

    private __refreshService() {
        this.__updateRegistration();
        this.__createProxy();
        const isReady = this.__registration && (this.__registration.priority > -1);
        if (isReady) {
            this.emitter.emit(ServiceClosureEvent.ready, this);
        }
        this.emitter.emit(ServiceClosureEvent.refresh, this);
    }

    /*
     * 1) Lookup recent service registrations.
     * 2) Update the registration.
     */
    private __updateRegistration() {
        const currentRegistration = this.__serviceRegistry
            .lookupCurrentRegistration(this.__serviceId, this.__options);
        if (this.__registration) {
            this.__registration.removeUser(this.__user);
        }
        if (currentRegistration) {
            currentRegistration.addUser(this.__user);
        }
        this.__registration = currentRegistration;
    }
}

export default ServiceClosure;
