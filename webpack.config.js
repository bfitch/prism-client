const path = require('path');
// const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'PrismClient',
    libraryTarget: 'umd'
  },
  externals: [
    // 'graphql',
    // 'graphql-tools'
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
    // new LodashModuleReplacementPlugin,
    // new BundleAnalyzerPlugin()
  ]
};
