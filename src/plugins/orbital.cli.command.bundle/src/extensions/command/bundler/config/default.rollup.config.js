const postcssModules = require('postcss-modules');
const buble = require('rollup-plugin-buble');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');
const resolve = require('rollup-plugin-node-resolve');
const postcss = require('rollup-plugin-postcss');

const cssExportMap = {};

const config = {
    exports: 'named',
    plugins: [
        postcss({
            plugins: [postcssModules({
                getJSON(id, exportTokens) {
                    cssExportMap[id] = exportTokens;
                }
            })],
            extensions: ['.css'],
            extract: true,
            sourceMap: true,
            getExport(id) {
                return cssExportMap[id];
            }
        }),
        json(),
        buble(),
        resolve({
            jsnext: true,
            main: true,
            extensions: ['.js', '.json']
        }),
        commonjs()
    ],
    sourcemap: true
};

module.exports = config;
