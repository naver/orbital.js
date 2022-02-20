const config = {
    bundle: {
        entry: {},
        packages: {
            default: {
                path: './dist',
                node: {
                    bundler: 'rollup',
                    format: 'umd'
                }
            }
        }
    },
    log: {
        level: 2
    },
    path: {
        root: '.',
        input: {
            node: {
                dir: 'src/app',
                entry: 'main.js'
            }
        }
    }
};

module.exports = config;
