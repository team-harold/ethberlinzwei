const webpack = require('webpack');
const path = require('path');
const config = require('sapper/config/webpack.js');
const pkg = require('./package.json');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const forceSourceMap = true;

const mode = process.env.NODE_ENV || 'production';
const dev = mode === 'development';

const alias = { svelte: path.resolve('node_modules', 'svelte') };
const extensions = ['.mjs', '.js', '.json', '.svelte', '.html'];
const mainFields = ['svelte', 'module', 'browser', 'main'];

const serverEntry = config.server.entry();
const serverOutput = config.server.output();

const staticPath = path.resolve(__dirname, "static");
const relativeStaticPath = path.relative(serverOutput.path, staticPath);

module.exports = {
	client: {
		performance: {
			hints: false // TODO 'warning'
		},
		entry: config.client.entry(),
		output: config.client.output(),
		resolve: { alias, extensions, mainFields },
		module: {
			rules: [
				{
					test: /\.(svelte|html)$/,
					use: {
						loader: 'svelte-loader',
						options: {
							dev,
							hydratable: true,
							hotReload: false // pending https://github.com/sveltejs/svelte/issues/2377
						}
					}
				}
			]
		},
		mode,
		plugins: [
			// pending https://github.com/sveltejs/svelte/issues/2377
			// dev && new webpack.HotModuleReplacementPlugin(),
			new webpack.DefinePlugin({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
		].filter(Boolean),
		devtool: (forceSourceMap || dev) && 'inline-source-map',
	},

	server: {
		entry: serverEntry,
		output: serverOutput,
		target: 'node',
		resolve: { alias, extensions, mainFields },
		externals: Object.keys(pkg.dependencies).concat('encoding'),
		plugins: [
			new MiniCssExtractPlugin({
				filename: path.join(relativeStaticPath, 'global.css'), // cannot use absolute path
			}),
		],
		module: {
			rules: [
				{
					test: /\.(svelte|html)$/,
					use: {
						loader: 'svelte-loader',
						options: {
							css: false,
							generate: 'ssr',
							dev
						}
					}
				},
				{
					test: /\.css$/,
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
						},
						{
							loader: 'css-loader',
							options: {
							  importLoaders: 1
							}
						},
						'postcss-loader',
					]
				}
			]
		},
		mode,
		performance: {
			hints: false // it doesn't matter if server.js is large
		},
	},

	serviceworker: {
		entry: config.serviceworker.entry(),
		output: config.serviceworker.output(),
		mode,
	}
};
