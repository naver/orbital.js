/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import Base from '../bases/Base';
import Notice from '../../util/Notice';

class ResolutionReport extends Base {

    constructor(plugin) {
        super();
        this.define('_plugin', plugin);
        this.define('_failures', []);
        this.define('_warnings', []);
    }

    addFailure(error) {
        this._failures.push(error);
    }

    addWarning(warning) {
        this._warnings.push(warning);
    }

    getFailures() {
        return this._failures;
    }

    getWarnings() {
        return this._warnings;
    }

    hasNoFailure() {
        return this._failures.length === 0;
    }

    showFailures() {
        this._failures.forEach((err) => {
            Notice.error(this._plugin, err);
        });
    }

    showWarnings() {
        this._warnings.forEach((err) => {
            Notice.warn(this._plugin, err);
        });
    }
}

export default ResolutionReport;
