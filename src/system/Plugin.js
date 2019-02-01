/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Notice from '../util/Notice';
import Base from './bases/Base';
import PluginError from './exceptions/PluginError';
import Manifest from './Manifest';
import PackageState from './PackageState';
import PluginContext from './PluginContext';
import PluginState from './PluginState';
import ContributionResolver from './resolution/ContributionResolver';

const stateChangeListener = {

    add() {
        if (this._stateChangeListener) {
            return;
        }
        this.debug('stateChangeListener.add()');
        this.getDependencies().forEach((contributable) => {
            if (contributable) {
                contributable.on('stateChange', this._depStateChangeHandler);
            }
        });
        this.forEachContributors((contributor) => {
            contributor.on('stateChange', this._reqStateChangeHandler);
        });
        this._stateChangeListener = true;
    },

    remove() {
        this.debug('stateChangeListener.remove()');
        this.getDependencies().forEach((contributable) => {
            contributable.off('stateChange', this._depStateChangeHandler);
        });
        this.forEachContributors((contributor) => {
            contributor.off('stateChange', this._reqStateChangeHandler);
        });
        this._stateChangeListener = false;
    }
};

const privates = {

    doStart(options) {
        this.debug(`doStart(${JSON.stringify(options)})`);
        const {STARTING, STOPPING} = PluginState;
        if (!this.isInStates([STARTING])) {
            this.setState(STARTING);
        }
        if (options.contributors) {
            this._startContributors(options);
        }
        try {
            this.startWorker();
        } catch (e) {
            Notice.warn(this, e);
            this.setState(STOPPING);
        }
    },

    doStop() {
        this.debug('doStop()');
        const {STOPPING} = PluginState;
        this._saveContributorsLastState();
        if (!this.isInStates([STOPPING])) {
            this.setState(STOPPING);
        }
        this._stopPromise = new Promise((resolve, reject) => {
            try {
                this.stopWorker(resolve);
            } catch (e) {
                reject(e);
                throw e;
            }
        });
    }
};

/**
 * Represents an installed orbital package.
 */
class Plugin extends Base {

    /**
     * @param {Object} rawManifest
     * @param {SystemContainer} systemContainer
     */
    constructor(rawManifest, systemContainer) {
        super();
        this.debug('new Plugin(rawManifest, systemContainer)');
        this.define('_syscon', systemContainer);
        this.define('_state', PluginState.UNINSTALLED, {
            writable: true
        });
        this.define('__id__', rawManifest.name + '@' + rawManifest.version);
        this.define('_depStateChangeHandler',
            this._handleDepStateChange.bind(this));
        this.define('_reqStateChangeHandler',
            this._handleReqStateChange.bind(this));
        this.define('_contributorsLastState', {}, {
            writable: true
        });
        this.init(rawManifest);
    }

    init(rawManifest) {
        this.debug('init(rawManifest)');
        this.define('_manifest', new Manifest(rawManifest), {
            writable: true
        });
        if (this._state >= PluginState.RESOLVED) {
            this.setState(PluginState.INSTALLED);
        }
        this.define('_stopPromise', Promise.resolve(this), {
            writable: true
        });
    }

    checkValid() {
        if (this.isInStates([PluginState.UNINSTALLED])) {
            throw new PluginError(PluginError.INVALIDSTATE);
        }
    }

    /**
     * Loops for each contributors for this plugin.
     * @param {function} callback
     */
    forEachContributors(callback) {
        const registry = this.getContext().getPluginRegistry();
        registry.getPluginsRequires(this).forEach(callback);
    }

    /**
     * Returns this plugin's {@link PluginContext}. The returned
     * {@link PluginContext} can be used by the caller to act
     * on behalf of this plugin.
     *
     * If this plugin is not in the {@link #STARTING}, {@link #ACTIVE}, or
     * {@link #STOPPING} states, then this method will return null.
     *
     * @returns {PluginContext}
     */
    getContext() {
        if (!this._ctx) {
            this.define('_ctx',
                new PluginContext(this, this.getSystemContainer())
            );
        }
        return this._ctx;
    }

    /**
     * Returns the array of plugins which this plugin requires.
     * @returns {Array.<Plugin>}
     */
    getDependencies() {
        const result = [];
        const context = this.getContext();
        const dependencies = this.getManifest().dependencies;
        Reflect.ownKeys(dependencies)
            .forEach((name) => {
                const version = dependencies[name];
                const depPlugin = context
                    .getPluginByNameAndVersion(name, version);
                if (!depPlugin) {
                    Notice.warn(this,
                        `${name}@${version} dependency plugin does not exist.`);
                }
                result.push(depPlugin);
            });
        return result;
    }

    /**
     * Returns the package id. The format is of [packageName]@[packageVersion]
     * @returns {string}
     */
    getId() {
        return this.__id__;
    }

