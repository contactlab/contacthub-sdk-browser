/* eslint-disable camelcase */

import {Config, ConfigOptions, CustomLauncher} from 'karma';
import {Configuration} from 'webpack';
import {merge} from 'webpack-merge';
import {latest} from './webpack.config';

// FIXME: really hacky...
declare const process: NodeJS.Process;

interface WithPlugins extends ConfigOptions {
  webpack?: Configuration;
  browserStack?: {
    username: string;
    accessKey: string;
  };
}

interface BSLauncher extends CustomLauncher {
  browser?: string;
  browser_version?: string;
  device?: string;
  os: string;
  os_version: string;
  real_mobile?: boolean;
}

// --- Env vars
// eslint-disable-next-line @typescript-eslint/no-var-requires
process.env.CHROME_BIN = require('puppeteer').executablePath();

const BS = process.env.BS === 'true';
const MIN = process.env.MINIMIZED === 'true';

// --- Sources and browsers driven by env vars
const SOURCE = `dist/sdk${MIN ? '.min' : ''}.js`;

const STD_BROWSERS = ['ChromeHeadlessNoSandbox'];
const BS_BROWSERS = [
  'bs_win_ie10',
  'bs_win_firefox',
  'bs_win_edge',
  'bs_android_galaxys8',
  'bs_android_pixel',
  'bs_ios_iphone8'
];

// --- Karma configurationg
export default function (config: Config): void {
  // eslint-disable-next-line no-console
  console.log(`\n=== CURRENT SOURCE IS: ${SOURCE} ===\n`);

  const bs_win_ie10: BSLauncher = {
    base: 'BrowserStack',
    browser: 'IE',
    browser_version: '10',
    os: 'Windows',
    os_version: '7'
  };

  const bs_win_firefox: BSLauncher = {
    base: 'BrowserStack',
    browser: 'Firefox',
    browser_version: '59',
    os: 'Windows',
    os_version: '8.1'
  };

  const bs_win_edge: BSLauncher = {
    base: 'BrowserStack',
    browser: 'Edge',
    browser_version: '16.0',
    os: 'Windows',
    os_version: '10'
  };

  const bs_android_galaxys8: BSLauncher = {
    base: 'BrowserStack',
    device: 'Samsung Galaxy S8',
    real_mobile: true,
    os: 'Android',
    os_version: '7.0'
  };

  const bs_android_pixel: BSLauncher = {
    base: 'BrowserStack',
    device: 'Google Pixel',
    real_mobile: true,
    os: 'android',
    os_version: '8.0'
  };

  const bs_ios_iphone8: BSLauncher = {
    base: 'BrowserStack',
    device: 'iPhone 8',
    real_mobile: true,
    os: 'iOS',
    os_version: '11.0'
  };

  const KARMA_CONFIG: WithPlugins = {
    basePath: '',

    frameworks: ['mocha'],

    files: ['test/integration/setup.js', SOURCE, 'test/integration/index.ts'],

    preprocessors: {
      'test/integration/index.ts': ['webpack']
    },

    webpack: merge(latest, {
      // Just for sinon
      resolve: {fallback: {util: false}}
    }),

    exclude: [],

    reporters: ['progress'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_DEBUG,

    autoWatch: true,

    browsers: BS ? BS_BROWSERS : STD_BROWSERS,

    client: {
      captureConsole: true
    },

    browserConsoleLogOptions: {
      terminal: true
    },

    singleRun: true,

    concurrency: Infinity,

    browserStack: {
      username: process.env.BROWSERSTACK_USERNAME ?? '',
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY ?? ''
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

      bs_win_ie10,
      bs_win_firefox,
      bs_win_edge,
      bs_android_galaxys8,
      bs_android_pixel,
      bs_ios_iphone8
    }
  };

  config.set(KARMA_CONFIG);
}
