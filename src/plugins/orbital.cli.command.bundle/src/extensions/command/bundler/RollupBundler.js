const path = require('path');
const Bundler = require('./Bundler');

class RollupBundler extends Bundler {

    constructor(manifest, context) {
        super(manifest, context);
        if (!this.lib) {
            this.lib = require('rollup');
        }
        if (!this.config) {
            this.config = require('./config/default.rollup.config.js');
        }
        this.initConfig();
    }

    getBuildDir() {
        const bundlePath = this.manifest.orbital.bundle.path;
        return path.resolve(process.cwd(), bundlePath);
    }

    initConfig() {
        if (this.config.external instanceof Array) {
            this.config.external.push('orbital.core');
        } else {
            this.config.external = ['orbital.core'];
        }
    }

    runBuild(sourcePath, bundledModuleId) {
        const rollup = this.lib;
        const bundleCfg = this.manifest.orbital.bundle;
        const inputOptions = Object.assign({}, this.config, {
            input: sourcePath
        });
        const outputOptions = Object.assign({}, this.config, {
            file: bundleCfg.path + path.sep + bundledModuleId + '.js',
            format: bundleCfg.format
        });
        if (bundleCfg.format === 'umd') {
            outputOptions.name = bundledModuleId;
        }
        return rollup.rollup(inputOptions).then((bundle) => {
            bundle.write(outputOptions);
        });
    }
}

module.exports = RollupBundler;
