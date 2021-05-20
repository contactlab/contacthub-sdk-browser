/* global describe, it, beforeEach, afterEach */

import {expect} from 'chai';
import cookies from 'js-cookie';
import sinon from 'sinon';

// import type {CustomerData} from '../lib/types';

const apiUrl = 'https://api.contactlab.it/hub/v1';
const cookieName = '_ch';
const varName = 'ch';
const config = {
  workspaceId: 'workspace_id',
  nodeId: 'node_id',
  token: 'ABC123'
};

// const mario: CustomerData = {
const mario = {
  externalId: 'mario.rossi',
  base: {
    firstName: 'mario',
    lastName: 'rossi',
    dob: '1980-03-17',
    contacts: {
      email: 'mario.rossi@example.com'
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

const _ch = window[varName];

const getCookie = () => cookies.getJSON(cookieName) || {};

const setConfig = () => {
  _ch('config', config);
};

let requests = [];
let xhr;

// Mocked Ajax calls return immediately but need a short setTimeout to avoid
// race conditions. 0 ms works fine on all browsers except IE 10 which requires
// at least 2 ms.
// TODO: find a more elegant way to mock Ajax calls
const whenDone = f => {
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
    _ch('customer', mario);

    expect(requests.length).to.equal(1);
    const req = requests[0];
    expect(req.method).to.equal('POST');
    expect(req.url).to.equal(
      `${apiUrl}/workspaces/${config.workspaceId}/customers`
    );
    expect(JSON.parse(req.requestBody).consents).to.eql(mario.consents);
  });

  it('can be updated', done => {
    cookies.set(
      cookieName,
      Object.assign(getCookie(), {
        customerId: 'my-cid'
      })
    );

    _ch('customer', mario);
    requests[0].respond(200);

    whenDone(() => {
      const newConsents = {
        softSpam: {
          email: {
            objection: true
          }
        }
      };

      _ch('customer', Object.assign(mario, {consents: newConsents}));
      expect(requests.length).to.equal(2);

      whenDone(() => {
        expect(requests.length).to.equal(2);
        const req = requests[1];
        expect(req.method).to.equal('PATCH');
        expect(req.url).to.equal(
          `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid`
        );
        expect(JSON.parse(req.requestBody).consents).to.eql(newConsents);

        done();
      });
    });
  });
});
