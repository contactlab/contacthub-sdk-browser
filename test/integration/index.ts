import {SDKFunction} from '../../src/types';

declare global {
  interface Window {
    ch: SDKFunction;
  }
}

// Tests files MUST be imported with extension otherwise Karma does not work...
import './load.test.ts';
import './config.test.ts';
import './event.test.ts';
import './customer.test.ts';
import './consents.test.ts';
import './utm.test.ts';
