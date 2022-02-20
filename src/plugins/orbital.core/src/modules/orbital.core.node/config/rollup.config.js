import cjs2es6 from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import license from 'rollup-plugin-license';
import builtins from 'rollup-plugin-node-builtins';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

const PRODUCTION = process.env.BUILD === 'production';

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
        builtins(),
        PRODUCTION ? uglify() : {},
        PRODUCTION ? license({
            banner: {
                file: 'config/BUNDLE'
            }
        }) : {}
    ],
    external: [
        'chalk',
        'cli-spinner',
        'fs',
        'jsonschema',
        'orbital.core.common',
        'orbital.core.types',
        'path',
        'read-package-tree'
    ]
};
