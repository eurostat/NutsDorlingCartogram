const path = require('path')

module.exports = {
    mode: 'production',
    entry: ['./src/index.js'],
    output: {
        filename: 'dorling.min.js',
        publicPath: 'build/',
        library: 'NutsDorlingCartogram',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'build'),
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
                        sourceMaps: false,
                    },
                },
            },
            {
                test: /\.css$/i,
                use: [
                    // MiniCssExtractPlugin.loader,
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 100000,
                        },
                    },
                ],
            },
        ],
    },
    watch: false,
    optimization: {
        usedExports: true,
        minimize: true,
    },
    plugins: [
        // new BundleAnalyzerPlugin()
        // new MiniCssExtractPlugin(),
        // new PurgeCSSPlugin({
        //   paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
        // }),
    ],
}
