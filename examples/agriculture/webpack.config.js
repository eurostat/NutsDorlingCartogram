module.exports = {
  entry: './main.js',
  output: {
    path: __dirname + '/bundle',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  devtool: false,
  optimization: {
    usedExports: true,
    minimize: true,
  }
}