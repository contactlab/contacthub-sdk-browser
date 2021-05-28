import {expect} from 'chai';
import cookies from 'js-cookie';
import * as H from './_helpers';

describe('Config API', () => {
  beforeEach(() => {
    cookies.remove(H.CH);

    H._ch('config', H.CONFIG);
  });

  afterEach(() => {
    H.spy.resetHistory();
  });

  it('sets a cookie', () => {
    expect(typeof cookies.get(H.CH)).not.to.equal(undefined);
  });

  it('generates a UUIDv4 sessionId', () => {
    const uuidV4 =
      /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

    expect(uuidV4.test(cookies.getJSON(H.CH).sid)).to.equal(true);
  });

  it('does not regenerate sessionId if already present', () => {
    const sid = cookies.getJSON(H.CH).sid;

    H._ch('config', H.CONFIG);

    expect(cookies.getJSON(H.CH).sid).to.equal(sid);
  });

  it('stores all config data in the cookie', () => {
    const c = cookies.getJSON(H.CH);

    expect(c.workspaceId).to.equal(H.WSID);
    expect(c.nodeId).to.equal(H.NID);
    expect(c.token).to.equal(H.TOKEN);
  });

  it('uses "WEB" if context not provided', () => {
    expect(cookies.getJSON(H.CH).context).to.equal('WEB');
  });

  it('sets `{}` if contextInfo not provided', () => {
    expect(cookies.getJSON(H.CH).contextInfo).to.eql({});
  });

  it('sets `false` if debug not provided', () => {
    expect(cookies.getJSON(H.CH).debug).to.equal(false);
  });

  it('allows to specify optional context', () => {
    H._ch('config', {...H.CONFIG, context: 'foo'});

    expect(cookies.getJSON(H.CH).context).to.equal('foo');
  });

  it('allows to specify optional contextInfo', () => {
    H._ch('config', {...H.CONFIG, context: 'foo', contextInfo: {foo: 'bar'}});

    expect(cookies.getJSON(H.CH).contextInfo).to.eql({foo: 'bar'});
  });

  it('allows to specify optional debug', () => {
    H._ch('config', {
      ...H.CONFIG,
      context: 'foo',
      contextInfo: {foo: 'bar'},
      debug: true
    });

    expect(cookies.getJSON(H.CH).debug).to.equal(true);
  });

  it('removes user data from cookie if the token changes', () => {
    cookies.set(H.CH, {
      ...cookies.getJSON(H.CH),
      customerId: H.CID,
      token: H.TOKEN
    });

    H._ch('config', {workspaceId: H.WSID, nodeId: H.NID, token: 'CDE456'});

    expect(cookies.getJSON(H.CH).token).to.equal('CDE456');
    expect(cookies.getJSON(H.CH).customerId).to.equal(undefined);
    expect(cookies.getJSON(H.CH).hash).to.equal(undefined);
  });

  it('should log error if required option are not specified (no throw)', () => {
    expect(() => {
      H._ch('config', {} as any);
    }).not.to.throw();

    expect(
      H.spy.calledWith(
        '[DEBUG] @contactlab/sdk-browser',
        'Invalid ContactHub configuration'
      )
    ).to.equal(true);
  });
});
