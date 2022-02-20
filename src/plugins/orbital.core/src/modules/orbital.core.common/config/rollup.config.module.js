import config from './rollup.config';
import typescript from 'rollup-plugin-typescript2';
import tsc from 'typescript';

const options = {
    output: {
        file: 'dist/index.module.js',
        format: 'es',
        sourcemap: true
    },
    external: [
        'chalk',
        'cli-spinner',
        'events',
        'orbital.core.types'
    ],
    plugins: [
        typescript({
            cacheRoot: './.ts-cache/module',
            tsconfig: 'config/tsconfig.json',
            typescript: tsc
        })
    ].concat(config.plugins)
};

export default Object.assign({}, config, options);
