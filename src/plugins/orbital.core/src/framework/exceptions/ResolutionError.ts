/* tslint:disable:max-line-length */
/* tslint:disable:quotemark */

import {BasicError} from 'orbital.core.common';

class ResolutionError extends BasicError {
    static ACTIVATOR_IS_NOT_A_CONSTRUCTOR = 'Activator should be a constructor.';
    static ACTIVATOR_NOT_DEFINED = 'orbital > activator field not defined. Please check #{0}/package.json';
}

export default ResolutionError;
