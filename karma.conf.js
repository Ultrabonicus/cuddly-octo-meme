
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
            './test/assets/js/*_test.js'
        ],

        preprocessors: {
			'./test/assets/js/*_test.js': ['webpack','sourcemap']
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