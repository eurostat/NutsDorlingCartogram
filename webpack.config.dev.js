// dev
const path = require("path");
var LiveReloadPlugin = require("webpack-livereload-plugin");
module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    filename: "dorling.js",
    publicPath: "build",
    library: "NutsDorlingCartogram",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "build")
  },

  module: {
    rules: [
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
  node: {
    fs: "empty"
  },
  plugins: [new LiveReloadPlugin()],
  watch: true,
  devtool: "inline-source-map"
};
