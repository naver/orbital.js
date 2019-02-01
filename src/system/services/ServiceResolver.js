/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Base from '../bases/Base';
import ExportsRegistry from '../resolution/ExportsRegistry';

class ServiceResolver extends Base {

    constructor(resolver) {
        super();
        this.define('resolver', resolver);
    }

    /**
     * @return {Promise}
     */
    resolve() {
        this._resolveContributableServices();
        return this._resolveContributingServices();
    }

    /**
     * This method does not need to return a Promise,
     * because there is no async action during it's process.
     * RESOLUTION_FAILURE_CASE: CANNOT_REGISTER_SUPER_SERVICE
     */
    _resolveContributableServices() {
        const report = this.resolver.report;
        const plugin = this.resolver.plugin;
        const manifest = plugin.getManifest();
        manifest.getContributableServiceDescriptors()
            .forEach((descriptor) => {
                try {
                    this._registerSuperService(descriptor);
                } catch (e) {
                    report.addFailure(e);
                }
            });
    }

    /**
     * @return {Promise}
     */
    _resolveContributingServices() {
        const promises = [];
        const plugin = this.resolver.plugin;
        const manifest = plugin.getManifest();
        manifest.getContributingServiceDescriptors()
            .forEach((descriptor) => {
                promises.push(this._publishService(descriptor));
            });
        return Promise.all(promises);
    }

    /**
     * @return {Promise}
     * By default, This method passes PluginContext
     * to the published Service. But users who don't want pass it,
     * may use PluginContext.publishService() explicitly.
     */
    _publishService(descriptor) {
        const report = this.resolver.report;
        const contributor = this.resolver.plugin;
        const context = contributor.getContext();
        return new Promise((resolve) => {
            try {
                this._requireServiceClass(descriptor, (ServiceClass) => {
                    try {
                        contributor.getContext().publishService(
                            descriptor.id,
                            new ServiceClass(context),
                            {
                                priority: descriptor.priority,
                                vendor: descriptor.vendor
                            }
                        );
                        resolve(null);
                    } catch (e) {
                        report.addFailure(e);
                        resolve(null);
                    }
                });
            } catch (e) {
                report.addFailure(e);
                resolve(null);
            }
        });
    }

    /**
     * TODO Async code for AMD.
     * TODO Consider, we can make _exports lazily.
     */
    _requireServiceClass(descriptor, callback) {
        const contributor = this.resolver.plugin;
        const _exports = ExportsRegistry
            .getExportsByPlugin(contributor);
        const {provider, version, id, index} = descriptor;
        const ServiceClass = _exports.contributes
            .services[provider][version][id][index];
        callback(ServiceClass);
    }

    _registerSuperService(descriptor) {
        const plugin = this.resolver.plugin;
        const SuperService = this._getSuperService(descriptor.spec);
        plugin.getContext().publishService(
            descriptor.id,
            new SuperService(),
            {
                priority: -1,
                vendor: '',
                type: 'super'
            }
        );
    }

    _getSuperService(spec) {
        const SuperService = function () {};
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
}

export default ServiceResolver;
