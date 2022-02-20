/* tslint:disable:max-line-length */
/* tslint:disable:quotemark */

import {BasicError} from 'orbital.core.common';

class ManifestError extends BasicError {
    static MISSING_DEPENDENCY = "'{0}' package does not exist in the dependency of '{1}'. Check the dependency field of package.json for '{1}'";
    static SYNTAX_CONTRIBUTABLE_ID = "The contributable 'id' field has syntax error.\nThe id should be a form of 'packageName:id' or just 'id'. Please check ";
    static SYNTAX_CONTRIBUTING_ID = "The contributing 'id' field has syntax error.\nThe id should be a form of 'packageName:id'. Please check ";
}

export default ManifestError;
