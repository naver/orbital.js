/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import BaseError from './BaseError';

class ExtensionError extends BaseError {
}

ExtensionError.ABNORMAL_MODULE = 'Please check #{0}/package.json\'s contributes/extensions/#{1}/realize field. The value must be an Object.';
ExtensionError.OUTOFBOUND_PRIORITY = 'The priority should be a positive number. See #{0}/package.json\'s contributes/extensions/#{1} field.';

export default ExtensionError;
