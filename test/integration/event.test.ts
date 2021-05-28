import {expect} from 'chai';
import cookies from 'js-cookie';
import * as H from './_helpers';

describe('Event API', () => {
  beforeEach(() => {
    cookies.remove(H.CH);

    H._fetchMock.post(`${H.API}/workspaces/${H.WSID}/events`, 200);
  });

  afterEach(() => {
    H.spy.resetHistory();

    H._fetchMock.resetHistory();
  });

  it('checks if required config is set', async () => {
    expect(() => {
      H._ch('event', {type: 'viewedPage'});
    }).not.to.throw();

    await H.whenDone();

    expect(
      H.spy.calledWith(
        '[DEBUG] @contactlab/sdk-browser',
        'Missing "_ch" cookie'
      )
    ).to.equal(true);

    expect(H._fetchMock.called()).to.equal(false);
  });

  it('sends the event to the API', async () => {
    H.setConfig();

    H._ch('event', {type: 'viewedPage'});

    await H.whenDone();

    const headers = H._fetchMock.lastOptions()?.headers;
    const body = JSON.parse(
      H._fetchMock.lastOptions()?.body as unknown as string
    );

    expect(headers?.Authorization).to.equal(`Bearer ${H.TOKEN}`);
    expect(body.type).to.equal('viewedPage');
    expect(body.bringBackProperties).to.eql({
      type: 'SESSION_ID',
      value: cookies.getJSON(H.CH).sid,
      nodeId: H.NID
    });
  });

  it('sends customerId when available in cookie', async () => {
    H.setConfig();

    cookies.set(H.CH, {...cookies.getJSON(H.CH), customerId: H.CID});

    H._ch('event', {type: 'viewedPage'});

    await H.whenDone();

    const body = H._fetchMock.lastOptions()?.body as unknown as string;

    expect(JSON.parse(body).customerId).to.eql(H.CID);
  });

  it('omits bringBackProperties when customerId is available', async () => {
    H.setConfig();

    cookies.set(H.CH, {...cookies.getJSON(H.CH), customerId: H.CID});

    H._ch('event', {type: 'viewedPage'});

    await H.whenDone();

    const body = H._fetchMock.lastOptions()?.body as unknown as string;

    expect(JSON.parse(body).bringBackProperties).to.equal(undefined);
  });

  it('infers common "viewedPage" event properties', async () => {
    document.title = 'Hello world';

    H.setConfig();

    H._ch('event', {type: 'viewedPage'});

    await H.whenDone();

    const body = H._fetchMock.lastOptions()?.body as unknown as string;
    const props = JSON.parse(body).properties;

    expect(props.title).to.eql('Hello world');
    expect(props.url).to.match(/^http:.*context.html$/);
    expect(props.path).to.eql('/context.html');
    expect(props.referer).to.match(/^http:.*?id=.*$/);
  });

  it('allows to override inferred properties', async () => {
    H.setConfig();

    H._ch('event', {type: 'viewedPage', properties: {title: 'Custom title'}});

    await H.whenDone();

    const body = H._fetchMock.lastOptions()?.body as unknown as string;
    const props = JSON.parse(body).properties;

    expect(props.title).to.eql('Custom title');
    expect(props.path).to.eql('/context.html');
  });

  it('does not infer properties on other event types', async () => {
    document.title = 'Hello world';

    H.setConfig();

    H._ch('event', {type: 'something'});

    await H.whenDone();

    const body = H._fetchMock.lastOptions()?.body as unknown as string;
    const props = JSON.parse(body).properties;

    expect(props).to.equal(undefined);
  });

  it('gets the "context" from the cookie', async () => {
    H.setConfig();

    cookies.set(H.CH, {...cookies.getJSON(H.CH), context: 'FOO'});

    H._ch('event', {type: 'viewedPage'});

    await H.whenDone();

    const body = H._fetchMock.lastOptions()?.body as unknown as string;

    expect(JSON.parse(body).context).to.equal('FOO');
  });

  it('gets the "contextInfo" from the cookie', async () => {
    H.setConfig();

    cookies.set(H.CH, {...cookies.getJSON(H.CH), contextInfo: {foo: 'bar'}});

    H._ch('event', {type: 'viewedPage'});

    await H.whenDone();

    const body = H._fetchMock.lastOptions()?.body as unknown as string;

    expect(JSON.parse(body).contextInfo).to.eql({foo: 'bar'});
  });

  // --- Rejects
  it('should log error when event type is not defined (no throws)', async () => {
    H.setConfig();

    expect(() => {
      H._ch('event', {} as any);
    }).not.to.throw();

    await H.whenDone();

    expect(
      H.spy.calledWith(
        '[DEBUG] @contactlab/sdk-browser',
        'Missing required event type'
      )
    ).to.equal(true);
  });

  it('should log api call rejections', async () => {
    H._fetchMock.post(`${H.API}/workspaces/${H.WSID}/events`, {
      status: 500,
      body: 'KO'
    });

    H.setConfig();

    H._ch('event', {type: 'viewedPage'});

    await H.whenDone();

    expect(
      H.spy.calledWith(
        '[DEBUG] @contactlab/sdk-browser',
        'Request responded with status code 500'
      )
    ).to.equal(true);
  });
});
