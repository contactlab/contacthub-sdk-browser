const path = require('path');
const {merge} = require('webpack-merge');

const commons = {
  mode: 'production',
  entry: {
    sdk: './src/index.js'
  },
  output: {
    library: 'ContactlabSDKBrowser',
    libraryTarget: 'umd'
  },
  optimization: {
    emitOnErrors: false,
    concatenateModules: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test'),
          path.resolve(__dirname, 'node_modules/es6-promise')
        ],
        loader: 'babel-loader'
      }
    ]
  }
};

const es6 = merge(commons, {
  target: ['web', 'es6'],

  optimization: {
    minimize: false
  }
});

const es6Min = merge(commons, {
  target: ['web', 'es6'],

  output: {
    filename: '[name].min.js'
  }
});

const legacy = merge(es6, {
  target: ['web', 'es5'],

  output: {
    filename: '[name].legacy.js'
  }
});

const legacyMin = merge(commons, {
  target: ['web', 'es5'],

  output: {
    filename: '[name].legacy.min.js'
  }
});

module.exports = [es6, es6Min, legacy, legacyMin];