    /**
     * Returns the <Manifest> object of this plugin.
     * @returns {Manifest}
     */
    getManifest() {
        return this._manifest;
    }

    /**
     * Returns the package name.
     * @returns {string}
     */
    getName() {
        return this._manifest.name;
    }

    /**
     * Returns the state of this plugin.
     * <table>
     <tr><th>State</th><th>Value</th></tr>
     <tr><td>UNINSTALLED</td><td>1</td></tr>
     <tr><td>INSTALLED</td><td>1 << 1</td></tr>
     <tr><td>RESOLVED</td><td>1 << 2</td></tr>
     <tr><td>STARTING</td><td>1 << 3</td></tr>
     <tr><td>ACTIVE</td><td>1 << 4</td></tr>
     <tr><td>STOPPING</td><td>1 << 5</td></tr>
     * </table>
     * @returns {number}
     */
    getState() {
        return this._state;
    }

    /**
     * Returns the <SystemContainer> which holds
     {@link PluginRegistry}, {@link ExtensionRegistry}, {@link ServiceRegistry}
     * @returns {SystemContainer}
     */
    getSystemContainer() {
        return this._syscon;
    }

    /**
     * Returns the package version.
     * @returns {string}
     */
    getVersion() {
        return this._manifest.version;
    }

    /**
     * Returns true if this plugin is in state of the given bit-wise states.
     * @param {number} states
     * @returns {boolean}
     */
    isInStates(states) {
        if (!Array.isArray(states)) {
            return false;
        }
        return states.indexOf(this.getState()) > -1;
    }

    setState(state) {
        Notice.log(this.getId(), getStateName(state));
        const oldState = this._state;
        this._state = state;
        this.emit('stateChange', this, state, oldState);
    }

    /**
     * Starts this plugin.
     * Starting will be deferred until all dependencies are active.
     * @param {Object} options
     * @property {string} contributors
     *  'all' : start all plugins which contributes to this plugin.<br>
     *  'active' : start contributing plugins which was active
     *             when this plugin stopped.
     * @property {boolean} boot true if boot mode.
     */
    start(options = {}) {
        Notice.log(this.getId(),
            `start(${Reflect.ownKeys(options).length
                ? JSON.stringify(options) : ''})`);
        const manifest = this.getManifest();
        if (manifest.state >= PackageState.INACTIVE) {
            Notice.warn(this, 'starting aborted. ' + manifest.errorReason);
            return;
        }
        const {INSTALLED, RESOLVED, STARTING, ACTIVE} = PluginState;
        if (this.isInStates([ACTIVE])) {
            return;
        }
        if (this.getManifest().hasPolicy('lazy')) {
            //TODO lazy
            //Consider doing all (lazy, eager) process
            //with resolver.resolve()
            return;
        }
        stateChangeListener.add.call(this);
        if (this.isInStates([RESOLVED, STARTING])) {
            privates.doStart.call(this, options);
        }
        this.checkValid();
        if (this.isInStates([INSTALLED])) {
            this.checkValid();
            this.setState(RESOLVED);
            if (this._isStoppedOnBoot(options)) {
                return;
            }
            privates.doStart.call(this, options);
        }
    }

    startWorker() {
        this.debug('startWorker()');
        if (!this._isAllContributablesResolved()) {
            Notice.log(this.getId(), 'waiting for all dependencies resolved');
            return;
        }
        const context = this.getContext();
        if (!context) {
            throw new PluginError(PluginError.NOCONTEXT);
        }
        try {
            const resolver = new ContributionResolver(this);
            resolver.resolve().then((report) => {
                if (report.hasNoFailure()) {
                    report.showWarnings();
                    context.start();
                } else {
                    Notice.warn(this, PluginError.RESOLVE_FAILED);
                    report.showFailures();
                    //TODO RollBack
                }
            });
        } catch (e) {
            Notice.warn(this, e);
            context.close();
            throw e;
        }
    }

    /**
     * Stops this plugin.
     * Stopping will be deferred until all contributors are stopped.
     */
    stop() {
        Notice.log(this.getId(), 'stop()');
        const {ACTIVE} = PluginState;
        try {
            this.checkValid();
            //TODO Fragment
            //TODO persistStopOptions(options)
            if (!this.isInStates([ACTIVE])) {
                return;
            }
            privates.doStop.call(this);
        } catch (e) {
            Notice.warn(this, e);
        }
    }

    stopWorker(resolve) {
        this.debug('stopWorker(resolve)');
        if (!this._isAllContributorsStopped()) {
            Notice.log(this.getId(),
                'waiting for all contributors stopped');
            return;
        }
        const context = this.getContext();
        if (!context) {
            throw new PluginError(PluginError.NOCONTEXT);
        }
        try {
            context.stop();
        } finally {
            context.close(resolve);
            stateChangeListener.remove.call(this);
        }
    }

