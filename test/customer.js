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

const giulia = {
  base: {
    firstName: 'giulia',
    lastName: 'ferrari',
    dob: '1980-01-20'
  },
  externalId: 'giulia.ferrari'
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
        expect(req.url).to.equal(
          `${apiUrl}/workspaces/${config.workspaceId}/customers`
        );
        expect(JSON.parse(req.requestBody)).to.eql({
          enabled: true,
          nodeId: config.nodeId,
          base: mario.base
        });
        expect(req.requestHeaders.Authorization).to.equal(
          `Bearer ${config.token}`
        );
        done();
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

  describe('when customerId is unknown but externalId is provided,', () => {
    beforeEach(() => {
      setConfig();
      _ch('customer', giulia);
    });

    it('tries to find a customer matching externalId if provided,', () => {
      const req = requests[0];
      expect(req.method).to.equal('GET');
      expect(req.url).to.equal(
        `${apiUrl}/workspaces/${config.workspaceId}/customers?nodeId=${config.nodeId}&externalId=${giulia.externalId}`
      );
    });

    it('url-encodes externalId', () => {
      giulia.externalId = 'giulia.ferrari@example.com';
      _ch('customer', giulia);
      const req = requests[1];
      expect(req.url).to.equal(
        `${apiUrl}/workspaces/${config.workspaceId}/customers?nodeId=${config.nodeId}&externalId=${encodeURIComponent(giulia.externalId)}`
      );
    });

    describe('if no results,', () => {
      beforeEach(() => {
        requests[0].respond(404);
      });

      it('creates a new customer attaching the externalId', (done) => {
        whenDone(() => {
          expect(requests.length).to.equal(2);
          const req = requests[1];
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            enabled: true,
            nodeId: config.nodeId,
            externalId: giulia.externalId,
            base: giulia.base
          });
          done();
        });
      });

      it('stores the newly created customerId in the cookie', (done) => {
        whenDone(() => {
          expect(requests.length).to.equal(2);
          requests[1].respond(200, {}, JSON.stringify({ id: 'new-cid' }));
          whenDone(() => {
            expect(getCookie().customerId).to.equal('new-cid');
            done();
          });
        });
      });

      it('reconciles the sessionId with the customerId', (done) => {
        const sid = getCookie().sid;
        whenDone(() => {
          requests[1].respond(200, {}, JSON.stringify({ id: 'new-cid' }));
          whenDone(() => {
            expect(requests.length).to.equal(3);
            const req = requests[2];
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

    describe('if exactly one result found,', () => {
      beforeEach(() => {
        requests[0].respond(200, {}, JSON.stringify(
          { _embedded: { customers: [{ id: 'existing-cid' }] } }
        ));
      });

      it('updates the existing customer using its customerId', (done) => {
        whenDone(() => {
          expect(requests.length).to.equal(2);
          const req = requests[1];
          expect(req.method).to.equal('PATCH');
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers/existing-cid`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            enabled: true,
            nodeId: config.nodeId,
            externalId: giulia.externalId,
            base: giulia.base
          });
          done();
        });
      });

      it('reconciles the sessionId with the customerId', (done) => {
        const sid = getCookie().sid;
        whenDone(() => {
          requests[1].respond(200);
          whenDone(() => {
            expect(requests.length).to.equal(3);
            const req = requests[2];
            expect(req.url).to.equal(
              `${apiUrl}/workspaces/${config.workspaceId}/customers/existing-cid/sessions`
            );
            expect(JSON.parse(req.requestBody)).to.eql({
              value: sid
            });
            done();
          });
        });
      });
    });

    describe('if more than one result found,', () => {
      // Behaviour to be defined
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
        enabled: true,
        nodeId: config.nodeId,
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
});
