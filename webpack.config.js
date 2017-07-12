const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
      'vexflow-musicxml': './src/index.js',
      'bundle': './src/main.js'
  },
  output: {
    path: path.join(__dirname, 'build'),
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
    contentBase: [path.join(__dirname, "tests/testdata/v3"), path.join(__dirname, "src"), path.join(__dirname, "build")],
    port: 8000,
    compress: false
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    // new webpack.LoaderOptionsPlugin({
    //   //TODO: Make it NODE_ENV dependent
    //    debug: true
    // }),
  ]
};
