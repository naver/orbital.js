import {$logger, freeze, getPackageId, LogBase, trace} from 'orbital.core.common';
import {
    IContributionResolver, IKeyValue, IManifest,
    IPlugin, IPluginContext, IPluginStartOptions,
    ISerializableManifest, IServiceRegistration, ISystemContainer,
    ManifestEvent, PackageState, PluginContextEvent, PluginEvent, PluginState
} from 'orbital.core.types';
import PluginError from './exceptions/PluginError';
import Manifest from './Manifest';
import PluginContext from './PluginContext';
import ContributionResolver from './resolution/ContributionResolver';

const pluginListener: IKeyValue = {

    /*
     * Listens to plugins that I(this plugin) depends on.
     * 1) If I was starting and all plugins (that I depend on)
     *    are ACTIVE state, start me.
     */
    handleDepStateChange(dependency: IPlugin, state: PluginState) {
        const {ACTIVE, STARTING, STOPPING} = PluginState;
        this.debug('handleDepStateChange(dependency:{0}, state:{1}): this is STARTING ? {2}',
            dependency, state, this.isInStates(STARTING)
        );
        if (state === ACTIVE) {
            if (this.isInStates(STARTING)
                && this.isAllDependenciesActive_()
                && this.isAllServicesExist_()) {
                this.start();
            }
        } else if (state === STOPPING) {
            this.stop();
        }
    },

    /*
     * Listens to plugins that require this plugin.
     * 1) If I was stopping and all plugins (that require me)
     *    are RESOLVED state, stop me.
     */
    handleReqStateChange(who: IPlugin, state: PluginState, prevState: PluginState) {
        const {RESOLVED, STOPPING} = PluginState;
        this.debug('handleReqStateChange(who:{0}, state:{1}): this is STOPPING ? {2}',
            who, state, this.isInStates(STOPPING)
        );
        if (prevState === STOPPING && state === RESOLVED) {
            if (this.isInStates(STOPPING) && this.isAllContributorsStopped_()) {
                this.log('handleReqStateChange(who:{0}, state:{1}): all contributing plugins stopped', who, state);
                this.stop();
            }
        }
    },

    handleServiceRegister(registration: IServiceRegistration) {
        const {STARTING} = PluginState;
        if (this.isInStates(STARTING)
            && this.isAllDependenciesActive_()
            && this.isAllServicesExist_()) {
            this.start();
        }
    }
};

/**
 * Represents an installed orbital package.
 */
class Plugin extends LogBase implements IPlugin {

    private readonly _addStateChangeListener: () => void;
    private readonly _context: IPluginContext;
    private _contributorsLastState: IKeyValue = {};
    private readonly _depStateChangeHandler: (who: IPlugin, state: PluginState) => void;
    private _hasStateChangeListener: boolean = false;
    private readonly _id: string;
    private readonly _isAllContributorsStopped: () => boolean;
    private readonly _isAllDependenciesActive: () => boolean;
    private readonly _isAllServicesExist: () => boolean;
    private readonly _manifest: IManifest;
    private readonly _recoverContributorsLastState: (options: IPluginStartOptions) => void;
    private readonly _removeStateChangeListener: () => void;
    private readonly _reqStateChangeHandler: (who: IPlugin, state: PluginState, prevState: PluginState) => void;
    private readonly _resolver: IContributionResolver;
    private readonly _saveContributorsLastState: () => void;
    private readonly _serviceRegisterHandler: (registration: IServiceRegistration) => void;
    private readonly _startAllContributors: (options?: IPluginStartOptions) => void;
    private _state: PluginState = PluginState.UNINSTALLED;

