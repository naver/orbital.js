import {Base, freeze} from 'orbital.core.common';
import {
    IContributingExtensionDescriptor,
    IContributionResolver,
    IExtensionModule,
    IExtensionResolver,
    IPlugin,
    ISystemContainer
} from 'orbital.core.types';
import ExtensionError from '../exceptions/ExtensionError';

class ExtensionResolver extends Base implements IExtensionResolver {

    constructor(private _container: ISystemContainer, private _resolver: IContributionResolver) {
        super();
        freeze(this, ['_container', '_resolver']);
    }

    resolve(): Promise<void> {
        return this._resolveContributingExtensions();
    }

    private _addExtension(descriptor: IContributingExtensionDescriptor): Promise<void> {
        const {plugin, report} = this._resolver;
        return new Promise((resolve, reject) => {
            try {
                if (plugin.getManifest().hasPolicy('eager')) {
                    this._requireExtensionModule(descriptor)
                        .then((module) => {
                            if (typeof module === 'object') {
                                this._addExtensionByPolicy(
                                    plugin, descriptor, module);
                                resolve(void 0);
                            } else {
                                throw new ExtensionError(
                                    ExtensionError.ABNORMAL_MODULE,
                                    plugin.getName(), descriptor.id);
                            }
                        })
                        .catch((e) => {
                            report.addFailure(e);
                            reject(e);
                        });
                } else {
                    this._addExtensionByPolicy(
                        plugin, descriptor, null);
                    resolve(void 0);
                }
            } catch (e) {
                report.addFailure(e);
                reject(e);
            }
        });
    }

    private _addExtensionByPolicy(plugin: IPlugin,
            descriptor: IContributingExtensionDescriptor,
            module: IExtensionModule | null) {
        this._container.getExtensionRegistry().addExtension(
            plugin.getContext(),
            descriptor,
            module,
            {
                priority: descriptor.priority,
                vendor: descriptor.vendor
            }
        );
    }

    /*
     * Requires contribution module asynchronously.
     */
    private _requireExtensionModule(descriptor: IContributingExtensionDescriptor) {
        const contributor = this._resolver.plugin.getContext();
        const cache = this._container.getContributionCache();
        return cache.getExtensionModule(contributor, descriptor);
    }

    private _resolveContributingExtensions(): Promise<void> {
        const {plugin} = this._resolver;
        const promises: Array<Promise<void>> = plugin
            .getManifest()
            .getOwnContributingExtensionDescriptors()
            .map((descriptor) => {
                return this._addExtension(descriptor);
            });
        return Promise.all(promises)
            .then(() => Promise.resolve(void 0));
    }
}

export default ExtensionResolver;
