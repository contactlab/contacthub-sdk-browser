import sinon from 'sinon';
import {ConfigOptions} from '../../src/config';
import {CustomerData} from '../../src/customer';

export const CH = '_ch';
export const UTM = '_chutm';
export const API = 'https://api.contactlab.it/hub/v1';
export const WSID = 'workspace_id';
export const NID = 'node_id';
export const TOKEN = 'ABC123';
export const CID = 'abcd';
export const CONFIG: ConfigOptions = {
  workspaceId: WSID,
  nodeId: NID,
  token: TOKEN
};

export const CUSTOMER: CustomerData = {
  externalId: 'foo.bar',
  base: {
    firstName: 'foo',
    lastName: 'bar',
    dob: '1980-03-17',
    contacts: {
      email: 'foo.bar@example.com'
    }
  },
  consents: {
    disclaimer: {
      date: '2018-04-28:16:01Z',
      version: 'v1.0'
    },
    marketing: {
      automatic: {
        sms: {
          status: true,
          limitation: true
        }
      }
    }
  }
};

/**
 * Mocked Ajax calls return immediately but need a short setTimeout to avoid
 * race conditions. 0 ms works fine on all browsers except IE 10 which requires
 * at least 2 ms.
 */
export const whenDone = (): Promise<void> =>
  new Promise(resolve => setTimeout(() => resolve(undefined), 2));

/**
 * Shorthand for globally defined SDK function
 */
export const _ch = window.ch;

/**
 * Shorthand for globallly available `fetchMock` sandbox instance
 */
export const _fetchMock = window.fetchMock;

/**
 * Stubs `console.error`
 */
export const spy = sinon.stub(console, 'error').callsFake(() => undefined);

/**
 * Sets test configuration (token + wsid + nodeid)
 */
export const setConfig = (): void => _ch('config', CONFIG);
