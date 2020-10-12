const path = require("path");
// var webpack = require('webpack');
//css
// var OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// const PurgeCSSPlugin = require('purgecss-webpack-plugin');
// const MiniCssExtractPlugin = require('mini-css-extract-plugin')

//js
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

//analyse build
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// const PATHS = {
//   src: path.join(__dirname, 'src')
// }

module.exports = {
  mode: "production",
  entry: ["./src/index.js"],
  output: {
    filename: "dorling.min.js",
    publicPath: "build/",
    library: "NutsDorlingCartogram",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "build")
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            cacheDirectory: true,
            sourceMaps: false
          }
        }
      },
      {
        test: /\.css$/i,
        use: [
          // MiniCssExtractPlugin.loader,
          "style-loader",
          "css-loader"
        ]
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
    minimize: true,
    // splitChunks: {
    //   cacheGroups: {
    //     styles: {
    //       name: 'styles',
    //       test: /\.css$/,
    //       chunks: 'all',
    //       enforce: true
    //     }
    //   }
    // }
    // splitChunks: {
    //   chunks: 'all',
    //   maxInitialRequests: Infinity,
    //   minSize: 0,
    //   cacheGroups: {
    //     vendor: {
    //       test: /[\\/]node_modules[\\/]/,
    //       name(module) {
    //         // get the name. E.g. node_modules/packageName/not/this/part.js
    //         // or node_modules/packageName
    //         const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
    //         // npm package names are URL-safe, but some servers don't like @ symbols
    //         return `npm.${packageName.replace('@', '')}`
    //       }
    //     }
    //   }
    // }
  },
  plugins: [
    // new BundleAnalyzerPlugin()
    // new MiniCssExtractPlugin(),
    // new PurgeCSSPlugin({
    //   paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
    // }),
  ]
};
