'use strict'

const NODE_ENV = process.env.NODE_ENV || 'development';
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require('path');
const nodeModulesDir = path.join(__dirname, 'node_modules');


function nodeenv(development, production, test){
	if(NODE_ENV == 'development'){
		return development()
	} else if(NODE_ENV == 'production'){
		return production()
	} else if(NODE_ENV == 'test'){
		return test()
	} else {
		return null
	}
}
function returnNull(){
	return null
}


const entry = {
		master : "./js/quizAppMaster.js",
		user: "./js/quizAppUser.js",
		style: "./css/style.less"
	}
	
const output = {
		path: __dirname + '/target/web/public',
        filename: "[name].js",
		library: "[name]"
	}

const contextDir = __dirname + '/src/main/assets'
	
var config = {
    
	entry: nodeenv(() => entry, () => entry, () => {}),
	
    output: nodeenv(() => output, () => output, () => {}),
	
	resolve: {
		extensions: ['' ,'.js', '.less', '.html'],
		alias: {}
	},
	
	plugins: [
		new webpack.NoErrorsPlugin(),
		new webpack.DefinePlugin({
			NODE_ENV: JSON.stringify(NODE_ENV)
		})
	],
	
	devtool: nodeenv(() => 'eval', returnNull, () => 'inline-source-map'),
	
	module: {
		
		noParse: [/^jquery(\-.*)?$/],
		
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

nodeenv(() => config.context = contextDir, () => config.context = contextDir, returnNull)

/*
if (NODE_ENV == 'test') {
	config.module.preLoaders = [{
		test: /\.js$/,
		include: path.resolve(__dirname, './src/test/assets/js'),
		loader: 'babel-istanbul'
	}];
}
*/
if (NODE_ENV != 'test') {
	config.plugins.push(
		new webpack.optimize.CommonsChunkPlugin({
			name: "common",
			chunks: ['master','user']
		})
	);
	config.plugins.push(
		new ExtractTextPlugin("style.css")
	);
}
		
if (NODE_ENV == 'production') {
	config.plugins.push(
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings:     false,
				drop_console: true,
				unsafe:       true
			},
			
			mangle: false
		})
	);
}
module.exports = config