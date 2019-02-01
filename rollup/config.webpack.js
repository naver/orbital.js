import buble from 'rollup-plugin-buble';
import builtins from 'rollup-plugin-node-builtins';
import json from 'rollup-plugin-json';
import orbitalize from './rollup-plugin-orbitalize';
// import uglify from 'rollup-plugin-uglify';
// import {minify} from 'uglify-js';

export default {
    input: 'src/orbital.js',
    output: {
        file: 'dist/orbital.js',
        format: 'umd',
        globals: {
            'lodash.merge': 'merge',
            'lodash.orderby': 'orderby'
        },
        name: 'orbital',
        sourcemap: true
    },
    external: [
        'es6-shim',
        'lodash.merge',
        'lodash.orderby'
    ],
    plugins: [
        json(),
        buble(),
        // uglify({}, minify),
        builtins(),
        orbitalize({env: 'webpack'})
    ]
};
