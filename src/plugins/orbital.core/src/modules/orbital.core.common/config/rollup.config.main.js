import config from './rollup.config';
import typescript from 'rollup-plugin-typescript2';
import tsc from 'typescript';

const options = {
    output: {
        name: 'orbital.core.common',
        file: 'dist/index.js',
        format: 'umd',
        globals: {
            'orbital.core.types': 'orbital-core-types'
        },
        sourcemap: true
    },
    external: [
        'chalk',
        'cli-spinner',
        'orbital.core.types'
    ],
    plugins: [
        typescript({
            cacheRoot: './.ts-cache/main',
            tsconfig: 'config/tsconfig.json',
            typescript: tsc
        })
    ].concat(config.plugins)
};

export default Object.assign({}, config, options);
