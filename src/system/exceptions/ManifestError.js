/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import BaseError from './BaseError';

class ManifestError extends BaseError {
}

ManifestError.NOMETA = `Manifest requires packages.json's meta information.`;
ManifestError.NONAME = `The 'name' field doesn't exist in package.json.`;
ManifestError.NOVERSION = `The 'version' field doesn't exist in package.json.`;
ManifestError.SYNTAX_CONTRIBUTABLE_ID = `The contributable 'id' field has syntax error.
the id should be a form of 'packageName:id' or just 'id'. Plese check `;
ManifestError.SYNTAX_CONTRIBUTING_ID = `The contributing 'id' field has syntax error.
the id should be a form of 'packageName:id'. Plese check `;
ManifestError.PACKAGENAME_MISSMATCH = `The packageName in a contributable id should be
the same as it's package name.`;
ManifestError.MISSING_DEPENDENCY = `The dependencies field is missing.
Please add '#{0}' to the dependencies field in '#{1}/package.json'`;

export default ManifestError;
