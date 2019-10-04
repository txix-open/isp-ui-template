const webpack = require('webpack');

module.exports = NODE_ENV => new webpack.DefinePlugin({
    NODE_ENV: JSON.stringify(NODE_ENV),

    API_PORT: JSON.stringify(process.env.API_PORT),
    API_URL:  JSON.stringify(process.env.API_URL),

    SOCKET_IO: JSON.stringify(process.env.SOCKET_IO),

    APP_TOKEN: JSON.stringify(process.env.APP_TOKEN),

    __DEV__:     NODE_ENV === 'development',
    __VERSION__: JSON.stringify(require('./package.json').version),

    'process.env.NODE_ENV': JSON.stringify(NODE_ENV === 'development' ? 'development' : 'production'),

    AVAILABLE_LANGS: process.env.AVAILABLE_LANGS,
});
