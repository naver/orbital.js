import {Base, freeze, webReq} from 'orbital.core.common';
import {
    ILogger,
    IPluginContext,
    IProject,
    IProjectConfigPath,
    IProjectConfigPathOutputWeb,
    IProjectConfigResolved,
    IVoidFunction,
    ProjectDefaultOptions
} from 'orbital.core.types';

const CONFIG = ProjectDefaultOptions.WEB_PROJECT_CONFIG;
const CONFIG_NOT_FOUND = `'${CONFIG}' not found.`;

class Project extends Base implements IProject {

    private _config!: IProjectConfigResolved;
    private readonly _context: IPluginContext;

    constructor(context: IPluginContext) {
        super();
        this._context = context;
        freeze(this, ['_context'], false);
    }

    getConfig(): IProjectConfigResolved {
        return this._config;
    }

    getRealPath(): IProjectConfigPath {
        return this._config.path;
    }

    getWebAppPath(): IProjectConfigPathOutputWeb {
        return this._config._resolution.webAppPath;
    }

    readConfig(cb: IVoidFunction) {
        const logger = this._context.getService('orbital.core:logger') as ILogger;
        webReq([CONFIG], (config) => {
            if (!config) {
                logger.error(CONFIG_NOT_FOUND);
            }
            this._config = config;
            cb();
        });
    }
}

export default Project;
