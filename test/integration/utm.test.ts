/* global describe, it, beforeEach */

import {expect} from 'chai';
import cookies from 'js-cookie';
import sinon from 'sinon';
import {UTMCookie} from '../../src/cookie';

const cookieName = '_ch';
const utmCookieName = '_chutm';

const getCookie = () => cookies.getJSON(cookieName) || {};
const getUtmCookie = () => cookies.getJSON(utmCookieName) || {};

const _ch = window.ch;

let requests: sinon.SinonFakeXMLHttpRequest[];
let xhr: sinon.SinonFakeXMLHttpRequestStatic;

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
    _ch('config', {
      workspaceId: 'workspace_id',
      nodeId: 'node_id',
      token: 'ABC123'
    });
  };

  it('does not store utm_* vars in the main _ch cookie', () => {
    window.location.hash =
      '?utm_source=foo&utm_medium=bar&utm_term=baz&utm_content=foobar&utm_campaign=foobarbaz';

    setConfig();

    expect(getCookie().ga).to.equal(undefined);
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

    const utm: UTMCookie = {
      utm_source: 'foo',
      utm_medium: 'bar',
      utm_term: 'baz',
      utm_content: 'foobar',
      utm_campaign: 'foobarbaz'
    };

    cookies.set(utmCookieName, {...getUtmCookie(), ...utm});

    _ch('event', {type: 'viewedPage'});

    expect(JSON.parse(requests[0].requestBody).tracking).to.eql({ga: utm});
  });
});
