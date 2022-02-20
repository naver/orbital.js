import buble from 'rollup-plugin-buble';
import builtins from 'rollup-plugin-node-builtins';
import cjs2es6 from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
    input: 'main.js',
    output: {
        file: 'compiled.js',
        format: 'amd'
    },
    plugins: [
        json(),
        buble(),
        cjs2es6({
            include: 'node_modules/**',
            extensions: ['.js', '.json'],
            sourceMap: true
        }),
        nodeResolve({
            extensions: ['.js', '.json'],
            preferBuiltins: true
        }),
        builtins()
    ],
    external: [
        'orbital.js'
    ],
    sourcemap: true
};
