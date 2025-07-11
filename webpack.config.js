const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const dateFormat = require('date-format');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

// 编译时间
const buildDate = dateFormat('yyyy-MM-dd hh:mm:ss', new Date());

module.exports = {
    mode: 'production',
    bail: true,
    devtool: false,
    entry: {
        index: './src/js/index.js',
        'index.min': './src/js/index.js',
        'index.vue': './vue/player/index.js',
        'index.vue.min': './vue/player/index.js'
    },
    output: {
        path: path.resolve(__dirname, '.', 'dist'),
        filename: '[name].js',
        library: {
            name: 'Mirror',
            type: 'umd',
            export: 'default'
        },
        umdNamedDefine: true,
        publicPath: '/'
    },
    resolve: {
        modules: ['node_modules'],
        extensions: ['.js'],
        fallback: {
            dgram: false,
            fs: false,
            net: false,
            tls: false
        }
    },
    externals: {
        vue: 'Vue'
    },
    module: {
        strictExportPresence: true,
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 3 * 1024 // 小于3K的图片直接打包成base64
                    }
                },
                generator: {
                    filename: 'assets/image/[contenthash][ext][query]' // 打包后会放到img文件夹下  hash缓存
                }
            },
            {
                test: /\.art$/,
                loader: 'art-template-loader'
            },
            {
                test: /\.js$/,
                use: ['template-string-optimize-loader', 'babel-loader'],
                include: [path.resolve(__dirname, './src')]
            }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                include: /\.min\.js$/,
                extractComments: false
            }),
            new TerserPlugin({
                include: /\.vue\.min\.js$/,
                extractComments: false
            })
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                PLAYER_VERSION: `"v${require('./package.json').version}"`,
                BUILD_DATE: `"${buildDate}"`
            }
        }),
        new CleanWebpackPlugin()
    ]
};
