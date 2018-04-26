// @flow

import { expect } from 'chai';
import cookies from 'js-cookie';
import sinon from 'sinon';

import type {
  CustomerData
} from '../lib/types';

/* global describe, it, beforeEach, afterEach */

const apiUrl = 'https://api.contactlab.it/hub/v1';
const cookieName = '_ch';
const varName = 'ch';
const config = {
  workspaceId: 'workspace_id',
  nodeId: 'node_id',
  token: 'ABC123'
};

const mario: CustomerData = {
  externalId: 'mario.rossi',
  base: {
    firstName: 'mario',
    lastName: 'rossi',
    dob: '1980-03-17',
    contacts: {
      email: 'mario.rossi@example.com'
    }
  }
};

const _ch = window[varName];

const getCookie = () => cookies.getJSON(cookieName) || {};

const setConfig = () => { _ch('config', config); };

let requests = [];
let xhr;

// Mocked Ajax calls return immediately but need a short setTimeout to avoid
// race conditions. 0 ms works fine on all browsers except IE 10 which requires
// at least 2 ms.
// TODO: find a more elegant way to mock Ajax calls
const whenDone = f => {
  setTimeout(() => f(), 2);
};

describe('Customer API:', () => {
  beforeEach(() => {
    cookies.remove(cookieName);
    requests = [];
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = (xhr) => {
      requests.push(xhr);
    };
  });

  afterEach((done) => {
    whenDone(() => done());
  });

  it('checks if required config is set', () => {
    expect(() => {
      _ch('customer', mario);
    }).to.throw(Error);

    expect(requests.length).to.equal(0);
  });

  describe('when a customerId is not provided', () => {
    describe('and no customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
        _ch('customer', mario);
      });

      it('creates a new customer', (done) => {
        whenDone(() => {
          expect(requests.length).to.equal(1);
          const req = requests[0];
          expect(req.method).to.equal('POST');
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            nodeId: config.nodeId,
            externalId: mario.externalId,
            base: mario.base
          });
          expect(req.requestHeaders.Authorization).to.equal(
            `Bearer ${config.token}`
          );
          done();
        });
      });

      it('handles 409 conflicts and updates the existing customer', (done) => {
        whenDone(() => {
          requests[0].respond(409, {}, JSON.stringify({
            data: {
              customer: {
                id: 'existing-cid'
              }
            }
          }));
          whenDone(() => {
            expect(requests.length).to.equal(2);
            const req = requests[1];
            expect(req.method).to.equal('PATCH');
            expect(req.url).to.equal(
              `${apiUrl}/workspaces/${config.workspaceId}/customers/existing-cid`
            );
            expect(JSON.parse(req.requestBody)).to.eql({
              externalId: mario.externalId,
              base: mario.base
            });
            done();
          });
        });
      });

      it('stores the customerId for future calls', (done) => {
        whenDone(() => {
          requests[0].respond(200, {}, JSON.stringify({ id: 'new-cid' }));
          whenDone(() => {
            expect(getCookie().customerId).to.equal('new-cid');
            done();
          });
        });
      });

      it('stores a hash of the customer data for future calls', (done) => {
        whenDone(() => {
          requests[0].respond(200, {}, JSON.stringify({ id: 'new-cid' }));
          whenDone(() => {
            expect(getCookie().hash).not.to.be.undefined;
            done();
          });
        });
      });

      it('reconciles the sessionId with the customerId', (done) => {
        const sid = getCookie().sid;
        whenDone(() => {
          requests[0].respond(200, {}, JSON.stringify({ id: 'new-cid' }));
          whenDone(() => {
            expect(requests.length).to.equal(2);
            const req = requests[1];
            expect(req.url).to.equal(
              `${apiUrl}/workspaces/${config.workspaceId}/customers/new-cid/sessions`
            );
            expect(JSON.parse(req.requestBody)).to.eql({
              value: sid
            });
            done();
          });
        });
      });
    });

    describe('and a customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
        cookies.set(cookieName, Object.assign(getCookie(), {
          customerId: 'my-cid'
        }));
        _ch('customer', mario);
      });

      it('updates the customer', () => {
        expect(requests.length).to.equal(1);
        const req = requests[0];
        expect(req.method).to.equal('PATCH');
        expect(req.url).to.equal(
          `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid`
        );
        expect(JSON.parse(req.requestBody)).to.eql({
          externalId: mario.externalId,
          base: mario.base
        });
      });

      it('does not update the customer if the same data is sent', (done) => {
        requests[0].respond(200);
        whenDone(() => {
          _ch('customer', mario);
          expect(requests.length).to.equal(1);
          done();
        });
      });

      it('does update the customer if updated data is sent', (done) => {
        requests[0].respond(200);
        whenDone(() => {
          if (mario.base) {
            mario.base.lastName = 'Rossini';
          }
          _ch('customer', mario);
          expect(requests.length).to.equal(2);
          done();
        });
      });

      it('does update the customer if only the externalId has changed', (done) => {
        requests[0].respond(200);
        whenDone(() => {
          mario.externalId = 'supermario';
          _ch('customer', mario);
          expect(requests.length).to.equal(2);
          done();
        });
      });
    });
  });

  describe('when a customerId is provided but no customer data', () => {
    describe('and the same customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
        cookies.set(cookieName, Object.assign(getCookie(), {
          customerId: 'my-cid'
        }));
        _ch('customer', { id: 'my-cid' });
      });

      it('does not make any API call', () => {
        expect(requests.length).to.equal(0);
      });
    });

    describe('and a different customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
        cookies.set(cookieName, Object.assign(getCookie(), {
          customerId: 'different-cid'
        }));
        _ch('customer', { id: 'my-cid' });
      });

      it('does not make any API call', () => {
        expect(requests.length).to.equal(0);
      });
    });

    describe('and no customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
      });

      it('does not reset the sessionId', () => {
        const { sid } = getCookie();
        _ch('customer', { id: 'my-cid' });

        expect(getCookie().sid).to.eql(sid);
      });

      it('reconciles the sessionId with the customerId', (done) => {
        const { sid } = getCookie();
        _ch('customer', { id: 'my-cid' });

        whenDone(() => {
          expect(requests.length).to.equal(1);
          const req = requests[0];
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid/sessions`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            value: sid
          });
          done();
        });
      });

      it('does not make additional API requests', () => {
        _ch('customer', { id: 'my-cid' });

        expect(requests.length).to.equal(1);
      });
    });
  });

  describe('when a customerId is provided along with some customer data', () => {
    describe('and the same customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
        cookies.set(cookieName, Object.assign(getCookie(), {
          customerId: 'my-cid'
        }));
        _ch('customer', Object.assign(mario, { id: 'my-cid' }));
      });

      it('updates the customer', (done) => {
        whenDone(() => {
          expect(requests.length).to.equal(1);
          const req = requests[0];
          expect(req.method).to.equal('PATCH');
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            externalId: mario.externalId,
            base: mario.base
          });
          done();
        });
      });
    });

    describe('and a different customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
        cookies.set(cookieName, Object.assign(getCookie(), {
          customerId: 'different-cid'
        }));
      });

      it('resets the sessionId', () => {
        const { sid } = getCookie();
        _ch('customer', Object.assign(mario, { id: 'my-cid' }));

        expect(getCookie().sid).not.to.eql(sid);
      });

      it('reconciles the new sessionId with the customerId', (done) => {
        _ch('customer', Object.assign(mario, { id: 'my-cid' }));
        const { sid: newSid } = getCookie();

        whenDone(() => {
          expect(requests.length).to.equal(1);
          const req = requests[0];
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid/sessions`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            value: newSid
          });
          done();
        });
      });

      it('updates the customer', (done) => {
        _ch('customer', Object.assign(mario, { id: 'my-cid' }));

        requests[0].respond(200);
        whenDone(() => {
          expect(requests.length).to.equal(2);
          const req = requests[1];
          expect(req.method).to.equal('PATCH');
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            externalId: mario.externalId,
            base: mario.base
          });
          done();
        });
      });
    });

    describe('and no customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
      });

      it('does not reset the sessionId', () => {
        const { sid } = getCookie();
        _ch('customer', Object.assign(mario, { id: 'my-cid' }));

        expect(getCookie().sid).to.eql(sid);
      });

      it('reconciles the sessionId with the customerId', (done) => {
        const { sid } = getCookie();
        _ch('customer', Object.assign(mario, { id: 'my-cid' }));

        whenDone(() => {
          expect(requests.length).to.equal(1);
          const req = requests[0];
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid/sessions`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            value: sid
          });
          done();
        });
      });

      it('updates the customer', (done) => {
        _ch('customer', Object.assign(mario, { id: 'my-cid' }));

        requests[0].respond(200);
        whenDone(() => {
          expect(requests.length).to.equal(2);
          const req = requests[1];
          expect(req.method).to.equal('PATCH');
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            externalId: mario.externalId,
            base: mario.base
          });
          done();
        });
      });
    });
  });

  describe('when no object is provided', () => {
    beforeEach(() => {
      setConfig();

      cookies.set(cookieName, Object.assign(getCookie(), {
        customerId: 'old-customer-id',
        sid: 'old-session-id'
      }));

      _ch('customer');
    });

    it('removes user data from cookie', () => {
      expect(getCookie().customerId).to.be.undefined;
    });

    it('generates a new sessionId', () => {
      expect(getCookie().sid).to.match(
        /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
      );
    });
  });
});
