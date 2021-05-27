/* global describe, it, beforeEach, afterEach */

import {expect} from 'chai';
import cookies from 'js-cookie';
import sinon from 'sinon';
import * as H from './_helpers';

const setConfig = (): void => H._ch('config', H.CONFIG);

let requests: sinon.SinonFakeXMLHttpRequest[];
const spy = sinon.stub(console, 'error').callsFake(() => undefined);

describe('Event API', () => {
  beforeEach(() => {
    cookies.remove(H.CH);
  });

  afterEach(() => {
    spy.resetHistory();

    H._fetchMock.resetHistory();
  });

  it('checks if required config is set', done => {
    expect(() => {
      H._ch('event', {type: 'viewedPage'});
    }).not.to.throw();

    H.whenDone(() => {
      expect(
        spy.calledWith(
          '[DEBUG] @contactlab/sdk-browser',
          'Missing "_ch" cookie'
        )
      ).to.equal(true);

      expect(H._fetchMock.called()).to.equal(false);
    }, done);
  });

  it('sends the event to the API', done => {
    H._fetchMock.post(`${H.API}/workspaces/${H.WSID}/events`, 200);

    setConfig();

    H._ch('event', {type: 'viewedPage'});

    H.whenDone(() => {
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
    }, done);
  });

  it('sends customerId when available in cookie', done => {
    H._fetchMock.post(`${H.API}/workspaces/${H.WSID}/events`, 200);

    setConfig();

    cookies.set(H.CH, {...cookies.getJSON(H.CH), customerId: H.CID});

    H._ch('event', {type: 'viewedPage'});

    H.whenDone(() => {
      const body = H._fetchMock.lastOptions()?.body as unknown as string;

      expect(JSON.parse(body).customerId).to.eql(H.CID);
    }, done);
  });

  it.only('omits bringBackProperties when customerId is available', done => {
    H._fetchMock.post(`${H.API}/workspaces/${H.WSID}/events`, 200);

    setConfig();

    cookies.set(H.CH, {...cookies.getJSON(H.CH), customerId: H.CID});

    H._ch('event', {type: 'viewedPage'});

    H.whenDone(() => {
      const body = H._fetchMock.lastOptions()?.body as unknown as string;

      expect(JSON.parse(body).bringBackProperties).to.equal(undefined);
    }, done);
  });

  it('infers common "viewedPage" event properties', () => {
    document.title = 'Hello world';

    setConfig();

    H._ch('event', {type: 'viewedPage'});

    const req = requests[0];
    const props = JSON.parse(req.requestBody).properties;

    expect(props.title).to.eql('Hello world');
    expect(props.url).to.match(/^http:.*context.html$/);
    expect(props.path).to.eql('/context.html');
    expect(props.referer).to.match(/^http:.*?id=.*$/);
  });

  it('allows to override inferred properties', () => {
    setConfig();

    H._ch('event', {type: 'viewedPage', properties: {title: 'Custom title'}});

    const req = requests[0];
    const props = JSON.parse(req.requestBody).properties;

    expect(props.title).to.eql('Custom title');
    expect(props.path).to.eql('/context.html');
  });

  it('does not infer properties on other event types', () => {
    document.title = 'Hello world';

    setConfig();

    H._ch('event', {type: 'something'});

    const req = requests[0];
    const props = JSON.parse(req.requestBody).properties;

    expect(props.title).to.equal(undefined);
    expect(props.url).to.equal(undefined);
    expect(props.path).to.equal(undefined);
    expect(props.referer).to.equal(undefined);
  });

  it('gets the "context" from the cookie', () => {
    setConfig();

    cookies.set(H.CH, {...cookies.getJSON(H.CH), context: 'FOO'});

    H._ch('event', {type: 'viewedPage'});

    const req = requests[0];
    const reqBody = JSON.parse(req.requestBody);

    expect(reqBody.context).to.equal('FOO');
  });

  it('gets the "contextInfo" from the cookie', () => {
    setConfig();

    cookies.set(H.CH, {...cookies.getJSON(H.CH), contextInfo: {foo: 'bar'}});

    H._ch('event', {type: 'viewedPage'});

    const req = requests[0];
    const reqBody = JSON.parse(req.requestBody);

    expect(reqBody.contextInfo).to.eql({foo: 'bar'});
  });

  // --- Rejects
  it('should throw and log error when event type is not defined', () => {
    setConfig();

    expect(() => {
      H._ch('event', {} as any);
    }).to.throw(Error);

    expect(
      spy.calledWith(
        '[DEBUG] @contactlab/sdk-browser',
        'Missing required event type'
      )
    ).to.equal(true);

    spy.restore();
  });

  it('should log api call rejections', done => {
    setConfig();

    H._ch('event', {type: 'viewedPage'});

    requests[0].respond(500, {}, 'KO');

    H.whenDone(() => {
      expect(spy.calledWith('[DEBUG] @contactlab/sdk-browser', 'KO')).to.equal(
        true
      );

      spy.restore();
    }, done);
  });
});
