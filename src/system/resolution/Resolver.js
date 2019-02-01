/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Base from '../bases/Base';
import ServiceResolver from '../services/ServiceResolver';
import ExtensionResolver from '../extensions/ExtensionResolver';
import ExportsRegistry from './ExportsRegistry';
import ResolutionReport from './ResolutionReport';

class Resolver extends Base {

    constructor(plugin) {
        super();
        this.define('plugin', plugin);
        this.define('report', new ResolutionReport(plugin));
    }

    /**
     * @return {Promise}
     */
    resolve() {
        const wirings = [];
        wirings.push(this.wireActivator());
        wirings.push(this.wireServices());
        wirings.push(this.wireExtensions());
        return Promise.all(wirings).then(() => {
            return this.report;
        });
    }

    /**
     * @return {Promise}
     */
    wireActivator() {
        return new Promise((resolve, reject) => {
            try {
                const exports = ExportsRegistry.getExportsByPlugin(this.plugin);
                if (exports.Activator && (typeof exports.Activator !== 'function')) {
                    throw new Error();
                }
                resolve(null);
            } catch (e) {
                this.report.addWarning(e);
                resolve(null);
            }
        });
    }

    /**
     * @return {Promise}
     */
    wireServices() {
        const serviceResolver = new ServiceResolver(this);
        return serviceResolver.resolve();
    }

    /**
     * @return {Promise}
     */
    wireExtensions() {
        const extensionResolver = new ExtensionResolver(this);
        return extensionResolver.resolve();
    }

    toString() {
        return '<Resolver>(' + this.plugin.getId() + ')';
    }
}

export default Resolver;
