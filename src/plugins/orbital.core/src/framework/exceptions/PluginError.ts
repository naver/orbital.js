/* tslint:disable:max-line-length */
/* tslint:disable:quotemark */

import {BasicError} from 'orbital.core.common';

class PluginError extends BasicError {
    static ALREADY_ACTIVE = 'start({0}): plugin is already active.';
    static DEPENDENCY_NOT_FOUND = "Dependency plugin '{1}' does not exist.";
    static INVALIDSTATE = 'Plugin has been uninstalled.';
    static NOCONTEXT = 'PluginContext does not exist.';
    static RESOLUTION_FAILED = 'start({0}): the resolution has been failed due to the following reasons.';
    static SPEC_PROVIDER_NOT_FOUND = "The spec provider package for service id '{0}' not found.";
    static START_ABORT_ON_BOOT = "start({0}): Starting aborted on boot ({1}). But the plugin can be started manually.";
    static UNABLETORESOLVE = 'Plugin dependency resolution has been failed.';
}

export default PluginError;
