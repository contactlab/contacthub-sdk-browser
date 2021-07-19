import {expect} from 'chai';
import Cookies from 'js-cookie';
import * as H from './_helpers';

describe('Config API', () => {
  beforeEach(async () => {
    Cookies.remove(H.CH);
  });

  afterEach(() => {
    H.spy.resetHistory();
  });

  it('should set a cookie', async () => {
    await H.setConfig();

    const uuidV4 =
      /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

    expect(typeof Cookies.get(H.CH)).not.to.equal(undefined);
    expect(uuidV4.test(Cookies.getJSON(H.CH).sid)).to.equal(true);
  });

  it('should not regenerate sessionId if already present', async () => {
    await H.setConfig();

    const sid = Cookies.getJSON(H.CH).sid;

    H._ch('config', H.CONFIG);

    await H.whenDone();

    expect(Cookies.getJSON(H.CH).sid).to.equal(sid);
  });

  it('should store all config data in the cookie and uses defaults', async () => {
    await H.setConfig();

    const c = Cookies.getJSON(H.CH);

    expect(c.workspaceId).to.equal(H.WSID);
    expect(c.nodeId).to.equal(H.NID);
    expect(c.token).to.equal(H.TOKEN);
    // --- defaults
    expect(c.context).to.equal('WEB');
    expect(c.contextInfo).to.eql({});
    expect(c.debug).to.equal(false);
  });

  it('should allow to specify optional fields', async () => {
    H._ch('config', {
      ...H.CONFIG,
      context: 'foo',
      contextInfo: {foo: 'bar'},
      debug: true
    });

    await H.whenDone();

    const c = Cookies.getJSON(H.CH);

    expect(c.context).to.equal('foo');
    expect(c.contextInfo).to.eql({foo: 'bar'});
    expect(c.debug).to.equal(true);
  });

  it('should remove user data from cookie if the token changes', async () => {
    Cookies.set(H.CH, {
      ...Cookies.getJSON(H.CH),
      customerId: H.CID,
      token: H.TOKEN
    });

    H._ch('config', {workspaceId: H.WSID, nodeId: H.NID, token: 'CDE456'});

    await H.whenDone();

    const c = Cookies.getJSON(H.CH);

    expect(c.token).to.equal('CDE456');
    expect(c.customerId).to.equal(undefined);
    expect(c.hash).to.equal(undefined);
  });

  it('should log error if required option are not specified (no throw)', async () => {
    expect(() => {
      H._ch('config', {} as any);
    }).not.to.throw();

    await H.whenDone();

    expect(
      H.spy.calledWith(
        '[DEBUG] @contactlab/sdk-browser',
        'Invalid ContactHub configuration'
      )
    ).to.equal(true);
  });
});
