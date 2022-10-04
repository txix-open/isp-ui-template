// production config
const { merge } = require('webpack-merge');
const { resolve } = require('path');

const commonConfig = require('./common');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(commonConfig, {
  mode: 'production',
  performance: {
    hints: false,
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({})],
    splitChunks: {
      chunks: 'all',
    },
  },
  output: {
    filename: 'bundle.[contenthash].min.js',
    path: resolve(__dirname, '../../build'),
    publicPath: '/',
    clean: true,
  },
});
