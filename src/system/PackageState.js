/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

const PackageState = {
    STOPPED: 1,
    STOPPED_BY_DEPENDENCY: 1 << 1,
    INACTIVE: 1 << 2,
    INACTIVE_BY_DEPENDENCY: 1 << 3,
    INVALID_MODULE: 1 << 4,
    CONTRIBUTION_SYNTAX_ERROR: 1 << 5,
    MODULE_NOT_FOUND: 1 << 6
};

export default PackageState;
