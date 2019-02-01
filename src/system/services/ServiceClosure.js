/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Base from '../bases/Base';

class ServiceClosure extends Base {

    constructor(serviceRegistry, user, serviceId, options) {
        super();
        this.define('_serviceRegistry', serviceRegistry);
        this.define('_user', user);
        this.define('_serviceId', serviceId);
        this.define('_options', options);
        this.define('_registration', null, {
            writable: true
        });
        this.define('_ready', null, {
            writable: true
        });
        this._bindServiceEvents();
        this._refreshService();
    }

    ready(cb, always) {
        if (this._ready) {
            cb(this);
        } else {
            //TODO off event if disposed
            const listener = (service) => {
                if (this._ready) {
                    cb(service);
                    if (!always) {
                        this.off('refresh', listener);
                    }
                }
            };
            this.on('refresh', listener);
        }
    }

    _bindServiceEvents() {
        this._serviceRegistry.on('registered', (/*reg*/) => {
            //TODO conditional refresh
            this._refreshService();
        });
        this._serviceRegistry.on('unregistered', (/*reg*/) => {
            //TODO conditional refresh
            this._refreshService();
        });
    }

    _refreshService() {
        this._updateRegistration();
        this._createProxy();
        this._updateReadyState();
        this.emit('refresh', this);
    }

    /**
     * 1) Lookup recent service registrations.
     * 2) Update the registration.
     */
    _updateRegistration() {
        const currentRegistration = this._serviceRegistry
            .lookupCurrentRegistration(this._serviceId, this._options);
        if (this._registration) {
            this._registration.removeUser(this._user);
        }
        if (currentRegistration) {
            currentRegistration.addUser(this._user);
        }
        this._registration = currentRegistration;
    }

    _createProxy() {
        const registration = this._registration;
        if (!registration) {
            return;
        }
        const service = registration.getService();
        const spec = registration.getServiceSpec();
        Reflect.ownKeys(spec).forEach((key) => {
            if (spec[key] === 'function'
                || (typeof spec[key] === 'object'
                    && spec[key].type === 'function')) {
                let proxy;
                if (typeof service[key] === 'function') {
                    proxy = function (...args) {
                        return service[key].apply(service, args);
                    };
                } else {
                    proxy = function () {};
                }
                this.define(key, proxy, {
                    writable: true
                });
            }
        });
    }

    _updateReadyState() {
        const registration = this._registration;
        if (registration && registration.priority > -1) {
            this._ready = true;
        } else {
            this._ready = false;
        }
    }
}

export default ServiceClosure;
