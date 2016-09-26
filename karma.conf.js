const webpackConfig = require('./webpack.config.js');
webpackConfig.entry = {};

module.exports = function(config) {
  config.set({

    basePath: '',

    frameworks: ['mocha'],

    preprocessors: {
      'src/contacthub.js': ['webpack', 'sourcemap'],
      'test/contacthub.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    files: [
      'test/queue.js',
      'src/contacthub.js',
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

    concurrency: Infinity,

    browserStack: {
      username: process.env.BROWSERSTACK_USER,
      accessKey: process.env.BROWSERSTACK_KEY
    },

    customLaunchers: {
      bs_firefox_mac: {
        base: 'BrowserStack',
        browser: 'firefox',
        browser_version: '48.0',
        os: 'OS X',
        os_version: 'Mountain Lion'
      },
      bs_iphone5: {
        base: 'BrowserStack',
        device: 'iPhone 6',
        os: 'ios',
        os_version: '8.3'
      }
    }
  });
};
