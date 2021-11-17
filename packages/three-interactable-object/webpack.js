const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const DIR_PATH = {
    BUILD: path.resolve(__dirname, './build'),
    SRC: path.resolve(__dirname, './playground'),
};

const config = {
    entry: [
        path.join(DIR_PATH.SRC, 'entry.js'),
        'react-hot-loader/patch',
    ],
    output: {
        path: DIR_PATH.BUILD,
        publicPath: '/',
        filename: 'bundle.[hash].js',
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: `${DIR_PATH.SRC}/index.html`,
            filename: `${DIR_PATH.BUILD}/index.html`,
            inject: 'defer',
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].[hash].css',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader',
                exclude: /node_modules\/(?!(asset-loader|three-background|three-controller|three-interactable-object|three-physics)\/).*/,
            },
            {
                test: /\.(png|jpg|gif|svg|eot|otf|ttf|woff|woff2)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 100000,
                    },
                },
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ],
            },
        ],
    },
    resolve: {
        extensions: ['*', '.js', '.jsx'],
    },
    devServer: {
        contentBase: './build',
        historyApiFallback: true,
        hot: true,
        host: '0.0.0.0',
        port: 3000,
        open: true,
    },
};

module.exports = config;
