import { expect } from 'chai';
import cookies from 'js-cookie';

/* global describe, it, beforeEach */

const cookieName = '_ch';
const varName = 'ch';

const getCookie = () => cookies.getJSON(cookieName) || {};

const _ch = window[varName];

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
    expect(getCookie().sid).to.match(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
  });

  it('does not regenerate sessionId if already present', () => {
    const sid = getCookie().sid;
    _ch('config');
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

  it('allows to override a single required param', () => {
    _ch('config', {
      nodeId: 'another_node'
    });
    expect(getCookie().nodeId).to.equal('another_node');
    expect(getCookie().workspaceId).to.equal('workspace_id');
    expect(getCookie().token).to.equal('ABC123');
  });
});
