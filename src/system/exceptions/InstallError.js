/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import BaseError from './BaseError';

class InstallError extends BaseError {
}

InstallError.ALEXIST = 'The package you are trying to install has already installed. Check node_modules directory.';

export default InstallError;
