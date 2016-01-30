
//var path = require('path')
//var webpack = require("webpack")

var webpackcfg = require('./webpack.config.js')



module.exports = function(config) {
    config.set({
        // ... normal karma configuration

		basePath: './src',

		reporters: [
			'progress',
			'coverage',
			'html'
		],
		
		htmlReporter: {
			outputFile: './../unittests.html'
		},
		
		frameworks: [
			'jasmine'
		],
		
		singleRun: false,
		
		coverageReporter: {
			type: 'html',
			dir: '../coverage/',
			subdir: '.'
		},
		
        files: [
            // all files ending in "_test"
//			"./main/assets/js/*.js",
//			'./../node_modules/angular/angular.js',
//			'./../node_modules/angular-mocks/angular-mocks.js',
            './test/assets/js/*_test.js'
            //'test/**/*_test.js'
            // each file acts as entry point for the webpack configuration
        ],

        preprocessors: {
            // add webpack as preprocessor
//			"./src/main/assets/js/quizAppMaster.js": ['webpack'],
//			"./src/main/assets/js/quizAppUser.js": ['webpack'],
//			'./main/assets/js/*.js': ['webpack', 'coverage'],
			'./test/assets/js/*_test.js': ['webpack','sourcemap', 'coverage']
//            './src/test/assets/js/*_test.js': ['webpack']
//			'./src/test/assets/js/*_test.js': ['babel']
           // 'test/**/*_test.js': ['webpack']
        },

        webpack: webpackcfg,
        /*
        {
            // karma watches the test entry points
            // (you don't need to specify the entry option)
            // webpack watches dependencies

            // webpack configuration
        },
		*/
		browsers: [
			'Chrome'
		],

        webpackMiddleware: {
            // webpack-dev-middleware configuration
            // i. e.
            noInfo: false
        },
/*
        plugins: [
			require("karma-coverage"),
			require("karma-jasmine"),
			require("karma-phantomjs-launcher"),
			require("karma-webpack")
        ],
*/		
		client: {
			captureConsole:true
		}

    });
};