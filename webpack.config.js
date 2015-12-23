'use strict'

const NODE_ENV = process.env.NODE_ENV || 'development';
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
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
		extensions: ['' ,'.js', '.less']
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
		new ExtractTextPlugin("style.css")
	],
	
//	devtool: 'inline-source-map',
	
	module: {
		
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel',
			query: {
				presets: ['react','es2015'],
				plugins: ['transform-runtime']
			}
		},{
			test: /\.less$/,
			loader: ExtractTextPlugin.extract(
				"style-loader", 
				"css-loader!less-loader"
			)
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