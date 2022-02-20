import {Base, freeze, trace} from 'orbital.core.common';
import {
    IContributableServiceDescriptor,
    IContributableSpec,
    IContributingServiceDescriptor,
    IContributionResolver,
    IServiceResolver,
    ISystemContainer
} from 'orbital.core.types';
import ServiceError from '../exceptions/ServiceError';

class ServiceResolver extends Base implements IServiceResolver {

    constructor(private _container: ISystemContainer, private _resolver: IContributionResolver) {
        super();
        freeze(this, ['_container', '_resolver']);
    }

    resolve(): Promise<void> {
        return this._resolveContributableServices().then(() => {
            return this._resolveContributingServices();
        });
    }

    private _getSuperService(spec: IContributableSpec) {
        /* tslint:disable no-empty */
        /* tslint:disable max-classes-per-file */
        class SuperService {}
        const proto = SuperService.prototype;
        Reflect.ownKeys(spec).forEach((key) => {
            if (spec[key] === 'function') {
                Reflect.defineProperty(proto, key, {
                    value() {}
                });
            }
        });
        return SuperService;
    }

    /*
     * By default, this method passes IPluginContext
     * to the published Service. But users who don't want pass it,
     * may use PluginContext.publishService() explicitly.
     */
    private _publishService(descriptor: IContributingServiceDescriptor): Promise<void> | never {
        const report = this._resolver.report;
        const plugin = this._resolver.plugin;
        const context = plugin.getContext();
        const manifest = plugin.getManifest();
        const serviceId = descriptor.id;
        const contributableDescriptor = context
            .getContributableServiceDescriptor(serviceId);
        if (!contributableDescriptor) {
            throw new ServiceError(
                ServiceError.CONTRIBUTABLE_SERVICE_NOT_FOUND, serviceId);
        }
        return new Promise((resolve, reject) => {
            try {
                if (manifest.hasPolicy('eager')
                    || !contributableDescriptor.isAsync) {
                    this._requireServiceClass(descriptor)
                        .then((ServiceClass) => {
                            const {priority, vendor} = descriptor;
                            context.publishService(
                                serviceId,
                                new ServiceClass(context),
                                {priority, vendor}
                            );
                            resolve(void 0);
                        })
                        .catch((e) => {
                            report.addFailure(e);
                            reject(e);
                        });
                } else {
                    this._container.getServiceRegistry()
                        .enqueueLazyService(context, descriptor);
                    resolve(void 0);
                }
            } catch (e) {
                report.addFailure(e);
                reject(e);
            }
        });
    }

    @trace
    private _registerSuperService(descriptor: IContributableServiceDescriptor) {
        const plugin = this._resolver.plugin;
        const SuperService = this._getSuperService(descriptor.spec);
        plugin.getContext().publishService(
            descriptor.id,
            new SuperService(),
            {
                priority: -1,
                type: 'super',
                vendor: ''
            }
        );
    }

    /*
     * Requires contribution module asynchronously.
     */
    private _requireServiceClass(descriptor: IContributingServiceDescriptor) {
        const context = this._resolver.plugin.getContext();
        const cache = this._container.getContributionCache();
        return cache.getServiceClass(context, descriptor);
    }

    /*
     * This method does not need to return a Promise,
     * because there is no async action during it's process.
     * RESOLUTION_FAILURE_CASE: CANNOT_REGISTER_SUPER_SERVICE
     */
    private _resolveContributableServices(): Promise<void> {
        const report = this._resolver.report;
        const plugin = this._resolver.plugin;
        const manifest = plugin.getManifest();
        return new Promise((resolve, reject) => {
            try {
                manifest.getOwnContributableServiceDescriptors()
                    .forEach((descriptor) => {
                        // TODO Review how to deal with tolerant service.
                        if (descriptor.isTolerant) {
                            this._registerSuperService(descriptor);
                        }
                    });
                resolve(void 0);
            } catch (e) {
                report.addFailure(e);
                reject(e);
            }
        });
    }

    private _resolveContributingServices(): Promise<void> {
        const {plugin} = this._resolver;
        const promises: Array<Promise<void>> = plugin
            .getManifest()
            .getOwnContributingServiceDescriptors()
            .map((descriptor) => {
                return this._publishService(descriptor);
            });
        return Promise.all(promises)
            .then(() => Promise.resolve(void 0));
    }
}

export default ServiceResolver;
