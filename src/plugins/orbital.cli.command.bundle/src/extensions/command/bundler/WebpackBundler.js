const common = require('orbital.core.common');
const path = require('path');
const Bundler = require('./Bundler');

class WebpackBundler extends Bundler {

    constructor(manifest, context) {
        super(manifest, context);
        if (!this.lib) {
            this.lib = require('webpack');
        }
        if (!this.config) {
            this.config = require('./config/default.webpack.config.js');
        }
        this.initConfig();
    }

    getBuildDir() {
        return this.config.output.path;
    }

    initConfig() {
        const bundleCfg = this.manifest.orbital.bundle;
        let format = bundleCfg.format;
        if (format === 'cjs') {
            format = 'commonjs';
        }
        const namedModulesPlugin = new this.lib.NamedModulesPlugin();
        this.config = Object.assign(this.config, {
            target: 'web',
            output: {
                path: path.resolve(process.cwd(), bundleCfg.path),
                filename: '[name].js',
                libraryTarget: format
            }
        });
        if (this.config.plugins) {
            this.config.plugins.push(namedModulesPlugin);
        } else {
            this.config.plugins = [namedModulesPlugin];
        }
        if (this.config.externals) {
            this.config.externals['orbital.core'] = 'orbital.core';
        } else {
            this.config.externals = {
                'orbital.core': 'orbital.core'
            };
        }
    }

    runBuild(sourcePath, bundledModuleId) {
        return new Promise((resolve, reject) => {
            const config = Object.assign({}, this.config, {
                entry: {
                    [bundledModuleId]: sourcePath
                }
            });
            config.output = Object.assign(config.output, {
                chunkFilename: 'chunk-[name].js'
            });
            const compiler = this.lib(config);
            compiler.run((err, stats) => {
                if (stats.hasErrors()) {
                    reject(new Error(stats.toString()));
                    return;
                }
                if (stats.hasWarnings()) {
                    reject(new common.Warn(stats.toString()));
                    return;
                }
                resolve();
            });
        });
    }
}

module.exports = WebpackBundler;
