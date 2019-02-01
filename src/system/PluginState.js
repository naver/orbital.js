/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

const PluginState = {
    UNINSTALLED: 1,
    INSTALLED: 1 << 1,
    RESOLVED: 1 << 2,
    STARTING: 1 << 3,
    ACTIVE: 1 << 4,
    STOPPING: 1 << 5
};

export default PluginState;
