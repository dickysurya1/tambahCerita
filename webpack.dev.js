const path = require('path');
const common = require('./webpack.common.js');
const { merge } = require('webpack-merge');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
      publicPath: '/'
    },
    compress: true,
    port: 9000,
    hot: true,
    headers: {
      'Service-Worker-Allowed': '/'
    },
    devMiddleware: {
      writeToDisk: true
    }
  },
});
