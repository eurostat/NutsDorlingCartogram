const path = require("path");
var webpack = require('webpack');
const PurifyCSSPlugin = require('purifycss-webpack')
const glob = require('glob-all')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: "production",
  entry: ["./src/index.js"],
  output: {
    filename: "dorling.min.js",
    publicPath: "build",
    library: "NutsDorlingCartogram",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "build")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      }
    ],
  },
  watch: false,
  optimization: {
    usedExports: true,
    minimize: true
  },
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};
