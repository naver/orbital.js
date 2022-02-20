import typescript from 'rollup-plugin-typescript2';
import tsc from 'typescript';
import config from './rollup.config';

const options = {
    output: {
        exports: 'named',
        file: 'dist/index.js',
        format: 'umd',
        globals: {
            'orbital.core.common': 'orbital-core-common'
        },
        name: 'orbital.core.web',
        sourcemap: true
    },
    plugins: [
        typescript({
            cacheRoot: './.ts-cache/main',
            tsconfig: 'config/tsconfig.json',
            typescript: tsc
        })
    ].concat(config.plugins)
};

export default Object.assign({}, config, options);
