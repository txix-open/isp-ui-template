import path, {join} from 'path';

import entry from './entry';
import * as plugins from './plugins';
import * as rules from './rules';
import {isDevServer, isProd, rootDir} from './utils/env';
import {arrayFilterEmpty} from './utils/helpers';

export default {
    context: __dirname,
    target: isDevServer ? 'web' : ['web', 'es5'],
    mode: isProd ? 'production' : 'development',
    entry,
    output: {
        path: path.join(__dirname, '../dist'),
        publicPath: isDevServer ? undefined : './',
        filename: isDevServer
            ? '[name].[fullhash].js'
            : '[name].[contenthash].js',
    },
    module: {
        rules: arrayFilterEmpty([
            rules.javascriptRule,
            rules.typescriptRule,
            rules.htmlRule,
            rules.imagesRule,
            rules.fontsRule,
            rules.cssRule,
            ...rules.lessRules,
            ...rules.svgRules,
        ]),
    },
    plugins: arrayFilterEmpty([
        plugins.htmlWebpackPlugin,
        plugins.providePlugin,
        plugins.definePlugin,
        plugins.forkTsCheckerWebpackPlugin,
        plugins.esLintPlugin,
        plugins.copyPlugin,
    ]),
    resolve: {
        alias: {
            '@src': join(rootDir, '/src'),
            '@images': join(rootDir, '/src/images'),
            '@styles': join(rootDir, '/src/styles'),
            '@components': join(rootDir, '/src/components'),
        },
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
    },
    optimization: {
        runtimeChunk: {
            name: 'runtime',
        },
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'initial',
                },
            },
        },
    },
};
