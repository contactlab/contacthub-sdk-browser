const webpackConfig = require('./webpack.config.js');
const puppeteer = require('puppeteer');

process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: ['mocha'],

    preprocessors: {
      'src/contacthub.js': ['webpack', 'sourcemap'],
      'test/contacthub.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    files: ['test/queue.js', 'src/contacthub.js', 'test/contacthub.js'],

    exclude: [],

    reporters: ['progress'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['ChromeHeadlessNoSandbox'],

    client: {
      captureConsole: true
    },

    browserConsoleLogOptions: {
      level: '',
      terminal: true
    },

    singleRun: false,

    concurrency: Infinity,

    browserStack: {
      username: process.env.BROWSERSTACK_USER,
      accessKey: process.env.BROWSERSTACK_KEY
    },

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--enable-logging',
          '--no-default-browser-check',
          '--no-first-run',
          '--disable-default-apps',
          '--disable-popup-blocking',
          '--disable-translate',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-device-discovery-notifications',
          '--remote-debugging-port=9222',
          '--disable-web-security'
        ]
      },

      bs_win_ie10: {
        base: 'BrowserStack',
        browser: 'IE',
        browser_version: '10',
        os: 'Windows',
        os_version: '7'
      },
      bs_win_firefox: {
        base: 'BrowserStack',
        browser: 'Firefox',
        browser_version: '59',
        os: 'Windows',
        os_version: '8.1'
      },
      bs_win_edge: {
        base: 'BrowserStack',
        browser: 'Edge',
        browser_version: '16.0',
        os: 'Windows',
        os_version: '10'
      },
      bs_android_galaxys8: {
        base: 'BrowserStack',
        device: 'Samsung Galaxy S8',
        real_mobile: true,
        os: 'Android',
        os_version: '7.0'
      },
      bs_android_pixel: {
        base: 'BrowserStack',
        device: 'Google Pixel',
        real_mobile: true,
        os: 'android',
        os_version: '8.0'
      },
      bs_ios_iphone8: {
        base: 'BrowserStack',
        device: 'iPhone 8',
        real_mobile: true,
        os: 'iOS',
        os_version: '11.0'
      }
    }
  });
};
