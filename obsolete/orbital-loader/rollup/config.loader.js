import buble from 'rollup-plugin-buble';
import json from 'rollup-plugin-json';
import string from 'rollup-plugin-string';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'src/loader.js',
    output: {
        file: 'dist/index.js',
        format: 'cjs'
    },
    name: 'orbital-loader',
    plugins: [
        string({ include: '**/*.md' }),
        json(),
        buble({
            transforms: {forOf: false}
        }),
        commonjs({
            include: 'node_modules/**'
        }),
        nodeResolve({
            main: true,
            preferBuiltins: true
        })
    ],
    external: [
        'chalk',
        'events',
        'path',
        'read-package-tree'
    ]
};
