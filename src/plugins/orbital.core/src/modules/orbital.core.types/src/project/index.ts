import {IVoidFunction} from '../common';
import {LoggerLevel} from '../logger';
import {IBundleFormat, IBundler, IContributablePermissionDefinition} from '../package';

export enum ProjectDefaultOptions {
    WEB_PROJECT_CONFIG = 'orbital.config.json'
}

export interface IProject {
    getConfig(): IProjectConfig;
    getRealPath(): IProjectConfigPath;
    getWebAppPath(): IProjectConfigPathOutputWeb;
    readConfig(cb: IVoidFunction): void;
}

export interface IProjectConfig {
    bundle: {
        entry: {
            [key: string]: string
        },
        packages: {
            default: {
                node: {
                    bundler: IBundler,
                    format: IBundleFormat
                },
                path: string,
                web: {
                    bundler: IBundler,
                    format: IBundleFormat
                }
            }
        }
    };
    i18n: {
        default: string
    };
    log: {
        level: LoggerLevel,
        show: {
            prefix: boolean,
            time: boolean
        }
    };
    packages: {
        ignored: string[],
        startup: string[],
        stopped: string[]
    };
    path: IProjectConfigPath;
    permission: {
        [key: string]: IContributablePermissionDefinition
    };
    webApp: {
        amd: {
            engine: string
        }
    };
}

export interface IProjectConfigPath {
    input: {
        node: {
            dir: string,
            entry: string
        }
        web: {
            dir: string,
            entry: string,
            index: string
        }
    };
    output: {
        web: IProjectConfigPathOutputWeb;
    };
    root: string;
}

export interface IProjectConfigPathOutputWeb {
    app: {
        dir: string,
        entry: string
    };
    dir: string;
    index: string;
    packages: {
        dir: string,
        list: string
    };
    runtime: {
        amd: {
            config: string,
            dir: string,
            loaders: string
        },
        dir: string
    };
}

export interface IProjectConfigResolved extends IProjectConfig {
    _resolution: {
        webAppPath: IProjectConfigPathOutputWeb
    };
}

export interface IRuntimeProjectConfig {
    bundle?: {
        entry: {
            [key: string]: string
        },
        packages: {
            default: {
                node: {
                    bundler: IBundler,
                    format: IBundleFormat
                },
                path: string,
                web: {
                    bundler: IBundler,
                    format: IBundleFormat
                }
            }
        }
    };
    i18n?: {
        default: string
    };
    log?: {
        level: LoggerLevel,
        show: {
            prefix: boolean,
            time: boolean
        }
    };
    packages?: {
        ignored: string[],
        startup: string[],
        stopped: string[]
    };
    path?: IProjectConfigPath;
    permission?: {
        [key: string]: IContributablePermissionDefinition
    };
    webApp?: {
        amd: {
            engine: string
        }
    };
}
