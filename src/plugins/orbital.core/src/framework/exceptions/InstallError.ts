/* tslint:disable:max-line-length */
/* tslint:disable:quotemark */

import {BasicError} from 'orbital.core.common';

class InstallError extends BasicError {
    static ALEXIST = "The '{0}' package you are trying to install has already been installed.";
    static NOEXIST = "The '{0}' package you are trying to uninstall does not exist.";
}

export default InstallError;
