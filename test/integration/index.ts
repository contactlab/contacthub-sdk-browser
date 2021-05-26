import {SDKFunction} from '../../src/types';

declare global {
  interface Window {
    ch: SDKFunction;
  }
}

import './load.test';
import './config.test';
import './event.test';
import './customer.test';
import './consents.test';
import './utm.test';
