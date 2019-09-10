/* eslint-disable indent */
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
// const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
// const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const PreloadWebpackPlugin = require('preload-webpack-plugin');
const c = require('./const');
// const CopyWebpackPlugin = require('copy-webpack-plugin');

const sourceDir = path.join(__dirname, 'app');
// const buildDir = path.join(__dirname, 'build');
// const loginEntry = path.join(sourceDir, './js/pages/Login/index.js');

const mainEntry = path.join(sourceDir, './js/index.js');
const {NODE_ENV = 'production'} = process.env;

const htmlWebpackPluginOptions = {
    removeComments: true,
    collapseWhitespace: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    removeStyleLinkTypeAttributes: true,
    keepClosingSlash: true,
    minifyJS: true,
    minifyCSS: true,
    minifyURLs: true,
};

const baseStyleLoader = [
    {
        loader: MiniCssExtractPlugin.loader,
        options: {},
    },
    {
        loader: 'css-loader',
        options: {
            importLoaders: 1,
            sourceMap: false,
        },
    },
];

module.exports = require('./webpack.config.base')({
    mode: 'production',
    devtool: 'source-map',

    entry: {
        main: mainEntry,
    },

    output: {
        filename: '[name]-[hash:4].js',
        chunkFilename: '[name]-[chunkhash:4].js',
        publicPath: '/',
    },

    optimization: {
        namedModules: true,
        noEmitOnErrors: true,

        minimizer: [
            // in some cases we may want to try to run prod build without the uglifyer
            // for debugging purposes only
            NODE_ENV === 'production'
                ? new TerserPlugin({
                    sourceMap: process.env.SOURCEMAPS === 'true',
                    parallel: 4,
                    cache: path.join(__dirname, '../.uglify-cache'),
                    terserOptions: {
                        compress: {
                            warnings: false,
                            conditionals: true,
                            unused: true,
                            comparisons: true,
                            sequences: true,
                            dead_code: true,
                            evaluate: true,
                            if_return: true,
                            join_vars: true,
                            drop_console: true,
                        },
                        output: {
                            comments: false,
                        },
                    },
                })
                : null,

            new OptimizeCSSAssetsPlugin({}),

            // copy statics
            // new CopyWebpackPlugin([{ from: '**/*', context: path.join(sourceDir, 'static') }]),

            // remove null plugins
        ].filter(Boolean),
    },

    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: 'static/[name].[hash:4].css',
            chunkFilename: 'static/[id].[hash:4].css',
        }),

        /* new CopyWebpackPlugin([
                {
                    from: path.join(__dirname, 'public'),
                    to: path.join(buildDir, 'static'),
                    ignore: '_redirects',
                },
                {
                    from: path.join(__dirname, 'public', '_redirects'),
                    to: buildDir,
                },
            ]), */

        /* new SWPrecacheWebpackPlugin({
                cacheId: 'budgeting-app',
                filename: 'sw.js',
                maximumFileSizeToCacheInBytes: 800000,
                staticFileGlobsIgnorePatterns: [/_redirects$/],
                mergeStaticsConfig: true,
                minify: true,
                runtimeCaching: [
                    {
                        handler: 'cacheFirst',
                        urlPattern: /(.*?)/,
                    },
                ],
            }), */

        new HtmlWebpackPlugin({
            template: c.mainHtml,
            inject: true,
            chunks: ['main'],
            production: true,
            minify: htmlWebpackPluginOptions,
        }),
        new HtmlWebpackPlugin({
            template: c.loginHtml,
            inject: true,
            chunks: ['login'],
            filename: 'login.html',
            production: true,
            minify: htmlWebpackPluginOptions,
        }),

        // make sure script tags are async to avoid blocking html render
        new ScriptExtHtmlWebpackPlugin({
            defaultAttribute: 'async',
        }),

        // inline entrypoint css
        // new HtmlWebpackInlineSourcePlugin(),

        // preload JS and CSS
        // ScriptExtHtmlWebpackPlugin doesn't preload CSS well ATM
        new PreloadWebpackPlugin({
            include: 'initial',
            fileWhitelist: [/(css|js)/],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
                use: {
                    loader: 'file-loader',
                    query: {
                        name: 'static/media/[name]-[hash:5].[ext]',
                    },
                },
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    ...baseStyleLoader,
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
                use: [...baseStyleLoader],
            },
            {
                test: [/\.tsx?$/],
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(jsx?)$/,
                include: sourceDir,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: path.join(__dirname, '.babel-cache', 'production'),
                        },
                    },
                ],
            },
        ],
    },
});
