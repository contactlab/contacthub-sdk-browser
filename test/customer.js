import { expect } from 'chai';
import cookies from 'js-cookie';
import sinon from 'sinon';

/* global describe, it, beforeEach, afterEach */

const apiUrl = 'https://api.contactlab.it/hub/v1';
const cookieName = '_ch';
const varName = 'ch';
const config = {
  workspaceId: 'workspace_id',
  nodeId: 'node_id',
  token: 'ABC123'
};

const mario = {
  base: {
    firstName: 'mario',
    lastName: 'rossi',
    dob: '1980-03-17',
    contacts: {
      email: 'mario.rossi@example.com'
    }
  }
};

const getCookie = () => cookies.getJSON(cookieName) || {};

const setConfig = () => { _ch('config', config); };

const _ch = window[varName];

let requests = [];
let xhr;

// Mocked Ajax calls return immediately but need a short setTimeout to avoid
// race conditions. 0 ms works fine on all browsers except IE 10 which requires
// at least 2 ms.
// TODO: find a more elegant way to mock Ajax calls
const whenDone = (f) => {
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

  describe('when customerId is unknown and externalId is not provided,', () => {
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
          _links: {
            customer: {
              href: 'http://api.contactlab.it/link/to/existing-cid'
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


  describe('when customerId is already known', () => {
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
        base: mario.base
      });
    });

    it('does not update the customer if the same data is sent', (done) => {
      requests[0].respond(200, {}, JSON.stringify(
        { _embedded: { customers: [{ id: 'existing-cid' }] } }
      ));
      whenDone(() => {
        _ch('customer', mario);
        expect(requests.length).to.equal(1);
        done();
      });
    });

    it('does update the customer if updated data is sent', (done) => {
      requests[0].respond(200, {}, JSON.stringify(
        { _embedded: { customers: [{ id: 'existing-cid' }] } }
      ));
      whenDone(() => {
        mario.base.lastName = 'Rossini';
        _ch('customer', mario);
        expect(requests.length).to.equal(2);
        done();
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
      expect(getCookie().sid).to.match(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
    });
  });
});
