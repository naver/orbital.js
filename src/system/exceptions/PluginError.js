/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import BaseError from './BaseError';

class PluginError extends BaseError {
}

PluginError.INVALIDSTATE = 'Plugin has been uninstalled.';
PluginError.NOCONTEXT = 'PluginContext does not exist.';
PluginError.RESOLVE_FAILED = 'The resolution has been failed due to the following reasons.';
PluginError.UNABLETORESOLVE = 'Plugin dependency resolution has been failed.';

export default PluginError;
