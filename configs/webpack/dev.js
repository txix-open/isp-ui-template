// development config
const { merge } = require('webpack-merge');
const commonConfig = require('./common');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = merge(commonConfig, {
  mode: 'development',
  devServer: {
    allowedHosts: 'all',
    hot: true,
    historyApiFallback: true,
    proxy: {
      '/api': process.env.PROXY_URL,
    },
  },
  devtool: 'cheap-module-source-map',
  plugins: [new ReactRefreshPlugin()],
});
