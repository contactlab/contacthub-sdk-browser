import {expect} from 'chai';
import cookies from 'js-cookie';
import sinon from 'sinon';

/* global describe, it, beforeEach */

const cookieName = '_ch';
const utmCookieName = '_chutm';
const varName = 'ch';
const config = {
  workspaceId: 'workspace_id',
  nodeId: 'node_id',
  token: 'ABC123'
};

const getCookie = () => cookies.getJSON(cookieName) || {};
const getUtmCookie = () => cookies.getJSON(utmCookieName) || {};

const _ch = window[varName];

let requests;
let xhr;

describe('UTM automatic handling', () => {
  beforeEach(() => {
    cookies.remove(cookieName);
    requests = [];
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = r => {
      requests.push(r);
    };
  });

  const setConfig = () => {
    _ch('config', config);
  };

  it('does not store utm_* vars in the main _ch cookie', () => {
    window.location.hash =
      '?utm_source=foo&utm_medium=bar&utm_term=baz&utm_content=foobar&utm_campaign=foobarbaz';

    setConfig();

    // eslint-disable-next-line no-unused-expressions
    expect(getCookie().ga).to.be.undefined;
  });

  it('stores utm_* vars in a separate _chutm cookie', () => {
    window.location.hash =
      '?utm_source=foo&utm_medium=bar&utm_term=baz&utm_content=foobar&utm_campaign=foobarbaz';

    setConfig();

    expect(getUtmCookie()).to.eql({
      utm_source: 'foo',
      utm_medium: 'bar',
      utm_term: 'baz',
      utm_content: 'foobar',
      utm_campaign: 'foobarbaz'
    });
  });

  it('sends utm_* vars in the event payload', () => {
    setConfig();

    const utm = {
      utm_source: 'foo',
      utm_medium: 'bar',
      utm_term: 'baz',
      utm_content: 'foobar',
      utm_campaign: 'foobarbaz'
    };
    cookies.set(utmCookieName, Object.assign(getUtmCookie(), utm));
    _ch('event', {type: 'viewedPage'});
    const req = requests[0];
    expect(JSON.parse(req.requestBody).tracking).to.eql({ga: utm});
  });
});
