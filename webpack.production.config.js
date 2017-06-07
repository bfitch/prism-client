const webpack        = require('webpack');
const path           = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'Prism',
    libraryTarget: 'umd'
  },
  externals: [
    'react',
    'graphql',
  ],
  module: {
    rules: [{
      loader: "babel-loader",
      test: /\.js$/, exclude: /node_modules/,
      options: {
        // plugins: ['lodash']
      }
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    // new LodashModuleReplacementPlugin,
    new UglifyJSPlugin({
      beautify: false,
       mangle: {
         screw_ie8: true,
         keep_fnames: true
       },
       compress: {
         screw_ie8: true
       },
       comments: false
    }),
    new BundleAnalyzerPlugin()
  ]
};
