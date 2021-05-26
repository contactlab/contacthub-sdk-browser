import {expect} from 'chai';
import Cookies from 'js-cookie';
import {UTMCookie} from '../../src/cookie';
import {_ch, _fetchMock, whenDone} from './_helpers';

const CH = '_ch';
const UTM = '_chutm';

describe('UTM automatic handling', () => {
  beforeEach(() => {
    Cookies.remove(CH);
  });

  afterEach(() => {
    _fetchMock.resetHistory();
  });

  it('does not store utm_* vars in the main _ch cookie', () => {
    window.location.hash =
      '?utm_source=foo&utm_medium=bar&utm_term=baz&utm_content=foobar&utm_campaign=foobarbaz';

    setConfig();

    expect(Cookies.getJSON(CH).ga).to.equal(undefined);
  });

  it('stores utm_* vars in a separate _chutm cookie', () => {
    window.location.hash =
      '?utm_source=foo&utm_medium=bar&utm_term=baz&utm_content=foobar&utm_campaign=foobarbaz';

    setConfig();

    expect(Cookies.getJSON(UTM)).to.eql({
      utm_source: 'foo',
      utm_medium: 'bar',
      utm_term: 'baz',
      utm_content: 'foobar',
      utm_campaign: 'foobarbaz'
    });
  });

  it('sends utm_* vars in the event payload', done => {
    _fetchMock.post(
      'https://api.contactlab.it/hub/v1/workspaces/workspace_id/events',
      ''
    );

    setConfig();

    const utm: UTMCookie = {
      utm_source: 'foo',
      utm_medium: 'bar',
      utm_term: 'baz',
      utm_content: 'foobar',
      utm_campaign: 'foobarbaz'
    };

    Cookies.set(UTM, {...Cookies.getJSON(UTM), ...utm});

    _ch('event', {type: 'viewedPage'});

    whenDone(() => {
      const body = _fetchMock.lastOptions()?.body as unknown as string;

      expect(JSON.parse(body).tracking).to.eql({ga: utm});
      done();
    });
  });

  // --- Helpers
  const setConfig = () => {
    _ch('config', {
      workspaceId: 'workspace_id',
      nodeId: 'node_id',
      token: 'ABC123'
    });
  };
});
