import { expect } from 'chai';
import sinon from 'sinon';
import xr from 'xr';
import cookies from 'js-cookie';

/* global describe, it, beforeEach */

sinon.stub(xr, 'post');

const apiUrl = 'https://api.contactlab.it/hub/v1';
const cookieName = '_ch';
const varName = 'ch';
const config = {
  workspaceId: 'workspace_id',
  nodeId: 'node_id',
  token: 'ABC123'
};

const getCookie = () => cookies.getJSON(cookieName) || {};

const _ch = window[varName];

describe('Event API', () => {
  beforeEach(() => {
    cookies.remove(cookieName);
    xr.post.reset();
  });

  const setConfig = () => {
    _ch('config', config);
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
    const call = xr.post.getCall(0);
    expect(call.args[0]).to.equal(
      `${apiUrl}/workspaces/${config.workspaceId}/events`
    );
    expect(call.args[2].headers.Authorization).to.eql(
      `Bearer ${config.token}`
    );
    expect(call.args[1]).to.eql({
      type: 'viewedPage',
      context: 'WEB',
      properties: {},
      bringBackProperties: {
        type: 'SESSION_ID',
        value: getCookie().sid,
        nodeId: config.nodeId
      }
    });
  });
});
