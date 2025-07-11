const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')
const dateFormat = require('date-format')
const px2rem = require('postcss-pxtorem')

// 编译时间
const buildDate = dateFormat('yyyy-MM-dd hh:mm:ss', new Date())

module.exports = defineConfig({
	transpileDependencies: true,
	publicPath: './',
	devServer: {
		allowedHosts: 'all'
	},
	css: {
		loaderOptions: {
			postcss: {
				postcssOptions: {
					plugins: [
						px2rem({
							rootValue: 100,
							unitPrecision: 2,
							propList: ['*'],
							selectorBlackList: [],
							mediaQuery: false,
							minPixelValue: 1
						})
					]
				}
			}
		}
	},
	chainWebpack: config => {
		const svgRule = config.module.rule('svg')
		svgRule.delete('generator')
		svgRule.delete('type')

		// 清除已有的所有 loader。
		// 如果你不这样做，接下来的 loader 会附加在该规则现有的 loader 之后。
		svgRule.uses.clear()
		// 添加要替换的 loader
		svgRule.use('vue-svg-inline-loader').loader('vue-svg-inline-loader')
	},
	configureWebpack: {
		devtool: 'eval-source-map',
		output: {
			libraryExport: 'default'
		},
		module: {
			strictExportPresence: true,
			rules: [
				{
					test: /\.js$/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								cacheDirectory: true,
								presets: ['@babel/preset-env']
							}
						}
					]
				},
				{
					test: /\.svg$/,
					loader: 'svg-inline-loader'
				},
				{
					test: /\.(png|jpg)$/,
					loader: 'url-loader',
					options: {
						limit: 40000
					}
				},
				{
					test: /\.art$/,
					loader: 'art-template-loader'
				}
			]
		},
		plugins: [
			new webpack.DefinePlugin({
				'process.env': {
					PLAYER_VERSION: `"v${require('./package.json').version}"`,
					BUILD_DATE: `"${buildDate}"`
				}
			})
		]
	}
})
