/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Base from './bases/Base';
import PluginRegistry from './PluginRegistry';
import ServiceRegistry from './services/ServiceRegistry';
import ExtensionRegistry from './extensions/ExtensionRegistry';

class SystemContainer extends Base {

    constructor() {
        super();
        this.define('_pluginReg', new PluginRegistry());
        this.define('_serviceReg', new ServiceRegistry());
        this.define('_extReg', new ExtensionRegistry());
    }

    getPluginRegistry() {
        return this._pluginReg;
    }

    getServiceRegistry() {
        return this._serviceReg;
    }

    getExtensionRegistry() {
        return this._extReg;
    }
}

export default SystemContainer;
