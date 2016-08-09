import { expect } from 'chai';
import cookies from 'js-cookie';
import sinon from 'sinon';

/* global describe, it, beforeEach */

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

let requests;
let xhr;

describe('Event API', () => {
  beforeEach(() => {
    cookies.remove(cookieName);
    requests = [];
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = (xhr) => {
      requests.push(xhr);
    };
  });

  const setConfig = () => {
    _ch('config', config);
  };

  it('checks if required config is set', () => {
    expect(() => {
      _ch('event', 'viewedPage');
    }).to.throw(Error);

    expect(requests.length).to.equal(0);
  });

  it('sends the event to the API', () => {
    setConfig();
    _ch('event', 'viewedPage');
    const req = requests[0];
    expect(req.url).to.equal(
      `${apiUrl}/workspaces/${config.workspaceId}/events`
    );
    expect(JSON.parse(req.requestBody)).to.eql({
      type: 'viewedPage',
      context: 'WEB',
      properties: {},
      bringBackProperties: {
        type: 'SESSION_ID',
        value: getCookie().sid,
        nodeId: config.nodeId
      }
    });
    expect(req.requestHeaders.Authorization).to.eql(
      `Bearer ${config.token}`
    );
  });
});
