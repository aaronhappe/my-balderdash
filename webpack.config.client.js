module.exports = {
  entry: './src/client/index.js',
  output: {
    path: __dirname + '/build',
    filename: 'main.js'
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        exclude: /(node_modules)/,
        loader: 'json-loader'
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader'
      }
    ]
  }
};
