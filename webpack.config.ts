import TerserPlugin from 'terser-webpack-plugin';
import {Configuration, RuleSetRule} from 'webpack';
import * as webpack from 'webpack';
import {merge} from 'webpack-merge';

const commons: Configuration = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    sdk: './src/index.ts'
  },
  output: {
    library: 'ContactlabSDKBrowser',
    libraryTarget: 'umd'
  },
  optimization: {
    emitOnErrors: false,
    concatenateModules: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [new webpack.ProgressPlugin()]
};

const tsLoader = (configFile: string): RuleSetRule => ({
  test: /\.(ts|js)$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        configFile
      }
    }
  ]
});

const es6 = merge(commons, {
  target: ['web', 'es6'],

  module: {rules: [tsLoader('tsconfig.build.json')]},

  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {ecma: 2015},
        parallel: true
      })
    ]
  }
});

const es5 = merge(commons, {
  target: ['web', 'es5'],

  module: {rules: [tsLoader('tsconfig.build.legacy.json')]},

  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {ecma: 5},
        parallel: true
      })
    ]
  }
});

export const latest = merge(es6, {optimization: {minimize: false}});

export const latestMin = merge(es6, {output: {filename: '[name].min.js'}});

export const legacy = merge(es5, {
  optimization: {minimize: false},
  output: {filename: '[name].legacy.js'}
});

export const legacyMin = merge(es5, {
  output: {filename: '[name].legacy.min.js'}
});

export default [latest, latestMin, legacy, legacyMin];
