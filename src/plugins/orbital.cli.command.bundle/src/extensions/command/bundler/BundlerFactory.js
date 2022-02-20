const RollupBundler = require('./RollupBundler');
const WebpackBundler = require('./WebpackBundler');

const classMap = {
    rollup: RollupBundler,
    webpack: WebpackBundler
};

class BundlerFactory {

    static getBundler(manifest, context) {
        const bundlerName = manifest.orbital.bundle.bundler;
        if (classMap[bundlerName]) {
            const Bundler = classMap[bundlerName];
            return new Bundler(manifest, context);
        }
        return null;
    }
}

module.exports = BundlerFactory;
