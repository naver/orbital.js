import {freeze, SerializableManifest} from 'orbital.core.common';
import {
    IPlugin, IPluginStartOptions, IRuntimeProjectConfig,
    ISystemContainer, ISystemContext, ISystemPlugin, PluginState
} from 'orbital.core.types';
import Plugin from './Plugin';
import SystemContext from './SystemContext';

/**
 * The ISystemPlugin starts before any IPlugins.
 */
class SystemPlugin extends Plugin implements ISystemPlugin {

    private _getContext: () => ISystemContext;
    private _install: () => Promise<IPlugin>;
    private _sysContext: ISystemContext | null = null;

    constructor(manifest: SerializableManifest, container: ISystemContainer,
            private _runtimeConfig: IRuntimeProjectConfig) {
        super(manifest, container);
        this._getContext = (): ISystemContext => {
            if (!this._sysContext) {
                this._sysContext = new SystemContext(this,
                    container, this._runtimeConfig);
                freeze(this, ['_sysContext'], false);
            }
            return this._sysContext;
        };
        this._install = (): Promise<IPlugin> => {
            const registry = container.getPluginRegistry();
            return registry.install(this, this);
        };
        container.init(this);
    }

    getContext(): ISystemContext {
        return this._getContext();
    }

    install(): Promise<IPlugin> {
        return this._install();
    }

    /**
     * Start SystemPlugin.
     *
     * 1) If this is not in the {@link PluginState.STARTING} state and initialize.
     * 2) Any exceptions that occur during plugin starting must be wrapped
     *    in a {@link PluginError} and then published as a SystemPlugin event
     *    of type {@link SystemPluginEvent#ERROR}.
     * 3) This Framework's state is set to {@link PluginState.ACTIVE}.
     * 4) A 'stateChange' event with {@code PluginState.ACTIVE} is fired.
     *    See {@link Plugin}
     */
    start(options?: IPluginStartOptions): void {
        super.start(options);
    }

    protected isAllDependenciesActive_() {
        return true;
    }

    protected stopWorker_() {
        super.stopWorker_();
        // TODO close SystemContainer
    }
}

export default SystemPlugin;
