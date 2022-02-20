import typescript from 'rollup-plugin-typescript2';
import tsc from 'typescript';
import config from './rollup.config';

const options = {
    output: {
        exports: 'named',
        file: 'dist/index.module.js',
        format: 'es',
        sourcemap: true
    },
    plugins: [
        typescript({
            cacheRoot: './.ts-cache/module',
            tsconfig: 'config/tsconfig.json',
            typescript: tsc
        })
    ].concat(config.plugins)
};

export default Object.assign({}, config, options);
