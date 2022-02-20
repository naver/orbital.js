import {$logger, Base, freeze} from 'orbital.core.common';
import {
    IContributionResolutionReport, IPlugin
} from 'orbital.core.types';

class ResolutionReport extends Base implements IContributionResolutionReport {

    private readonly _failures: Error[];
    private readonly _plugin: IPlugin;
    private readonly _warnings: Error[];

    constructor(plugin: IPlugin) {
        super();
        this._failures = [];
        this._plugin = plugin;
        this._warnings = [];
        freeze(this, [
            '_failures',
            '_plugin',
            '_warnings'
        ]);
    }

    addFailure(error: Error) {
        this._failures.push(error);
    }

    addWarning(warning: Error) {
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
        if (this._failures.length) {
            $logger.error('Resolution Report');
        }
        this._failures.forEach((err, i) => {
            $logger.error((i + 1) + ') ' + this._plugin, err);
        });
    }

    showWarnings() {
        if (this._warnings.length) {
            $logger.warn('Resolution Report');
        }
        this._warnings.forEach((err, i) => {
            $logger.warn((i + 1) + ') ' + this._plugin, err);
        });
    }
}

export default ResolutionReport;
