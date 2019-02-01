/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Base from '../bases/Base';
import ExportsRegistry from '../resolution/ExportsRegistry';

class ExtensionResolver extends Base {

    constructor(resolver) {
        super();
        this.define('resolver', resolver);
        this.define('_extReg', resolver.plugin
            .getContext().getExtensionRegistry());
    }

    /**
     * @return {Promise}
     */
    resolve() {
        //TODO this._resolveContributableExtensions();
        return this._resolveContributingExtensions();
    }

    _resolveContributableExtensions() {
        const extReg = this._extReg;
        const report = this.resolver.report;
        const plugin = this.resolver.plugin;
        const manifest = plugin.getManifest();
        manifest.getContributableExtensionDescriptors()
            .forEach((descriptor) => {
                try {
                    extReg.registerContributableExtension(descriptor);
                } catch (e) {
                    report.addFailure(e);
                }
            });
    }

    /**
     * @return {Promise}
     */
    _resolveContributingExtensions() {
        const promises = [];
        const plugin = this.resolver.plugin;
        const manifest = plugin.getManifest();
        manifest.getContributingExtensionDescriptors()
            .forEach((descriptor) => {
                promises.push(this._addExtension(descriptor));
            });
        return Promise.all(promises);
    }

    /**
     * @return {Promise}
     */
    _addExtension(descriptor) {
        const extensionRegistry = this._extReg;
        const plugin = this.resolver.plugin;
        const report = this.resolver.report;
        return new Promise((resolve) => {
            try {
                this._requireExtensionModule(descriptor, (module) => {
                    try {
                        extensionRegistry.addExtension(
                            plugin.getContext(),
                            descriptor,
                            module,
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
    _requireExtensionModule(descriptor, callback) {
        const {provider, version, id, index} = descriptor;
        const contributor = this.resolver.plugin;
        const exp = ExportsRegistry
            .getExportsByPlugin(contributor);
        const extensionModule = exp.contributes
            .extensions[provider][version][id][index];
        callback(extensionModule);
    }
}

export default ExtensionResolver;
