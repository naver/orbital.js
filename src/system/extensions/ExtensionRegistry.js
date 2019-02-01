/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Base from '../bases/Base';
import ExtensionError from '../exceptions/ExtensionError';
import Manifest from '../Manifest';
import ExtensionRegistration from './ExtensionRegistration';
import orderby from 'lodash.orderby';

class ExtensionRegistry extends Base {

    /**
     * <Map>_contributingExtensions
     * -packageName1
     *   -extensionId1
     *     -<ExtensionRegistration>#1
     *     -<ExtensionRegistration>#2
     *     -...
     *   -extensionId2
     *   -...
     * -packageName2
     * -...
     */
    constructor() {
        super();
        this.define('_extensionsByName', new Map());
        this.define('_contributableExtensions', new Map());
    }

    /**
     * @return {Array.<ExtensionRegistration>}
     * TODO Consider if this is safe or not.
     * TODO Consider more capsulized return.
     */
    getExtensionRegistrations(extensionId) {
        return this._getRegistrationsByExtensionId(extensionId);
    }

    /**
     *
     */
    getExtensions(extensionId) {
        const registrations = this._getRegistrationsByExtensionId(extensionId);
        const modules = [];
        registrations.forEach((registration) => {
            modules.push(registration.getModule(true));
        });
        return modules;
    }

    registerContributableExtension(descriptor) {
        console.info('descriptor => ', descriptor);
        //TODO Is this required?
    }

    /**
     * @param {PluginContext} contributor
     * @param {string} extensionId
     * @param {Object} module
     * @param {Object} options
     */
    addExtension(contributor, descriptor, module, options) {
        this.debug('addExtension()', contributor.getPlugin().getId(),
            descriptor.id, JSON.stringify(module), JSON.stringify(options));
        if (typeof module !== 'object') {
            const pluginName = contributor.getPlugin().getName();
            throw new ExtensionError(
                ExtensionError.ABNORMAL_MODULE, pluginName, descriptor.id);
        }
        //TODO Check Permission
        const registration = new ExtensionRegistration(
            this, contributor, descriptor, module);
        registration.register(options);
        return registration;
    }

    /**
     * @param {PluginContext} contributor
     */
    unregisterExtensions(contributor) {
        this._getRegistrationsByContributor(contributor)
            .forEach((registration) => {
                registration.unregister();
            });
    }

    /**
     * <Map>_contributingExtensions
     * -packageName1
     *   -extensionId1
     *     -<ExtensionRegistration>#1
     *     -<ExtensionRegistration>#2
     *     -...
     *   -extensionId2
     *   -...
     * -packageName2
     * -...
     */
    addExtensionRegistration(registration) {
        const providerName = registration.getSpecProviderName();
        const extensionId = registration.getExtensionId();
        const registrations = this
            ._getRegistrationsByExtensionId(extensionId);
        registrations.push(registration);
        this._setRegistrationsByExtensionId(
            providerName,
            extensionId,
            this._sortRegistrations(registrations)
        );
    }

    /**
     * Removes ExtensionRegistration from registry.
     * @param {ExtensionRegistration} registration
     */
    removeExtensionRegistration(registration) {
        this._forEachRegistrations((reg, extensionId, regsByExtensionId) => {
            if (registration === reg) {
                const regs = regsByExtensionId[extensionId];
                const index = regs.indexOf(reg);
                if (index > -1) {
                    regs.splice(index, 1);
                    this.debug(`${registration} removed`);
                }
            }
        });
    }

    _forEachRegistrations(cb) {
        this._extensionsByName.forEach((regsByExtensionId) => {
            Reflect.ownKeys(regsByExtensionId).forEach((extensionId) => {
                const regs = regsByExtensionId[extensionId];
                regs.forEach((reg) => {
                    cb(reg, extensionId, regsByExtensionId);
                });
            });
        });
    }

    _getRegistrationsByContributor(context) {
        const results = [];
        this._forEachRegistrations((reg) => {
            if (reg.getContributor() === context) {
                results.push(reg);
            }
        });
        return results;
    }

    /**
     * @return {Array.<ExtensionRegistration>}
     * TODO return clone
     */
    _getRegistrationsByExtensionId(extensionId) {
        const providerName = Manifest.getPackageName(extensionId);
        const extensionsByProviderName = this
            ._getExtensionsByProviderName(providerName);
        if (!Reflect.has(extensionsByProviderName, extensionId)) {
            extensionsByProviderName[extensionId] = [];
        }
        return extensionsByProviderName[extensionId];
    }

    _setRegistrationsByExtensionId(providerName, extensionId, registrations) {
        const extensionsByProviderName = this
            ._getExtensionsByProviderName(providerName);
        extensionsByProviderName[extensionId] = registrations;
    }

    _getExtensionsByProviderName(providerName) {
        const extensionsMap = this._extensionsByName;
        if (!extensionsMap.has(providerName)) {
            extensionsMap.set(providerName, {});
        }
        return extensionsMap.get(providerName);
    }

    _sortRegistrations(registrations) {
        return orderby(
            registrations, ['priority', 'id'], ['desc', 'asc']);
    }
}

export default ExtensionRegistry;
