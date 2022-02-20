import {$logger, Base} from 'orbital.core.common';
import {
    IContributionResolutionReport,
    IContributionResolver,
    IPlugin,
    ISystemContainer
} from 'orbital.core.types';
import ResolutionError from '../exceptions/ResolutionError';
import ExtensionResolver from '../extensions/ExtensionResolver';
import ServiceResolver from '../services/ServiceResolver';
import ResolutionReport from './ResolutionReport';

class ContributionResolver extends Base implements IContributionResolver {

    readonly plugin: IPlugin;
    readonly report: IContributionResolutionReport;

    private readonly _resolve: () => Promise<IContributionResolutionReport>;

    constructor(plugin: IPlugin, container: ISystemContainer) {
        super();
        this.plugin = plugin;
        this.report = new ResolutionReport(plugin);
        this._resolve = () => {
            return new Promise((resolve, reject) => {
                const wirings = [];
                const report = this.report;
                wirings.push(this.wireActivator(container));
                wirings.push(this.wireServices(container));
                wirings.push(this.wireExtensions(container));
                Promise.all(wirings).then(() => {
                    resolve(report);
                }).catch(() => {
                    reject(report);
                });
            });
        };
        Object.freeze(this);
    }

    resolve(): Promise<IContributionResolutionReport> {
        $logger.log('{0} registering contributions ...', this.plugin.getId(), '%f');
        return this._resolve();
    }

    toString() {
        return '<ContributionResolver>(' + this.plugin.getId() + ')';
    }

    wireActivator(container: ISystemContainer): Promise<void> {
        return new Promise((resolve, reject) => {
            const report = this.report;
            const plugin = this.plugin;
            try {
                const manifest = plugin.getManifest();
                const {orbital} = manifest.getMeta();
                if (orbital.activator) {
                    const context = plugin.getContext();
                    const cache = container.getContributionCache();
                    cache.getActivator(context)
                        .then((Activator) => {
                            if (typeof Activator === 'function') {
                                resolve(void 0);
                            } else {
                                report.addFailure(new ResolutionError(
                                    ResolutionError.ACTIVATOR_IS_NOT_A_CONSTRUCTOR));
                                reject(report);
                            }
                        }).catch((e) => {
                            report.addFailure(e);
                            reject(report);
                        });
                } else {
                    resolve(void 0);
                }
            } catch (e) {
                report.addFailure(e);
                reject(report);
            }
        });
    }

    wireExtensions(container: ISystemContainer): Promise<void> {
        const extensionResolver = new ExtensionResolver(container, this);
        return extensionResolver.resolve();
    }

    wireServices(container: ISystemContainer): Promise<void> {
        const serviceResolver = new ServiceResolver(container, this);
        return serviceResolver.resolve();
    }
}

export default ContributionResolver;
