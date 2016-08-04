const webpackConfig = require('./webpack.config.js');
webpackConfig.entry = {};

module.exports = function(config) {
  config.set({

    basePath: '',

    frameworks: ['mocha'],

    preprocessors: {
      'test/contacthub.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    files: [
      'test/contacthub.js'
    ],

    exclude: [
    ],

    reporters: ['progress'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['PhantomJS'],

    singleRun: false,

    concurrency: Infinity
  });
};
