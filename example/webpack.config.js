// This config is not for production build.
// For production build of your project,
// please refer to https://webpack.js.org/configuration/

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const extractTextPlugin = new MiniCssExtractPlugin({
    filename: 'css/[name].css',
    chunkFilename: 'css/[name].css'
});
const htmlWebpackPlugin = new HtmlWebpackPlugin({
    template: 'src/app/main.html',
    filename: 'index.html'
});
const hmrPlugin = new webpack.HotModuleReplacementPlugin();

const cssLoader = {
    test: /\.css$/,
    use: [
        MiniCssExtractPlugin.loader,
        {
            loader: 'css-loader',
            options: {
                modules: true,
                sourceMap: true
            }
        }
    ]
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
    mode: 'development',
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