    toString() {
        return '<Plugin>(' + this.getId() + ')';
    }

    /*
     * Listens to plugins that I(this plugin) depends on.
     * 1) If I was starting and all plugins (that I depends on)
     *    are ACTIVE state, start me.
     */
    _handleDepStateChange(who, state) {
        const {ACTIVE, STARTING, STOPPING} = PluginState;
        this.debug('_handleDepStateChange(who:' + who.getId()
            + ', state:' + state
            + ', this is STARTING ? ' + this.isInStates([STARTING]));
        if (state === ACTIVE) {
            if (this.isInStates([STARTING]) && this._isAllContributablesResolved()) {
                Notice.log(this.getId(), 'all dependencies resolved');
                this.start();
            }
        } else if (state === STOPPING) {
            this.stop();
        }
    }

    /*
     * Listens to plugins that require this plugin.
     * 1) If I was stopping and all plugins (that require me)
     *    are RESOLVED state, stop me.
     */
    _handleReqStateChange(who, state, prevState) {
        const {RESOLVED, STOPPING} = PluginState;
        this.debug('_handleReqStateChange(who:' + who.getId()
            + ', state:' + state
            + ', this is STOPPING ? ' + this.isInStates([STOPPING]));
        if (prevState === STOPPING && state === RESOLVED) {
            if (this.isInStates([STOPPING]) && this._isAllContributorsStopped()) {
                Notice.log(this.getId(), 'all contributing plugins stopped');
                this.stop();
            }
        }
    }

    /*
     * Returns true if all the contributors for this plugin has been stopped.
     * @returns {boolean}
     */
    _isAllContributorsStopped() {
        let stopped = true;
        const {RESOLVED} = PluginState;
        this.forEachContributors((plugin) => {
            if (!plugin.isInStates([RESOLVED])) {
                this.debug(plugin + ' is not stopped');
                stopped = false;
            }
        });
        return stopped;
    }

    /*
     * Returns true if all the contributables for this plugin has been resolved.
     * @returns {boolean}
     */
    _isAllContributablesResolved() {
        let resolved = true;
        const registry = this.getContext().getPluginRegistry();
        this.getManifest().getDependencyList().forEach((id) => {
            const plugin = registry.getPluginById(id);
            this.debug(id + ' is active ?', plugin.isInStates([PluginState.ACTIVE]));
            if (plugin) {
                if (!plugin.isInStates([PluginState.ACTIVE])) {
                    resolved = false;
                }
            } else {
                resolved = false;
            }
        });
        return resolved;
    }

    _isStoppedOnBoot(options) {
        const manifest = this.getManifest();
        if (options.boot && manifest.hasState(PackageState.STOPPED)) {
            Notice.warn(this, 'starting aborted on boot. '
                + "The manifest state is 'stopped'. "
                + 'But you can start it manually.');
            return true;
        }
        return false;
    }

    _recoverContributorsLastState(options) {
        this.debug('_recoverContributorsLastState(options)', options);
        this.debug('_contributorsLastState', this._contributorsLastState);
        const {ACTIVE} = PluginState;
        const registry = this.getContext().getPluginRegistry();
        const contributorsLastState = this._contributorsLastState;
        Reflect.ownKeys(contributorsLastState).forEach((id) => {
            if (contributorsLastState[id] === ACTIVE) {
                const plugin = registry.getPluginById(id);
                if (plugin) {
                    plugin.start(options);
                }
            }
        });
    }

    _saveContributorsLastState() {
        this.debug('_saveContributorsLastState()');
        const state = {};
        this.forEachContributors((plugin) => {
            this.debug(plugin + ' saved state : ' + plugin.getState());
            state[plugin.getId()] = plugin.getState();
        });
        this._contributorsLastState = state;
    }

    _startAllContributors(options) {
        this.forEachContributors((plugin) => {
            if (plugin) {
                plugin.start(options);
            }
        });
    }

    _startContributors(options) {
        const {contributors} = options;
        if (contributors === 'all') {
            this._startAllContributors(options);
        } else if (contributors === 'active') {
            this._recoverContributorsLastState(options);
        }
    }
}

function getStateName(bit) {
    let result = '';
    Reflect.ownKeys(PluginState).some((name) => {
        result = name;
        return PluginState[name] === bit;
    });
    return result;
}

Plugin.Event = {
    INSTALLED: 'INSTALLED',
    LAZY_ACTIVATION: 'LAZY_ACTIVATION',
    RESOLVED: 'RESOLVED',
    STARTED: 'STARTED',
    STARTING: 'STARTING',
    STOPPED: 'STOPPED',
    STOPPING: 'STOPPING',
    UNINSTALLED: 'UNINSTALLED',
    UNRESOLVED: 'UNRESOLVED',
    UPDATED: 'UPDATED'
};

export default Plugin;
