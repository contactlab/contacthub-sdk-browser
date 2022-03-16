/**
 * @jest-environment jsdom
 */

import {left, right} from 'fp-ts/Either';
import {cookie, HubCookie, UTMCookie} from '../src/cookie';
import * as H from './_helpers';
import * as S from './services';

afterEach(() => {
  H.removeCookie(H.CH);
  H.removeCookie(H.UTM);
});

test('cookie.getHub() should return current value of Hub cookie', async () => {
  const HUB_COOKIE: HubCookie = {
    target: 'ENTRY',
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID,
    debug: false,
    context: 'WEB',
    contextInfo: {},
    sid: 'ABCD-1234'
  };

  H.setCookieJSON(H.CH, HUB_COOKIE);

  const result = await cookie({globals: S.GLOBALS_DEFAULTS}).getHub()();

  expect(result).toEqual(right(HUB_COOKIE));
});

test('cookie.getHub() should return current value of Hub cookie - target fallback to `ENTRY`', async () => {
  const HUB_COOKIE: HubCookie = {
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID,
    debug: false,
    context: 'WEB',
    contextInfo: {},
    sid: 'ABCD-1234'
  };

  H.setCookieJSON(H.CH, HUB_COOKIE);

  const result = await cookie({globals: S.GLOBALS_DEFAULTS}).getHub()();

  expect(result).toEqual(right({...HUB_COOKIE, target: 'ENTRY'}));
});

test('cookie.getHub() should return current value of Hub cookie - use configured cookie name', async () => {
  const HUB_COOKIE: HubCookie = {
    target: 'ENTRY',
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID,
    debug: false,
    context: 'WEB',
    contextInfo: {},
    sid: 'ABCD-1234'
  };

  H.setCookieJSON('_cookie', HUB_COOKIE);

  const result = await cookie({globals: S.GLOBALS_CUSTOM}).getHub()();

  expect(result).toEqual(right(HUB_COOKIE));

  H.removeCookie('_cookie');
});

test('cookie.getHub() should return current value of Hub cookie - with fallback', async () => {
  const HUB_COOKIE_FALLBACK: HubCookie = {
    target: 'ENTRY',
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID,
    debug: false,
    context: 'WEB',
    contextInfo: {},
    sid: 'EFGH-5678'
  };

  const result = await cookie({globals: S.GLOBALS_DEFAULTS}).getHub(
    HUB_COOKIE_FALLBACK
  )();

  expect(result).toEqual(right(HUB_COOKIE_FALLBACK));
});

test('cookie.getHub() should return current value of Hub cookie - not found', async () => {
  const result = await cookie({globals: S.GLOBALS_DEFAULTS}).getHub()();

  expect(result).toEqual(left(new Error(`Missing "_ch" cookie`)));
});

test('cookie.getHub() should return current value of Hub cookie - decoding error', async () => {
  H.setCookieJSON(H.CH, {token: H.TOKEN});

  const result = await cookie({globals: S.GLOBALS_DEFAULTS}).getHub()();

  expect(result).toEqual(
    left(new Error(`Missing required ContactHub configuration.`))
  );
});

test('cookie.getHub() should return current value of Hub cookie - parse error', async () => {
  // Parse will fail because of trailing comma
  H.setCookieJSON(
    H.CH,
    '{"token":"ABC123","workspaceId":"workspace_id","nodeId":"node_id","sid":"ABCD-1234",}'
  );

  const result = await cookie({globals: S.GLOBALS_DEFAULTS}).getHub()();

  expect(result).toEqual(left(new Error(`Cookie "_ch" cannot be parsed`)));
});

