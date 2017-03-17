import { expect } from 'chai';
import cookies from 'js-cookie';
import sinon from 'sinon';

/* global describe, it, beforeEach */

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

describe('Google Analytics automatic handling', () => {
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

  it('stores utm_* vars in the ch cookie', () => {
    // FIXME: find a good way to mock window.location.search
  });

  it('sends utm_* vars in the event payload', () => {
    setConfig();

    const ga = {
      utm_source: 'foo',
      utm_medium: 'bar',
      utm_term: 'baz',
      utm_content: 'foobar',
      utm_campaign: 'foobarbaz'
    };
    cookies.set(cookieName, Object.assign(getCookie(), { ga }));
    _ch('event', { type: 'viewedPage' });
    const req = requests[0];
    expect(JSON.parse(req.requestBody).tracking).to.eql({ ga });
  });
});
