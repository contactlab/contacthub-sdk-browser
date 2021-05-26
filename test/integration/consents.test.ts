/* global describe, it, beforeEach, afterEach */

import {expect} from 'chai';
import cookies from 'js-cookie';
import sinon from 'sinon';
import {ConfigOptions} from '../../src/config';
import {CustomerData} from '../../src/customer';

const apiUrl = 'https://api.contactlab.it/hub/v1';
const cookieName = '_ch';

const config: ConfigOptions = {
  workspaceId: 'workspace_id',
  nodeId: 'node_id',
  token: 'ABC123'
};

const CUSTOMER: CustomerData = {
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

const _ch = window.ch;

const getCookie = () => cookies.getJSON(cookieName) || {};

const setConfig = () => {
  _ch('config', config);
};

let requests: sinon.SinonFakeXMLHttpRequest[] = [];
let xhr: sinon.SinonFakeXMLHttpRequestStatic;

// Mocked Ajax calls return immediately but need a short setTimeout to avoid
// race conditions. 0 ms works fine on all browsers except IE 10 which requires
// at least 2 ms.
// TODO: find a more elegant way to mock Ajax calls
const whenDone = (f: () => void): void => {
  setTimeout(() => f(), 2);
};

describe('Consents', () => {
  beforeEach(() => {
    cookies.remove(cookieName);
    requests = [];
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = r => {
      requests.push(r);
    };
    setConfig();
  });

  afterEach(done => {
    whenDone(() => done());
  });

  it('can be set', () => {
    _ch('customer', CUSTOMER);

    expect(requests.length).to.equal(1);
    const req = requests[0];
    expect(req.method).to.equal('POST');
    expect(req.url).to.equal(
      `${apiUrl}/workspaces/${config.workspaceId}/customers`
    );
    expect(JSON.parse(req.requestBody).consents).to.eql(CUSTOMER.consents);
  });

  it('can be updated', done => {
    cookies.set(cookieName, {...getCookie(), customerId: 'my-cid'});

    _ch('customer', CUSTOMER);

    requests[0].respond(200, {}, '');

    whenDone(() => {
      _ch('customer', {
        ...CUSTOMER,
        consents: {
          softSpam: {email: {objection: true}}
        }
      });

      expect(requests.length).to.equal(2);

      whenDone(() => {
        expect(requests.length).to.equal(2);
        const req = requests[1];
        expect(req.method).to.equal('PATCH');
        expect(req.url).to.equal(
          `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid`
        );
        expect(JSON.parse(req.requestBody).consents).to.eql({
          softSpam: {email: {objection: true}}
        });

        done();
      });
    });
  });
});