    constructor(serializedManifest: ISerializableManifest, container: ISystemContainer) {
        super();
        const pluginRegistry = container.getPluginRegistry();
        const forEachContributors = (callback: (plugin: IPlugin) => void) => {
            pluginRegistry.getPluginsRequires(this).forEach(callback);
        };
        this._id = getPackageId(serializedManifest);
        this.debug('new Plugin({0}, {1})', serializedManifest, container, '%f');
        this._context = new PluginContext(this, container);
        this._resolver = new ContributionResolver(this, container);
        this._depStateChangeHandler = pluginListener.handleDepStateChange.bind(this);
        this._reqStateChangeHandler = pluginListener.handleReqStateChange.bind(this);
        this._serviceRegisterHandler = pluginListener.handleServiceRegister.bind(this);
        this._manifest = new Manifest(serializedManifest, container);
        this._manifest.on(ManifestEvent.updated, () => {
            this.refresh();
        });
        this._addStateChangeListener = () => {
            if (this._hasStateChangeListener) {
                return;
            }
            this.debug('_addStateChangeListener()');
            pluginRegistry.getDependencies(this).forEach((dependency) => {
                if (dependency) {
                    dependency.on(PluginEvent.stateChange, this._depStateChangeHandler);
                    dependency.getContext().on(
                        PluginContextEvent.serviceRegistered, this._serviceRegisterHandler);
                }
            });
            forEachContributors((contributor) => {
                contributor.on(PluginEvent.stateChange, this._reqStateChangeHandler);
            });
            this._hasStateChangeListener = true;
        };
        this._isAllContributorsStopped = () => {
            let stopped = true;
            forEachContributors((plugin) => {
                if (!plugin.isInStates(PluginState.RESOLVED)) {
                    this.debug('isAllContributorsStopped_(): {0} is not stopped.', plugin);
                    stopped = false;
                }
            });
            return stopped;
        };
        this._isAllDependenciesActive = () => {
            let resolved = true;
            this.getManifest().getDependencyList().forEach((id) => {
                const plugin = pluginRegistry.getPluginById(id);
                if (plugin) {
                    this.debug('isAllDependenciesActive_(): {0} is active ? {1}',
                        id, plugin.isInStates(PluginState.ACTIVE)
                    );
                    if (!plugin.isInStates(PluginState.ACTIVE)) {
                        resolved = false;
                    }
                } else {
                    resolved = false;
                }
            });
            if (resolved) {
                this.log('all dependencies active');
            }
            return resolved;
        };
        this._isAllServicesExist = (): boolean => {
            const svcRegistry = container.getServiceRegistry();
            const exist = pluginRegistry.getDependencies(this).every((dependency) => {
                const manifest = dependency.getManifest();
                return manifest.getOwnContributableServiceDescriptors()
                    .every((descriptor) => {
                        if (svcRegistry.lookupCurrentRegistration(descriptor.id)
                            || descriptor.isAsync) {
                            return true;
                        }
                        this.debug('isAllServicesExist_(): {0} does not exist yet', descriptor.id);
                        return false;
                    });
            });
            if (exist) {
                this.log('all services exist');
                return true;
            }
            this.debug('isAllServicesExist_(): waiting all services exist');
            return false;
        };
        this._recoverContributorsLastState = (options: IPluginStartOptions) => {
            const contributorsLastState = this._contributorsLastState;
            this.debug('_contributorsLastState = {0}', contributorsLastState);
            Reflect.ownKeys(contributorsLastState).forEach((id) => {
                if (contributorsLastState[id] === PluginState.ACTIVE) {
                    const plugin = pluginRegistry.getPluginById(id as string);
                    if (plugin) {
                        plugin.start(options);
                    }
                }
            });
        };
        this._removeStateChangeListener = () => {
            this.debug('_removeStateChangeListener()');
            pluginRegistry.getDependencies(this).forEach((dependency) => {
                dependency.off(PluginEvent.stateChange, this._depStateChangeHandler);
                dependency.getContext().off(
                    PluginContextEvent.serviceRegistered, this._serviceRegisterHandler);
            });
            forEachContributors((contributor) => {
                contributor.off(PluginEvent.stateChange, this._reqStateChangeHandler);
            });
            this._hasStateChangeListener = false;
        };
        this._saveContributorsLastState = () => {
            const state: IKeyValue = {};
            forEachContributors((plugin) => {
                this.debug('{0} saved state : {1}', plugin, plugin.getState());
                state[plugin.getId()] = plugin.getState();
            });
            this._contributorsLastState = state;
        };
        this._startAllContributors = (options?: IPluginStartOptions) => {
            forEachContributors((plugin) => {
                if (plugin) {
                    plugin.start(options);
                }
            });
        };
        freeze(this, [
            '_id', '_context', '_manifest',
            '_depStateChangeHandler',
            '_reqStateChangeHandler',
            '_serviceRegisterHandler'
        ], false);
    }

    getContext(): IPluginContext {
        return this._context;
    }

    getId() {
        return this._id;
    }

    getManifest(): IManifest {
        return this._manifest;
    }

    getName(): string {
        return this._manifest.name;
    }

    getState(): PluginState {
        return this._state;
    }

    getVersion(): string {
        return this._manifest.version;
    }

    isInStates(states: PluginState): boolean {
        return (this.getState() & states) !== 0;
    }

    refresh(): void {
        this.log('refresh()');
        if (this.getManifest().resolved()) {
            if (this.isInStates(PluginState.INSTALLED)) {
                this.setState(PluginState.RESOLVED);
            } else if (this.isInStates(PluginState.STARTING | PluginState.ACTIVE)) {
                this.stop();
                this.start();
            }
        } else {
            if (this.isInStates(PluginState.STARTING | PluginState.ACTIVE)) {
                this.stop();
            }
            this.setState(PluginState.INSTALLED);
        }
    }

    setState(state: PluginState) {
        if (state === PluginState.ACTIVE) {
            $logger.emphasize(this.getId(), PluginState[state]);
        } else {
            $logger.log(this.getId(), PluginState[state]);
        }
        const oldState = this._state;
        this._state = state;
        this.emit(PluginEvent.stateChange, this, state, oldState);
    }