test('cookie.setHub() should set provided Hub cookie', async () => {
  const HUB_COOKIE: HubCookie = {
    target: 'ENTRY',
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID,
    debug: false,
    context: 'WEB',
    contextInfo: {},
    sid: 'ABCD-1234'
  };

  const result = await cookie({globals: S.GLOBALS_DEFAULTS}).setHub(
    HUB_COOKIE
  )();

  expect(result).toEqual(right(undefined));

  expect(H.getCookieJSON(H.CH)).toEqual(HUB_COOKIE);
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

  const result = await cookie({globals: S.GLOBALS_CUSTOM}).setHub(HUB_COOKIE)();

  expect(result).toEqual(right(undefined));

  expect(H.getCookieJSON('_cookie')).toEqual(HUB_COOKIE);

  H.removeCookie('_cookie');
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

  const result = await cookie({globals: S.GLOBALS_DEFAULTS}).setHub(
    HUB_COOKIE
  )();

  expect(result).toEqual(
    left(
      new Error(`Cookie "_ch" cannot be set: TypeError: Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    --- property 'circular' closes the circle`)
    )
  );

  expect(H.getCookie(H.CH)).toBe(undefined);
});

test('cookie.getUTM() should return current value of UTM cookie', async () => {
  const UTM_COOKIE: UTMCookie = {
    utm_source: 'abcd',
    utm_medium: 'web'
  };

  H.setCookieJSON(H.UTM, UTM_COOKIE);

  const result = await cookie({globals: S.GLOBALS_DEFAULTS}).getUTM()();

  expect(result).toEqual(right(UTM_COOKIE));
});

test('cookie.getUTM() should return current value of UTM cookie - use configured cookie name', async () => {
  const UTM_COOKIE: UTMCookie = {
    utm_source: 'abcd',
    utm_medium: 'web'
  };

  H.setCookieJSON('_utm', UTM_COOKIE);

  const result = await cookie({globals: S.GLOBALS_CUSTOM}).getUTM()();

  expect(result).toEqual(right(UTM_COOKIE));

  H.removeCookie('_utm');
});

test('cookie.getUTM() should return current value of UTM cookie - with fallback', async () => {
  const UTM_COOKIE_FALLBACK: UTMCookie = {
    utm_source: 'efgh',
    utm_medium: 'web'
  };

  const result = await cookie({globals: S.GLOBALS_DEFAULTS}).getUTM(
    UTM_COOKIE_FALLBACK
  )();

  expect(result).toEqual(right(UTM_COOKIE_FALLBACK));
});

test('cookie.getUTM() should return current value of UTM cookie - not found', async () => {
  const result = await cookie({globals: S.GLOBALS_DEFAULTS}).getUTM()();

  expect(result).toEqual(left(new Error(`Missing "_chutm" cookie`)));
});

test('cookie.setUTM() should set provided UTM cookie', async () => {
  const UTM_COOKIE: UTMCookie = {
    utm_source: 'abcd',
    utm_medium: 'web'
  };

  const result = await cookie({globals: S.GLOBALS_DEFAULTS}).setUTM(
    UTM_COOKIE
  )();

  expect(result).toEqual(right(undefined));

  expect(H.getCookieJSON(H.UTM)).toEqual(UTM_COOKIE);
});

test('cookie.setUTM() should set provided UTM cookie - use configured cookie name', async () => {
  const UTM_COOKIE: UTMCookie = {
    utm_source: 'abcd',
    utm_medium: 'web'
  };

  const result = await cookie({globals: S.GLOBALS_CUSTOM}).setUTM(UTM_COOKIE)();

  expect(result).toEqual(right(undefined));

  expect(H.getCookieJSON('_utm')).toEqual(UTM_COOKIE);

  H.removeCookie('_utm');
});

test('cookie.setUTM() should fail if provided UTM cookie cannot be stringified', async () => {
  const UTM_COOKIE: UTMCookie = {
    utm_source: 'abcd',
    utm_medium: 'web'
  };
  (UTM_COOKIE as any).circular = UTM_COOKIE;

  const result = await cookie({globals: S.GLOBALS_DEFAULTS}).setUTM(
    UTM_COOKIE
  )();

  expect(result).toEqual(
    left(
      new Error(`Cookie "_chutm" cannot be set: TypeError: Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    --- property 'circular' closes the circle`)
    )
  );

  expect(H.getCookie(H.UTM)).toBe(undefined);
});
