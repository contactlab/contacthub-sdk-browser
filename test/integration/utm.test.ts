import {expect} from 'chai';
import Cookies from 'js-cookie';
import {UTMCookie} from '../../src/cookie';
import * as H from './_helpers';

describe('UTM automatic handling', () => {
  beforeEach(() => {
    Cookies.remove(H.CH);
  });

  afterEach(() => {
    H._fetchMock.resetHistory();
  });

  it('does not store utm_* vars in the main _ch cookie', () => {
    window.location.hash =
      '?utm_source=foo&utm_medium=bar&utm_term=baz&utm_content=foobar&utm_campaign=foobarbaz';

    H.setConfig();

    expect(Cookies.getJSON(H.CH).ga).to.equal(undefined);
  });

  it('stores utm_* vars in a separate _chutm cookie', () => {
    window.location.hash =
      '?utm_source=foo&utm_medium=bar&utm_term=baz&utm_content=foobar&utm_campaign=foobarbaz';

    H.setConfig();

    expect(Cookies.getJSON(H.UTM)).to.eql({
      utm_source: 'foo',
      utm_medium: 'bar',
      utm_term: 'baz',
      utm_content: 'foobar',
      utm_campaign: 'foobarbaz'
    });
  });

  it('sends utm_* vars in the event payload', async () => {
    H._fetchMock.post(`${H.API}/workspaces/${H.WSID}/events`, 200);

    H.setConfig();

    const utm: UTMCookie = {
      utm_source: 'foo',
      utm_medium: 'bar',
      utm_term: 'baz',
      utm_content: 'foobar',
      utm_campaign: 'foobarbaz'
    };

    Cookies.set(H.UTM, {...Cookies.getJSON(H.UTM), ...utm});

    H._ch('event', {type: 'viewedPage'});

    await H.whenDone();

    const body = H._fetchMock.lastOptions()?.body as unknown as string;

    expect(JSON.parse(body).tracking).to.eql({ga: utm});
  });
});
