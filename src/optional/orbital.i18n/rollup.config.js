const buble = require('rollup-plugin-buble');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const builtins = require('rollup-plugin-node-builtins');
const resolve = require('rollup-plugin-node-resolve');

module.exports = {
    plugins: [
        json(),
        buble({
            objectAssign: 'Object.assign',
            exclude: ['node_modules/**']
        }),
        commonjs({
            include: 'node_modules/**',
            extensions: ['.js', '.json']
        }),
        resolve({
            extensions: ['.js', '.json'],
            preferBuiltins: true
        }),
        builtins()
    ],
    external: [
    ],
    sourcemap: true
};
