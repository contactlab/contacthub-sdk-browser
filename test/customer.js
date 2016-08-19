import { expect } from 'chai';
import cookies from 'js-cookie';
import sinon from 'sinon';

/* global describe, it, xit, beforeEach, afterEach */

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
    setTimeout(() => done(), 10);
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
      setTimeout(() => {
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
      }, 0);
    });

    it('stores the customerId for future calls', (done) => {
      setTimeout(() => {
        requests[0].respond(200, {}, JSON.stringify({ id: 'new-cid' }));
        setTimeout(() => {
          expect(getCookie().customerId).to.equal('new-cid');
        }, 0);
        done();
      }, 0);
    });

    xit('stores a hash of the customer data for future calls', () => {
    });

    xit('reconciles the sessionId with the customerId', () => {
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

    xit('url-encodes externalId', () => {
    });

    describe('if no results,', () => {
      it('creates a new customer attaching the externalId', (done) => {
        requests[0].respond(404);
        setTimeout(() => {
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
        }, 0);
      });

      it('stores the newly created customerId in the cookie', (done) => {
        requests[0].respond(404);
        setTimeout(() => {
          expect(requests.length).to.equal(2);
          requests[1].respond(200, {}, JSON.stringify({ id: 'new-cid' }));
          setTimeout(() => {
            expect(getCookie().customerId).to.equal('new-cid');
            done();
          }, 0);
        }, 0);
      });
    });

    describe('if exactly one result found,', () => {
      it('updates the existing customer using its customerId', (done) => {
        requests[0].respond(200, {}, JSON.stringify(
          { _embedded: { customers: [{ id: 'existing-cid' }] } }
        ));
        setTimeout(() => {
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
        }, 0);
      });
    });

    describe('if more than one result found,', () => {
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

    xit('does not update the customer if the hash matches', () => {
    });

    xit('removes fields set to "null"', () => {
    });

    xit('allows to completely overwrite the existing data', () => {
    });
  });
});
