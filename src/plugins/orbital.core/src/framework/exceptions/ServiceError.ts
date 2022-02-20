/* tslint:disable:max-line-length */
/* tslint:disable:quotemark */

import {BasicError} from 'orbital.core.common';

class ServiceError extends BasicError {
    static ALREADY_UNREG = 'The service has been already unregistered.';
    static CONTRIBUTABLE_SERVICE_NOT_FOUND = 'No contributable service specification found with the given service-id ({0}).';
    static ILLEGAL_ASYNC_SERVICE_CALL_SYNC = "The getAsyncService() method should only be called to a service with the async property as true. Please check the service-id '{0}'";
    static ILLEGAL_SERVICE_CALL_TO_ASYNC = "The getService() method should only be called to a service with the async property as false or no-definition. Please check the service-id '{0}'";
    static NO_LAZY_SERVICE = 'There is no lazy service for ';
    static NO_PERMISSION = "'{0}' has no permission to {1} '{2}'";
    static NO_SERVICE_IMPLEMENTATION = "There is no service implementation for the service-id '{0}'";
    static OUTOFBOUND_PRIORITY = 'The priority should be a positive number.';
    static RESERVED_PROP_EMITTER = "'emitter' is reserved. The name can not be used as a service method name.";
    static SPEC_PROVIDER_NOT_FOUND = "The spec-provider package '{0}@{1}' not found with service-id '{2}'.";
    static UNDEFINED_SERVICE = 'The service argument is undefined.';
}

export default ServiceError;
