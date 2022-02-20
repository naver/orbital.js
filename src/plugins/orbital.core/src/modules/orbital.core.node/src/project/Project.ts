import * as fs from 'fs';
import {Base, freeze, merge} from 'orbital.core.common';
import {
    IKeyValue,
    ILogger,
    IProject,
    IProjectConfig,
    IProjectConfigPath,
    IProjectConfigPathOutputWeb,
    ISystemContext,
    IVoidFunction
} from 'orbital.core.types';
import * as path from 'path';
import defCfg from './default.orbital.config';

const CONFIG_FILE = 'orbital.config.js';
const CONFIG_NOT_FOUND = `'${CONFIG_FILE}' not found. default is used.`;

export interface IWalkResult {
    dir: string;
    file: string;
}
export type IWalkOnEnd = (result: IWalkResult | null) => void;
export type IWalkOnError = (err: Error) => void;

function walk(dir: string, onEnd: IWalkOnEnd, onError: IWalkOnError) {
    const file = path.resolve(dir, CONFIG_FILE);
    fs.readFile(file, 'utf8', (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                const tokens = dir.split(path.sep);
                tokens.pop();
                const newDir = tokens.join(path.sep);
                if (newDir) {
                    walk(newDir, onEnd, onError);
                } else {
                    onEnd(null);
                }
            } else {
                onError(err);
            }
        } else if (!err) {
            onEnd({dir, file});
        }
    });
}

class Project extends Base implements IProject {

    realPath!: IProjectConfigPath;
    webAppPath!: IProjectConfigPathOutputWeb;

    private _config!: IProjectConfig;
    private _context: ISystemContext;

    constructor(context: ISystemContext) {
        super();
        this._context = context;
        freeze(this, ['_context'], false);
    }

    getConfig() {
        return this._config;
    }

    getRealPath() {
        return this.realPath;
    }

    getWebAppPath() {
        return this.webAppPath;
    }

    readConfig(cb: IVoidFunction) {
        const cwd = process.cwd();
        const logger = this._context.getService('orbital.core:logger') as ILogger;
        const runtimeConfig = this._context.getRuntimeProjectConfig();
        const baseConfig = merge(defCfg, runtimeConfig);
        walk(cwd, (result: IWalkResult | null) => {
            let dir;
            let config;
            if (result) {
                try {
                    config = merge(baseConfig, require(result.file));
                    dir = result.dir;
                } catch (e) {
                    logger.warn(e);
                    config = baseConfig;
                    dir = cwd;
                }
            } else {
                logger.info(CONFIG_NOT_FOUND);
                config = baseConfig;
                dir = cwd;
            }
            this._config = config;
            this._makePath(dir, config, cb);
        }, (error) => {
            logger.error(error);
        });
    }

    private _makePath(dir: string, config: IProjectConfig, cb: IVoidFunction) {
        this.realPath = this._makeRealPath(dir, config);
        this.webAppPath = this._makeWebPath(config);
        cb();
    }

    private _makeRealPath(dir: string, config: IProjectConfig) {
        const p = JSON.parse(JSON.stringify(config.path));
        const root = path.resolve(dir, p.root);
        const dirs: string[] = [];
        function traverse(o: IKeyValue) {
            Reflect.ownKeys(o).forEach((key) => {
                const value = o[key];
                if (typeof value === 'object') {
                    traverse(value);
                } else {
                    o[key] = path.resolve(root, ...dirs, value);
                    if (key === 'dir') {
                        dirs.push(value);
                    }
                }
            });
            dirs.pop();
        }
        traverse(p);
        return p;
    }

    private _makeWebPath(config: IProjectConfig) {
        const dirs: string[] = [];
        const p = JSON.parse(JSON.stringify(config.path.output.web));
        Reflect.deleteProperty(p, 'dir');
        function traverse(o: IKeyValue) {
            Reflect.ownKeys(o).forEach((key) => {
                const value = o[key];
                if (typeof value === 'object') {
                    traverse(value);
                } else {
                    o[key] = dirs.concat(value).join('/');
                    if (key === 'dir') {
                        dirs.push(value);
                    }
                }
            });
            dirs.pop();
        }
        traverse(p);
        return p;
    }
}

export default Project;
