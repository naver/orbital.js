/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Plugin from './Plugin';
import Notice from '../util/Notice';
import SystemContainer from './SystemContainer';

class SystemPlugin extends Plugin {

    constructor(rawManifest) {
        super(rawManifest, new SystemContainer());
    }

    install() {
        return new Promise((resolve, reject) => {
            const container = this.getSystemContainer();
            const registry = container.getPluginRegistry();
            try {
                const installed = registry.install(this, this);
                resolve(installed);
            } catch (e) {
                Notice.warn(this, e);
                resolve(e);
            }
        });
    }

    /**
     * Start SystemPlugin.
     *
     * 1) If this is not in the {@link #STARTING} state and initialize.
     * 2) Any exceptions that occur during plugin starting must be wrapped
     *    in a {@link PluginError} and then published as a SystemPlugin event
     *    of type {@link SystemPluginEvent#ERROR}.
     * 3) This Framework's state is set to {@link #ACTIVE}.
     * 4) A framework event of type {@link SystemPluginEvent#STARTED} is fired
     */
    start(options) {
        super.start(options);
    }
}

export default SystemPlugin;
