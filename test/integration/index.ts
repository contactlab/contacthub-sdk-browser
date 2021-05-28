import {FetchMockSandbox} from 'fetch-mock';
import {SDK} from '../../src/main';

declare global {
  interface Window {
    ch: SDK;
    fetchMock: FetchMockSandbox;
  }
}

import './load.test';
import './config.test';
import './event.test';
import './customer.test';
import './consents.test';
import './utm.test';
