const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/server/index.js',
  output: {
    path: __dirname + '/build',
    filename: 'index.js'
  },
    target: 'node',
    node: {
        __dirname: false,
        __filename: false
    },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader'
      }
    ]
  },
    externals: nodeExternals(),
};
