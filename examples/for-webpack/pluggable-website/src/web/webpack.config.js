// For more information
// please refer to https://webpack.js.org/configuration/

const autoprefixer = require('autoprefixer');
const CompressionPlugin = require('compression-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const compressionPlugin = new CompressionPlugin({
    asset: '[path].gz[query]',
    algorithm: 'gzip',
    test: /\.(js|css)$/,
    threshold: 10240,
    minRatio: 0.8
});

const babelLoader = {
    test: /\.js$/,
    loader: 'babel-loader'
};

const cssLoader = {
    test: /\.css$/,
    use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [{
            loader: 'css-loader',
            options: {
                importLoaders: 1,
                modules: true,
                sourceMap: true
            }
        }, {
            loader: 'postcss-loader',
            options: {
                plugins: function plugins() {
                    return [
                        autoprefixer
                    ];
                }
            }
        }]
    })
};

const extractTextPlugin = new ExtractTextPlugin({
    filename: '[name].css',
    allChunks: true
});

const fileLoader = {
    test: /\.(png|gif|jpg)$/,
    loader: 'file-loader',
    options: {
        name: '/files/[hash].[ext]'
    }
};

const config = {
    module: {
        rules: [
            babelLoader,
            cssLoader,
            fileLoader
        ]
    },
    plugins: [
        compressionPlugin,
        extractTextPlugin
    ],
    devtool: '#source-map',
    target: 'web',
    externals: {
        'orbital.js': 'orbital'
    }
};

module.exports = config;
