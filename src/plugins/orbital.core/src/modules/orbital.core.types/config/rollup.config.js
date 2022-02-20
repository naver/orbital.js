import cjs2es6 from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
    input: 'src/index.ts',
    plugins: [
        json(),
        nodeResolve({
            extensions: ['.js', '.json'],
            preferBuiltins: true
        }),
        cjs2es6({
            include: 'node_modules/**',
            extensions: ['.js', '.json']
        }),
        builtins()
    ]
};
