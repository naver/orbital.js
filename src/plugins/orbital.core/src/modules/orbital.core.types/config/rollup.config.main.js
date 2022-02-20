import typescript from 'rollup-plugin-typescript2';
import tsc from 'typescript';
import config from './rollup.config';

const options = {
    output: {
        name: 'orbital.core.types',
        file: 'dist/index.js',
        format: 'umd',
        sourcemap: true
    },
    plugins: [
        typescript({
            cacheRoot: './.ts-cache/main',
            tsconfig: 'config/tsconfig.json',
            typescript: tsc
        })
    ].concat(config.plugins),
    external: []
};

export default Object.assign({}, config, options);
