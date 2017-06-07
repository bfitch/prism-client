const path = require('path');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
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
    'graphql'
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
