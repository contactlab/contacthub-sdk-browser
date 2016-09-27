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
      bs_mac_firefox: {
        base: 'BrowserStack',
        browser: 'Firefox',
        browser_version: '48',
        os: 'OS X',
        os_version: 'El Capitan'
      },
      bs_win7_ie10: {
        base: 'BrowserStack',
        browser: 'IE',
        browser_version: '10',
        os: 'Windows',
        os_version: '7'
      },
      bs_android_galaxys5: {
        base: 'BrowserStack',
        device: 'Samsung Galaxy S5',
        os: 'Android',
        os_version: '4.4'
      },
      bs_ios_iphone6: {
        base: 'BrowserStack',
        device: 'iPhone 6',
        os: 'iOS',
        os_version: '8.3'
      }
    }
  });
};
