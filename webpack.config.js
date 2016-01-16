'use strict'

const NODE_ENV = process.env.NODE_ENV || 'development';
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');
const nodeModulesDir = path.join(__dirname, 'node_modules');


var config = {
	context: __dirname + '/src/main/assets',
    
	entry: {
		master : "./js/quizAppMaster.js",
		user: "./js/quizAppUser.js",
		style: "./css/style.less"
	},
	
    output: {
		path: __dirname + '/target/web/public',
        filename: "[name].js",
		library: "[name]"
	},
	
	resolve: {
		extensions: ['' ,'.js', '.less', '.html'],
		alias: {}
	},
	
	plugins: [
		new webpack.NoErrorsPlugin(),
		new webpack.DefinePlugin({
			NODE_ENV: JSON.stringify(NODE_ENV)
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: "common",
			chunks: ['master','user']
		}),
		new ExtractTextPlugin("style.css"),
		new webpack.optimize.UglifyJsPlugin()
	],
	
	devtool: NODE_ENV == 'development' ? 'eval' : null,
	
	module: {
		
		noParse: [],
		
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel',
			query: {
				presets: ['es2015'],
				plugins: ['transform-runtime']
			}
		},{
			test: /\.less$/,
			loader: ExtractTextPlugin.extract(
				"style-loader", 
				"css-loader!less-loader"
			)
		},{
			test: /\.html$/,
			loader: 'ngtemplate?relativeTo=' + (path.resolve(__dirname, './src/main/assets/js/angular_templates')) + '/!html',
		}]
	},

    node: {
            fs: 'empty'
    },

    externals: [
        {
            './cptable': 'var cptable'
        }
    ]
}

if (NODE_ENV == 'production') {
	config.plugins.push(
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings:     false,
				drop_console: true,
				unsafe:       true
			}
		})
	);
}
module.exports = config