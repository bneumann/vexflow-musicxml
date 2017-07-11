const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
      'vexflow-musicxml': './src/index.js',
      'bundle': './src/main.js'
  },
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/build/',
    filename: '[name].js',
    library: 'Vex',
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          'plugins': ['add-module-exports', 'transform-object-assign'],
        },
      },
    ],
  },
  devServer: {
    contentBase: [path.join(__dirname, "public"), path.join(__dirname, "assets")],
    port: 8000,
    compress: true
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
    }),
  ],
};
