/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Notice from '../../util/Notice';
import Base from '../bases/Base';
import ServiceResolver from '../services/ServiceResolver';
import ExtensionResolver from '../extensions/ExtensionResolver';
import ExportsRegistry from './ExportsRegistry';
import ResolutionReport from './ResolutionReport';

class ContributionResolver extends Base {

    constructor(plugin) {
        super();
        this.define('plugin', plugin);
        this.define('report', new ResolutionReport(plugin));
    }

    /**
     * @return {Promise}
     */
    resolve() {
        Notice.log(`${this.plugin.getId()} registering contributions ...`);
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
        return new Promise((resolve/*, reject*/) => {
            try {
                const manifest = this.plugin.getManifest();
                if (manifest.activator) {
                    const exports = ExportsRegistry
                        .getExportsByPlugin(this.plugin);
                    if (typeof exports.Activator !== 'function') {
                        throw new Error(
                            'Activator should be a constructor.');
                    }
                    resolve(null);
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
        return '<ContributionResolver>(' + this.plugin.getId() + ')';
    }
}

export default ContributionResolver;
