import { expect } from 'chai';
import sinon from 'sinon';
import xr from 'xr';
import cookies from 'js-cookie';

/* global describe, it, beforeEach */

sinon.stub(xr, 'post');

const cookieName = '_ch';
const varName = 'ch';

const _ch = window[varName];

describe('Event API', () => {
  beforeEach(() => {
    cookies.remove(cookieName);
    xr.post.reset();
  });

  const setConfig = () => {
    _ch('config', {
      workspaceId: 'workspace_id',
      nodeId: 'node_id',
      token: 'ABC123'
    });
  };

  it('checks if required config is set', () => {
    expect(() => {
      _ch('event', 'viewedPage');
    }).to.throw(Error);

    expect(xr.post.callCount).to.equal(0);
  });

  it('sends the event to the API', () => {
    setConfig();
    _ch('event', 'viewedPage');
    expect(xr.post.callCount).to.equal(1);
  });
});
