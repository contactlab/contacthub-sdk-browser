import {expect} from 'chai';
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
    xhr.onCreate = xhr => {
      requests.push(xhr);
    };
  });

  const setConfig = () => {
    _ch('config', config);
  };

  it('checks if required config is set', () => {
    expect(() => {
      _ch('event', {type: 'viewedPage'});
    }).to.throw(Error);

    expect(requests.length).to.equal(0);
  });

  it('sends the event to the API', () => {
    setConfig();
    _ch('event', {type: 'viewedPage'});
    const req = requests[0];
    const reqBody = JSON.parse(req.requestBody);

    expect(req.url).to.equal(
      `${apiUrl}/workspaces/${config.workspaceId}/events`
    );
    expect(req.requestHeaders.Authorization).to.equal(`Bearer ${config.token}`);
    expect(reqBody.type).to.equal('viewedPage');
    expect(reqBody.bringBackProperties).to.eql({
      type: 'SESSION_ID',
      value: getCookie().sid,
      nodeId: config.nodeId
    });
  });

  it('sends customerId when available in cookie', () => {
    setConfig();
    cookies.set(
      cookieName,
      Object.assign(getCookie(), {
        customerId: 'my-cid'
      })
    );
    _ch('event', {type: 'viewedPage'});
    const req = requests[0];
    expect(req.url).to.equal(
      `${apiUrl}/workspaces/${config.workspaceId}/events`
    );
    expect(JSON.parse(req.requestBody).customerId).to.eql('my-cid');
  });

  it('omits bringBackProperties when customerId is available', () => {
    setConfig();
    cookies.set(
      cookieName,
      Object.assign(getCookie(), {
        customerId: 'my-cid'
      })
    );
    _ch('event', {type: 'viewedPage'});
    const req = requests[0];
    expect(req.url).to.equal(
      `${apiUrl}/workspaces/${config.workspaceId}/events`
    );
    expect(JSON.parse(req.requestBody).bringBackProperties).to.be.undefined;
  });

  it('infers common "viewedPage" event properties', () => {
    document.title = 'Hello world';
    setConfig();
    _ch('event', {type: 'viewedPage'});
    const req = requests[0];
    const props = JSON.parse(req.requestBody).properties;

    expect(props.title).to.eql('Hello world');
    expect(props.url).to.match(/^http:.*context.html$/);
    expect(props.path).to.eql('/context.html');
    expect(props.referer).to.match(/^http:.*?id=.*$/);
  });

  it('allows to override inferred properties', () => {
    setConfig();
    _ch('event', {
      type: 'viewedPage',
      properties: {
        title: 'Custom title'
      }
    });
    const req = requests[0];
    const props = JSON.parse(req.requestBody).properties;

    expect(props.title).to.eql('Custom title');
    expect(props.path).to.eql('/context.html');
  });

  it('does not infer properties on other event types', () => {
    document.title = 'Hello world';
    setConfig();
    _ch('event', {type: 'something'});
    const req = requests[0];
    const props = JSON.parse(req.requestBody).properties;

    expect(props.title).to.be.undefined;
    expect(props.url).to.be.undefined;
    expect(props.path).to.be.undefined;
    expect(props.referer).to.be.undefined;
  });

  it('gets the "context" from the cookie', () => {
    setConfig();
    cookies.set(
      cookieName,
      Object.assign(getCookie(), {
        context: 'FOO'
      })
    );

    _ch('event', {type: 'viewedPage'});
    const req = requests[0];
    const reqBody = JSON.parse(req.requestBody);

    expect(reqBody.context).to.equal('FOO');
  });

  it('gets the "contextInfo" from the cookie', () => {
    setConfig();
    cookies.set(
      cookieName,
      Object.assign(getCookie(), {
        contextInfo: {foo: 'bar'}
      })
    );

    _ch('event', {type: 'viewedPage'});
    const req = requests[0];
    const reqBody = JSON.parse(req.requestBody);

    expect(reqBody.contextInfo).to.eql({foo: 'bar'});
  });
});
