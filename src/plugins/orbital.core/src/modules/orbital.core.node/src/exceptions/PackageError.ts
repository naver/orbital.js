/* tslint:disable:max-line-length */
/* tslint:disable:quotemark */

import {BasicError} from 'orbital.core.common';

class PackageError extends BasicError {
    static DEFINITION_ID_MISSING = "'id' field is missing by '{0}' package's 'orbital.{1}.{2}' field's one of definitions.";
    static DEFINITION_ID_SYNTAX_ERROR = "'id' field has a syntax error. Please check '{0}' package's 'orbital.{1}.{2}'s {3}.";
    static FIELD_MISSING = "'{0}' field is missing. Please check '{1}' package's 'orbital.{2}.{3}'s {4}.";
    static INVALID_PERMISSION = "'{0}' package's '{1}' {2}'s 'permission' field value is '{3}'. It should be empty or an object containing 'call' and 'realize' fields with 'allow' and 'deny' field. {4}";
    static PACKAGE_NAME_MISSMATCH = "The {0} package's 'orbital.contributable.{1}'s '{2}' id should be '{3}'.";
}

export default PackageError;
