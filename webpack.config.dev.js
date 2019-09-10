/* eslint-disable indent */
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const c = require('./const');
const sourceDir = path.join(__dirname, '/src');
const entryPath = path.join(sourceDir, '/index.tsx');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 8000;
// const loginEntry = path.join(sourceDir, './js/pages/Login/index.js');

const baseCssLoader = [
    {
        loader: MiniCssExtractPlugin.loader,
        options: {
            // you can specify a publicPath here
            // by default it uses publicPath in webpackOptions.output
            hmr: true,
        },
    },
    {
        loader: 'css-loader',
        options: {
            importLoaders: 1,
        },
    },
];

module.exports = require('./webpack.config.base')({
    mode: 'development',
    entry: {
        main: [
            // the entry point of our app
            entryPath
        ],
    },

    // devtool: 'source-map',
    output: {
        filename: '[name].js',
        chunkFilename: '[name].js',
    },

    optimization: {
        namedModules: true,
        noEmitOnErrors: true,
    },

    plugins: [
        new ForkTsCheckerWebpackPlugin(),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
        new HtmlWebpackPlugin({
            inject: true,
            chunks: ['main'],
            filename: 'index.html',
            chunkSortMode: 'none',
            template: c.mainHtml,
        }),
        /* new HtmlWebpackPlugin({
             inject: true,
             chunks: ['login'],
             chunkSortMode: 'none',
             filename: 'login.html',
             template: c.loginHtml,
         }),*/

        new webpack.HotModuleReplacementPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
                use: {
                    loader: 'file-loader',
                    query: {
                        name: 'static/[name].[ext]',
                    },
                },
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    ...baseCssLoader,
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: false,
                            modifyVars: c.theme,
                            javascriptEnabled: true,
                        },
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [...baseCssLoader],
            },
            {
                test: /\.(j|t)sx?$/,
                include: sourceDir,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: path.join(__dirname, '.babel-cache', 'dev'),
                        },
                    },
                ],
            },
        ],
    }
});
