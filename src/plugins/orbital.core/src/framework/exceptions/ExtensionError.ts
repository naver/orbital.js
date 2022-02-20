/* tslint:disable:max-line-length */
/* tslint:disable:quotemark */

import {BasicError} from 'orbital.core.common';

class ExtensionError extends BasicError {
    static ABNORMAL_MODULE = "Please check #{0}/package.json's contributes/extensions/#{1}/realize field. The value must be an Object.";
    static ALREADY_UNREG = 'The extension has been already unregistered.';
    static CONTRIBUTABLE_EXTENSION_NOT_FOUND = 'No contributable extension specification found with the given extension-id ({0}).';
    static NO_PERMISSION = "'{0}' has no permission to {1} '{2}'";
    static OUTOFBOUND_PRIORITY = "The priority should be a positive number. See #{0}/package.json's contributes/extensions/#{1} field.";
    static SPEC_PROVIDER_NOT_FOUND = "The spec-provider package '{0}@{1}' not found with extension-id '{2}'.";
}

export default ExtensionError;
