module.exports = {
  entry: './src/contacthub.js',
  output: {
    path: './dist',
    filename: 'contacthub.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },
  devtool: 'inline-source-map'
};
