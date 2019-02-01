/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Notice from '../../util/Notice';
import Base from '../bases/Base';
import ServiceError from '../exceptions/ServiceError';
import Manifest from '../Manifest';
import ServiceClosure from './ServiceClosure';
import ServiceRegistration from './ServiceRegistration';
import orderby from 'lodash.orderby';

class ServiceRegistry extends Base {

    /**
     * <Map>_servicesByName
     * -packageName1
     *   -serviceId1
     *     -<ServiceRegistration>#1
     *     -<ServiceRegistration>#2
     *     -...
     *   -serviceId2
     *   -...
     * -packageName2
     * -...
     */
    constructor() {
        super();
        this.define('_servicesByName', new Map());
    }

    register(publisher, serviceId, service, options) {
        if (!service) {
            throw new ServiceError(ServiceError.UNDEFINED_SERVICE);
        }
        //TODO Check Permission
        const providerName = Manifest.getPackageName(serviceId);
        const publisherPlugin = publisher.getPlugin();
        const publisherName = publisherPlugin.getName();
        const publisherVersion = publisherPlugin.getVersion();
        let version;
        if (publisherName === providerName) {
            version = publisherVersion;
        } else {
            version = options.type === 'super' ?
                publisherVersion :
                publisher.getDependencyVersion(providerName);
        }
        const registration = new ServiceRegistration(
            this, publisher, version, serviceId, service);
        registration.register(options);
        return registration;
    }

    /**
     * Called when the PluginContext is closing to
     * unget all services currently used by the plugin.
     *
     * @param {PluginContext} context
     *    The PluginContext of the closing plugin.
     */
    releaseServicesInUse(context) {
        this._getRegistrationsByUser(context)
            .forEach((registration) => {
                registration.removeUser(context);
            });
    }

    /**
     * Unregisters a service with the given ServiceRegistration.
     * which is registered by this PluginContext's Plugin.
     * A service can only be unregistered by the
     * service provider (an implementer or a spec-consumer).
     * This method is automatically called
     * When the plugin is about to stop.
     *
     * @param {ServiceRegistration} registration
     */
    unregister(registration) {
        registration.unregister();
    }

    /**
	 * Called when the Context is closing to unregister
     * all services currently registered by the plugin.
	 *
	 * @param {PluginContext} context
     *    The PluginContext of the closing plugin.
	 */
    unregisterServices(context) {
        this._getRegistrationsByPublisher(context)
            .forEach((registration) => {
                registration.unregister();
            });
    }

    /**
     * <Map>_servicesByName
     * -packageName1
     *   -serviceId1
     *     -<ServiceRegistration>#1
     *     -<ServiceRegistration>#2
     *     -...
     *   -serviceId2
     *   -...
     * -packageName2
     * -...
     */
    addServiceRegistration(registration) {
        const serviceId = registration.getServiceId();
        const registrations = this
            ._getRegistrationsByServiceId(serviceId);
        registrations.push(registration);
        this._setRegistrationsByServiceId(
            serviceId,
            this._sortRegistrations(registrations)
        );
    }

    /**
     * Removes ServiceRegistration from registry.
     * @param {ServiceRegistration} registration
     */
    removeServiceRegistration(registration) {
        this._forEachRegistrations((reg, serviceId, regsByServiceId) => {
            if (registration === reg) {
                const regs = regsByServiceId[serviceId];
                const index = regs.indexOf(reg);
                if (index > -1) {
                    regs.splice(index, 1);
                    Notice.log(`${registration} removed from ServiceRegistry`);
                }
            }
        });
    }

    /**
     * This method returns Service instance which contains
     * an actual service implementation.
     * the implementation inside of the Service instance
     * can be changed by ServiceRegistry's
     * register, unregister event.
     *
     * @param {PluginContext} user
     * @param {string} serviceId
     * @param {Object} options
     * @property {string} version
     * @property {string} vendor
     * @property {Object} orderBy
     * @return {ServiceClosure}
     */
    getService(user, serviceId, options) {
        //TODO checkPermission();
        return new ServiceClosure(
            this, user, serviceId, options);
    }

    lookupCurrentRegistration(serviceId, options) {
        const registrations = this
            .lookupCurrentRegistrations(serviceId, options);
        return registrations[0];
    }

    lookupCurrentRegistrations(serviceId, options) {
        const registrations = this
            ._getRegistrationsByServiceId(serviceId);
        let results = registrations.concat();
        if (options) {
            if (options['version']) {
                const version = options['version'];
                results = results.filter((registration) => {
                    return registration.getSpecProviderVersion() === version;
                });
            }
            if (options['vendor']) {
                const vendor = options['vendor'];
                results = results.filter((registration) => {
                    return registration.options.vendor === vendor;
                });
            }
            if (typeof options['orderBy'] === 'object') {
                const orders = ['asc', 'desc'];
                const orderBy = options['orderBy'];
                if (orders.indexOf(orderBy.id) > -1) {
                    results = orderby(results, ['id'], [orderBy.id]);
                }
                if (orders.indexOf(orderBy.priority) > -1) {
                    results = orderby(results, ['priority'], [orderBy.priority]);
                }
            }
        }
        return results;
    }

    _forEachRegistrations(cb) {
        this._servicesByName.forEach((regsByServiceId) => {
            Reflect.ownKeys(regsByServiceId).forEach((serviceId) => {
                const regs = regsByServiceId[serviceId];
                regs.forEach((reg) => {
                    cb(reg, serviceId, regsByServiceId);
                });
            });
        });
    }

    _getServicesBySpecProviderName(providerName) {
        const servicesMap = this._servicesByName;
        if (!servicesMap.has(providerName)) {
            servicesMap.set(providerName, {});
        }
        return servicesMap.get(providerName);
    }

    /**
     * @return {Array.<ServiceRegistration>}
     */
    _getRegistrationsByServiceId(serviceId) {
        const providerName = Manifest.getPackageName(serviceId);
        const servicesByProviderName = this
            ._getServicesBySpecProviderName(providerName);
        if (!Reflect.has(servicesByProviderName, serviceId)) {
            servicesByProviderName[serviceId] = [];
        }
        return servicesByProviderName[serviceId];
    }

    /**
     * @return {Array.<ServiceRegistration>}
     */
    _getRegistrationsByPublisher(context) {
        const results = [];
        this._forEachRegistrations((reg) => {
            if (reg.getPublisher() === context) {
                results.push(reg);
            }
        });
        return results;
    }

    /**
     * Returns array of Registrations
     * which the given context uses of.
     * @return {Array.<ServiceRegistration>}
     */
    _getRegistrationsByUser(context) {
        const results = [];
        this._forEachRegistrations((reg) => {
            if (reg.getUsers().indexOf(context) > -1) {
                results.push(reg);
            }
        });
        return results;
    }

    _setRegistrationsByServiceId(serviceId, registrations) {
        const providerName = Manifest.getPackageName(serviceId);
        const servicesByProviderName = this
            ._getServicesBySpecProviderName(providerName);
        servicesByProviderName[serviceId] = registrations;
    }

    _sortRegistrations(registrations) {
        return orderby(
            registrations, ['priority', 'id'], ['desc', 'asc']);
    }
}

export default ServiceRegistry;
