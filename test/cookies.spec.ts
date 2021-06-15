/**
 * @jest-environment jsdom
 */

import {left, right} from 'fp-ts/Either';
import Cookies from 'js-cookie';
import {cookie, HubCookie, UTMCookie} from '../src/cookie';
import * as H from './_helpers';

afterEach(() => {
  jest.clearAllMocks();

  Cookies.remove(H.CH);
  Cookies.remove(H.UTM);

  (window as any).ContactHubCookie = undefined;
  (window as any).ContactHubUtmCookie = undefined;
});

test('cookie.getHub() should return current value of Hub cookie', async () => {
  const HUB_COOKIE: HubCookie = {
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID,
    debug: false,
    context: 'WEB',
    contextInfo: {},
    sid: 'ABCD-1234'
  };

  Cookies.set(H.CH, HUB_COOKIE);

  const result = await cookie().getHub()();

  expect(result).toEqual(right(HUB_COOKIE));
});

test('cookie.getHub() should return current value of Hub cookie - use configured cookie name', async () => {
  (window as any).ContactHubCookie = '_foo';

  const HUB_COOKIE: HubCookie = {
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID,
    debug: false,
    context: 'WEB',
    contextInfo: {},
    sid: 'ABCD-1234'
  };

  Cookies.set('_foo', HUB_COOKIE);

  const result = await cookie().getHub()();

  expect(result).toEqual(right(HUB_COOKIE));

  Cookies.remove('_foo');
});

test('cookie.getHub() should return current value of Hub cookie - with fallback', async () => {
  const HUB_COOKIE_FALLBACK: HubCookie = {
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID,
    debug: false,
    context: 'WEB',
    contextInfo: {},
    sid: 'EFGH-5678'
  };

  const result = await cookie().getHub(HUB_COOKIE_FALLBACK)();

  expect(result).toEqual(right(HUB_COOKIE_FALLBACK));
});

test('cookie.getHub() should return current value of Hub cookie - not found', async () => {
  const result = await cookie().getHub()();

  expect(result).toEqual(left(new Error(`Missing "_ch" cookie`)));
});

test('cookie.getHub() should return current value of Hub cookie - decoding error', async () => {
  Cookies.set(H.CH, {token: H.TOKEN});

  const result = await cookie().getHub()();

  expect(result).toEqual(
    left(new Error(`Missing required ContactHub configuration.`))
  );
});

test('cookie.getHub() should return current value of Hub cookie - parse error', async () => {
  // Parse will fail because of trailing comma
  Cookies.set(
    H.CH,
    '{"token":"ABC123","workspaceId":"workspace_id","nodeId":"node_id","sid":"ABCD-1234",}'
  );

  const result = await cookie().getHub()();

  expect(result).toEqual(left(new Error(`Cookie "_ch" cannot be parsed`)));
});

test('cookie.setHub() should set provided Hub cookie', async () => {
  const HUB_COOKIE: HubCookie = {
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID,
    debug: false,
    context: 'WEB',
    contextInfo: {},
    sid: 'ABCD-1234'
  };

  const result = await cookie().setHub(HUB_COOKIE)();

  expect(result).toEqual(right(undefined));

  expect(Cookies.getJSON(H.CH)).toEqual(HUB_COOKIE);
});

test('cookie.setHub() should set provided Hub cookie - use configured cookie name', async () => {
  (window as any).ContactHubCookie = '_foo';

  const HUB_COOKIE: HubCookie = {
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID,
    debug: false,
    context: 'WEB',
    contextInfo: {},
    sid: 'ABCD-1234'
  };

  const result = await cookie().setHub(HUB_COOKIE)();

  expect(result).toEqual(right(undefined));

  expect(Cookies.getJSON('_foo')).toEqual(HUB_COOKIE);

  Cookies.remove('_foo');
});

test('cookie.setHub() should fail if provided Hub cookie cannot be stringified', async () => {
  const HUB_COOKIE: HubCookie = {
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID,
    debug: false,
    context: 'WEB',
    contextInfo: {},
    sid: 'ABCD-1234'
  };
  (HUB_COOKIE as any).circular = HUB_COOKIE;

  const result = await cookie().setHub(HUB_COOKIE)();

  expect(result).toEqual(
    left(
      new Error(`Cookie "_ch" cannot be set: TypeError: Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    --- property 'circular' closes the circle`)
    )
  );

  expect(Cookies.get(H.CH)).toBe(undefined);
});

test('cookie.getUTM() should return current value of UTM cookie', async () => {
  const UTM_COOKIE: UTMCookie = {
    utm_source: 'abcd',
    utm_medium: 'web'
  };

  Cookies.set(H.UTM, UTM_COOKIE);

  const result = await cookie().getUTM()();

  expect(result).toEqual(right(UTM_COOKIE));
});

test('cookie.getUTM() should return current value of UTM cookie - use configured cookie name', async () => {
  (window as any).ContactHubUtmCookie = '_foo';

  const UTM_COOKIE: UTMCookie = {
    utm_source: 'abcd',
    utm_medium: 'web'
  };

  Cookies.set('_foo', UTM_COOKIE);

  const result = await cookie().getUTM()();

  expect(result).toEqual(right(UTM_COOKIE));

  Cookies.remove('_foo');
});

test('cookie.getUTM() should return current value of UTM cookie - with fallback', async () => {
  const UTM_COOKIE_FALLBACK: UTMCookie = {
    utm_source: 'efgh',
    utm_medium: 'web'
  };

  const result = await cookie().getUTM(UTM_COOKIE_FALLBACK)();

  expect(result).toEqual(right(UTM_COOKIE_FALLBACK));
});

test('cookie.getUTM() should return current value of Hub cookie - not found', async () => {
  const result = await cookie().getUTM()();

  expect(result).toEqual(left(new Error(`Missing "_chutm" cookie`)));
});

test('cookie.setUTM() should set provided UTM cookie', async () => {
  const UTM_COOKIE: UTMCookie = {
    utm_source: 'abcd',
    utm_medium: 'web'
  };

  const result = await cookie().setUTM(UTM_COOKIE)();

  expect(result).toEqual(right(undefined));

  expect(Cookies.getJSON(H.UTM)).toEqual(UTM_COOKIE);
});

test('cookie.setUTM() should set provided UTM cookie - use configured cookie name', async () => {
  (window as any).ContactHubUtmCookie = '_foo';

  const UTM_COOKIE: UTMCookie = {
    utm_source: 'abcd',
    utm_medium: 'web'
  };

  const result = await cookie().setUTM(UTM_COOKIE)();

  expect(result).toEqual(right(undefined));

  expect(Cookies.getJSON('_foo')).toEqual(UTM_COOKIE);

  Cookies.remove('_foo');
});

test('cookie.setUTM() should fail if provided UTM cookie cannot be stringified', async () => {
  const UTM_COOKIE: UTMCookie = {
    utm_source: 'abcd',
    utm_medium: 'web'
  };
  (UTM_COOKIE as any).circular = UTM_COOKIE;

  const result = await cookie().setUTM(UTM_COOKIE)();

  expect(result).toEqual(
    left(
      new Error(`Cookie "_chutm" cannot be set: TypeError: Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    --- property 'circular' closes the circle`)
    )
  );

  expect(Cookies.get(H.UTM)).toBe(undefined);
});
