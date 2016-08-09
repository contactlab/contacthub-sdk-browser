import { expect } from 'chai';
import xr from 'xr';
import cookies from 'js-cookie';

/* global describe, it, beforeEach */

const apiUrl = 'https://api.contactlab.it/hub/v1';
const cookieName = '_ch';
const varName = 'ch';
const config = {
  workspaceId: 'workspace_id',
  nodeId: 'node_id',
  token: 'ABC123'
};

// const getCookie = () => cookies.getJSON(cookieName) || {};

const _ch = window[varName];

describe('Customer API', () => {
  beforeEach(() => {
    cookies.remove(cookieName);
    xr.post.reset();
  });

  const setConfig = () => {
    _ch('config', config);
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

  it('checks if required config is set', () => {
    expect(() => {
      _ch('customer', mario);
    }).to.throw(Error);

    expect(xr.post.callCount).to.equal(0);
  });

  describe('when customerId is not known', () => {
    beforeEach(() => {
    });

    it('creates a new customer', () => {
      setConfig();
      _ch('customer', mario);
      expect(xr.post.callCount).to.equal(1);
      const call = xr.post.getCall(0);
      expect(call.args[0]).to.equal(
        `${apiUrl}/workspaces/${config.workspaceId}/customers`
      );
      expect(call.args[1]).to.eql({
        enabled: true,
        nodeId: config.nodeId,
        base: mario.base,
        extended: undefined,
        extra: undefined,
        tags: undefined
      });
      expect(call.args[2].headers.Authorization).to.eql(
        `Bearer ${config.token}`
      );
    });

    it('stores the customerId for future calls', () => {
    });

    it('reconciles the sessionId with the customerId', () => {
    });

    it('tries to find a customer matching externalId if provided', () => {
    });
  });

  describe('when customerId is already known', () => {
    beforeEach(() => {
    });

    it('does not update the customer if the hash matches', () => {
    });

    it('updates the customer if the hash does not match', () => {
    });

    it('removes fields set to "null"', () => {
    });

  });
});
