// @flow
import {expect} from 'chai';
import cookies from 'js-cookie';

import type {ContactHubFunction} from '../lib/types';

/* global describe, it, beforeEach */

const cookieName = '_ch';
const varName = 'ch';

const getCookie = () => cookies.getJSON(cookieName) || {};

const _ch: ContactHubFunction = window[varName];

describe('Config API', () => {
  beforeEach(() => {
    cookies.remove(cookieName);
  });

  beforeEach(() => {
    _ch('config', {
      workspaceId: 'workspace_id',
      nodeId: 'node_id',
      token: 'ABC123'
    });
  });

  it('sets a cookie', () => {
    expect(cookies.get(cookieName)).to.be.ok;
  });

  it('generates a UUIDv4 sessionId', () => {
    expect(getCookie().sid).to.match(
      /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
    );
  });

  it('does not regenerate sessionId if already present', () => {
    const sid = getCookie().sid;
    _ch('config', {
      workspaceId: 'workspace_id',
      nodeId: 'node_id',
      token: 'ABC123'
    });
    expect(getCookie().sid).to.equal(sid);
  });

  it('stores all config data in the cookie', () => {
    const c = getCookie();
    expect(c.workspaceId).to.equal('workspace_id');
    expect(c.nodeId).to.equal('node_id');
    expect(c.token).to.equal('ABC123');
  });

  it('uses "WEB" if context not provided', () => {
    expect(getCookie().context).to.equal('WEB');
  });

  it('allows to specify optional context', () => {
    _ch('config', {
      workspaceId: 'workspace_id',
      nodeId: 'node_id',
      token: 'ABC123',
      context: 'foo'
    });
    expect(getCookie().context).to.equal('foo');
  });

  it('allows to specify optional contextInfo', () => {
    _ch('config', {
      workspaceId: 'workspace_id',
      nodeId: 'node_id',
      token: 'ABC123',
      context: 'foo',
      contextInfo: {
        foo: 'bar'
      }
    });
    expect(getCookie().contextInfo).to.eql({foo: 'bar'});
  });

  it('removes user data from cookie if the token changes', () => {
    cookies.set(
      cookieName,
      Object.assign(getCookie(), {
        customerId: 'customer-id',
        token: 'ABC123'
      })
    );

    _ch('config', {
      workspaceId: 'workspace_id',
      nodeId: 'node_id',
      token: 'CDE456'
    });

    expect(getCookie().token).to.equal('CDE456');
    expect(getCookie().customerId).to.be.undefined;
    expect(getCookie().hash).to.be.undefined;
  });
});
