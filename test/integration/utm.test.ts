import {expect} from 'chai';
import {UTMCookie} from '../../src/cookie';
import * as C from '../_helpers';
import * as H from './_helpers';

describe('UTM automatic handling', () => {
  beforeEach(() => {
    C.removeCookie(H.CH);
  });

  afterEach(() => {
    H._fetchMock.resetHistory();
  });

  it('should not store utm_* vars in the main _ch cookie', async () => {
    window.location.hash =
      '?utm_source=foo&utm_medium=bar&utm_term=baz&utm_content=foobar&utm_campaign=foobarbaz';

    await H.setConfig();

    expect(C.getCookieJSON(H.CH).ga).to.equal(undefined);
  });

  it('should store utm_* vars in a separate _chutm cookie', async () => {
    window.location.hash =
      '?utm_source=foo&utm_medium=bar&utm_term=baz&utm_content=foobar&utm_campaign=foobarbaz';

    await H.setConfig();

    expect(C.getCookieJSON(H.UTM)).to.eql({
      utm_source: 'foo',
      utm_medium: 'bar',
      utm_term: 'baz',
      utm_content: 'foobar',
      utm_campaign: 'foobarbaz'
    });
  });

  it('should send utm_* vars in the event payload', async () => {
    H._fetchMock.post(`${H.API}/workspaces/${H.WSID}/events`, 200);

    await H.setConfig();

    const utm: UTMCookie = {
      utm_source: 'foo',
      utm_medium: 'bar',
      utm_term: 'baz',
      utm_content: 'foobar',
      utm_campaign: 'foobarbaz'
    };

    C.setCookieJSON(H.UTM, {...C.getCookieJSON(H.UTM), ...utm});

    H._ch('event', {type: 'viewedPage'});

    await H.whenDone();

    const body = H._fetchMock.lastOptions()?.body as unknown as string;

    expect(JSON.parse(body).tracking).to.eql({ga: utm});
  });
});
