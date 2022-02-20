import {IProjectConfig} from 'orbital.core.types';

const config: IProjectConfig = {
    bundle: {
        entry: {},
        packages: {
            default: {
                node: {
                    bundler: 'rollup',
                    format: 'umd'
                },
                path: './dist',
                web: {
                    bundler: 'webpack',
                    format: 'amd'
                }
            }
        }
    },
    i18n: {
        default: 'en'
    },
    log: {
        level: 2,
        show: {
            prefix: true,
            time: true
        }
    },
    packages: {
        ignored: [],
        startup: [],
        stopped: []
    },
    path: {
        input: {
            node: {
                dir: 'src/app',
                entry: 'main.js'
            },
            web: {
                dir: 'src/web',
                entry: 'main.js',
                index: 'main.html'
            }
        },
        output: {
            web: {
                app: {
                    dir: 'app',
                    entry: 'entry.js'
                },
                dir: 'public',
                index: 'index.html',
                packages: {
                    dir: 'plugins',
                    list: 'plugins.json'
                },
                runtime: {
                    amd: {
                        config: 'require.config.js',
                        dir: 'requirejs',
                        loaders: 'loaders'
                    },
                    dir: 'runtime'
                }
            }
        },
        root: '.'
    },
    permission: {},
    webApp: {
        amd: {
            engine: 'requirejs'
        }
    }
};

export default config;
