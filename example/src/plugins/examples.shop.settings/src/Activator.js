/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import {getSettingsFragment} from './extensions/settingsContents';

class Activator {

    constructor() {
        this.stateListener = this.handlePluginStateChange.bind(this);
    }

    onStart(context) {
        this.context = context;
        context.getPlugins().forEach((plugin) => {
            plugin.on('stateChange', this.stateListener);
        });
    }

    onStop(context) {
        context.getPlugins().forEach((plugin) => {
            plugin.off('stateChange', this.stateListener);
        });
    }

    handlePluginStateChange(/* who, state, oldState */) {
        this.refresh();
    }

    refresh() {
        const settingsPane = document.querySelector('#settingsPane');
        if (settingsPane) {
            const newSettingsPane = getSettingsFragment(this.context);
            settingsPane.parentNode.replaceChild(newSettingsPane, settingsPane);
        }
    }
}

export default Activator;