    start(options?: IPluginStartOptions): void {
        this.log('start({0})', options);
        const manifest = this.getManifest();
        if (!manifest.resolved()) {
            const {errorReasons} = manifest.getResolution();
            this.warn('start({0}): starting aborted. ({1})',
                options, errorReasons.join(', '));
            return;
        }
        const {RESOLVED, STARTING, ACTIVE} = PluginState;
        if (this.isInStates(ACTIVE)) {
            this.warn(PluginError.ALREADY_ACTIVE, options);
            return;
        }
        this._addStateChangeListener();
        if (this.isInStates(STARTING)) {
            this._doStart(options);
        }
        this._checkValid();
        // TODO Fragment
        // TODO Level
        if (this.isInStates(RESOLVED)) {
            this._checkValid();
            if (this._isStoppedOnBoot(options)) {
                $logger.log(
                    PluginError.START_ABORT_ON_BOOT, options,
                    this.getManifest().getResolution().errorReasons.join(', '), '%f');
                return;
            }
            this._doStart(options);
        }
    }

    /**
     * Stops this plugin.
     * Stopping will be deferred until all contributors are stopped.
     */
    stop(): void {
        this.log('stop()');
        const {ACTIVE} = PluginState;
        try {
            this._checkValid();
            // TODO Fragment
            // TODO persistStopOptions(options)
            if (!this.isInStates(ACTIVE)) {
                return;
            }
            this._doStop();
        } catch (e) {
            this.warn('stop()', e);
        }
    }

    toString() {
        return `<Plugin>(${this.getId()})`;
    }

    /*
     * Returns true if all the contributors for this plugin has been stopped.
     */
    protected isAllContributorsStopped_(): boolean {
        return this._isAllContributorsStopped();
    }

    /*
     * Returns true if all the dependencies(contributable plugins)
     * of this plugin has been resolved.
     */
    protected isAllDependenciesActive_(): boolean {
        return this._isAllDependenciesActive();
    }

    /*
     * Returns true if all depending services are
     * registered to the service registry.
     * Please note that, service specification provider and
     * it's implementor could be different.
     * An IPlugin that wants to use a service must wait for
     * at least one service to be published.
     */
    protected isAllServicesExist_(): boolean {
        return this._isAllServicesExist();
    }

    protected startWorker_() {
        this.debug('startWorker_()');
        if (!this.isAllDependenciesActive_()) {
            $logger.log(this.getId(), 'waiting for all dependencies active');
            return;
        }
        const context = this.getContext();
        if (!context) {
            throw new PluginError(PluginError.NOCONTEXT);
        }
        try {
            this._resolver.resolve().then((report) => {
                if (report.hasNoFailure()) {
                    report.showWarnings();
                    context.start();
                }
            }).catch((report) => {
                $logger.error(this, PluginError.RESOLUTION_FAILED);
                report.showFailures();
            });
        } catch (e) {
            $logger.warn(this, e);
            context.close();
            throw e;
        }
    }

    protected stopWorker_() {
        this.debug('stopWorker_()');
        if (!this.isAllContributorsStopped_()) {
            $logger.log(this.getId(), 'waiting for all contributors stopped');
            return;
        }
        const context = this.getContext();
        if (!context) {
            throw new PluginError(PluginError.NOCONTEXT);
        }
        try {
            context.stop();
        } finally {
            context.close();
            this._removeStateChangeListener();
        }
    }

    private _checkValid() {
        if (this.isInStates(PluginState.UNINSTALLED)) {
            throw new PluginError(PluginError.INVALIDSTATE);
        }
    }

    private _doStart(options?: IPluginStartOptions) {
        this.debug('_doStart({0})', options);
        const {STARTING, STOPPING} = PluginState;
        if (!this.isInStates(STARTING)) {
            this.setState(STARTING);
        }
        if (options && options.contributors) {
            this._startContributors(options);
        }
        try {
            this.startWorker_();
        } catch (e) {
            $logger.warn(this, e);
            this.setState(STOPPING);
        }
    }

    private _doStop() {
        this.debug('_doStop()');
        const {STOPPING} = PluginState;
        this._saveContributorsLastState();
        if (!this.isInStates(STOPPING)) {
            this.setState(STOPPING);
        }
        this.stopWorker_();
    }

    private _isStoppedOnBoot(options?: IPluginStartOptions): boolean {
        const manifest = this.getManifest();
        const stoppedState = PackageState.STOPPED | PackageState.STOPPED_BY_DEPENDENCY;
        if (options && options.boot && !options.force && manifest.hasState(stoppedState)) {
            return true;
        }
        return false;
    }

    private _startContributors(options?: IPluginStartOptions) {
        if (options && options.contributors) {
            const {contributors} = options;
            if (contributors === 'all') {
                this._startAllContributors(options);
            } else if (contributors === 'active') {
                this._recoverContributorsLastState(options);
            }
        }
    }
}

export default Plugin;
