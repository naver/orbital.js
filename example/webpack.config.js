// This config is not for production build.
// For production build of your project,
// please refer to https://webpack.js.org/configuration/

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const extractTextPlugin = new ExtractTextPlugin({
    filename: '[name].css',
    allChunks: true
});
const htmlWebpackPlugin = new HtmlWebpackPlugin({
    template: 'src/app/main.html',
    filename: 'index.html'
});
const hmrPlugin = new webpack.HotModuleReplacementPlugin();

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
        }]
    })
};

const orbitalLoader = {
    test: /orbital.js$/,
    loader: 'orbital-loader'
};

const babelLoader = {
    test: /\.js$/,
    loader: 'babel-loader'
};

const config = {
    bail: true,
    entry: './src/app/main.js',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: '[name].js',
        chunkFilename: '[name].js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.js', '.css'],
        modules: ['node_modules']
    },
    module: {
        rules: [
            babelLoader,
            cssLoader,
            orbitalLoader
        ]
    },
    plugins: [
        extractTextPlugin,
        htmlWebpackPlugin,
        hmrPlugin
    ],
    devtool: '#source-map',
    devServer: {
        contentBase: './public',
        historyApiFallback: true,
        hot: true,
        host: 'localhost',
        port: 3030,
        publicPath: '/',
        stats: {colors: true},
        watchOptions: {
            aggregateTimeout: 1000
        }
    },
    target: 'web'
};

module.exports = config;
