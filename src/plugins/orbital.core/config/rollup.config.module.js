import config from './rollup.config';
import typescript from 'rollup-plugin-typescript2';
import tsc from 'typescript';

const options = {
    output: {
        file: 'dist/orbital.core.module.js',
        format: 'es',
        sourcemap: true
    },
    external: [
        'orbital.core.common',
        'orbital.core.node'
    ],
    plugins: config.plugins.concat(
        typescript({
            cacheRoot: './.ts-cache/module',
            tsconfig: 'config/tsconfig.json',
            typescript: tsc
        })
    )
};

export default Object.assign({}, config, options);
