const config = {
    path: {
        root: '.',
        input: {
            web: {
                dir: 'src/web',
                index: 'main.html',
                entry: 'main.js'
            },
            node: {
                dir: 'src/app',
                entry: 'main.js'
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
                    dir: 'runtime',
                    amd: {
                        dir: 'requirejs',
                        config: 'require.config.js',
                        loaders: 'loaders'
                    }
                }
            }
        }
    },
    webApp: {
        amd: {
            engine: 'requirejs'
        }
    },
    bundle: {
        entry: {},
        packages: {
            default: {
                path: './dist',
                node: {
                    bundler: 'rollup',
                    format: 'umd'
                },
                web: {
                    bundler: 'webpack',
                    format: 'amd'
                }
            }
        }
    },
    log: {
        level: 2
    },
    i18n: {
        default: 'en',
        detector: {
            web: {
                order: ['querystring', 'cookie', 'localStorage'],
                lookupKey: {
                    querystring: 'lang',
                    cookie: 'lang',
                    localStorage: 'lang'
                }
            }
        }
    }
};

module.exports = config;
