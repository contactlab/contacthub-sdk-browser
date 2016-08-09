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

describe('Customer API', () => {
  beforeEach(() => {
    cookies.remove(cookieName);
    requests = [];
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = (xhr) => {
      requests.push(xhr);
    };
  });

  afterEach(() => {
    xhr.restore();
  });

  it('checks if required config is set', () => {
    expect(() => {
      _ch('customer', mario);
    }).to.throw(Error);

    expect(requests.length).to.equal(0);
  });

  describe('when customerId is not known', () => {
    it('creates a new customer', () => {
      setConfig();
      _ch('customer', mario);

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
    });

    it('stores the customerId for future calls', (done) => {
      setConfig();
      _ch('customer', mario);

      requests[0].respond(200, {}, JSON.stringify({ id: 'new-cid' }));
      setTimeout(() => {
        expect(getCookie().customerId).to.equal('new-cid');
        done();
      }, 0);
    });

    it('reconciles the sessionId with the customerId', () => {
    });

    it('tries to find a customer matching externalId if provided', () => {
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

    it('does not create a new customer', () => {
      const req = requests[0];
      if (req) expect(req.method).not.to.equal('POST');
    });

    it('does not update the customer if the hash matches', () => {
    });

    it('updates the customer if the hash does not match', () => {
    });

    it('removes fields set to "null"', () => {
    });
  });
});
