/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import BaseError from './BaseError';

class ServiceError extends BaseError {
}

ServiceError.UNDEFINED_SERVICE = 'The service argument is undefined.';
ServiceError.OUTOFBOUND_PRIORITY = 'The priority should be a positive number.';
ServiceError.ALREADY_UNREG = 'The service has been already unregistered.';

export default ServiceError;
