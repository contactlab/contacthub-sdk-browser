/**
 * @jest-environment jsdom
 */

import * as TE from 'fp-ts/TaskEither';
import {main, SDK} from '../src/main';
import {program} from '../src/program';
import * as H from './_helpers';
import * as S from './services';

declare global {
  interface Window {
    ch: SDK;
  }
}

beforeEach(() => {
  (window as any).ch = (...args: any[]) =>
    (window.ch.q = window.ch.q || []).push(args);
});

afterEach(() => {
  delete (window as any).ch;
});

test('main() should execute `config` command', async () => {
  main({
    globals: S.GLOBALS_DEFAULTS,
    cookie: S.COOKIE({}),
    document: S.DOC({}),
    http: _HTTP,
    location: S.LOCATION(),
    program: program(),
    uuid: S.UUID
  });

  window.ch('config', {
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID
  });

  await H.wait();

  expect(S.SET_HUB_COOKIE).toBeCalledWith(S.HUB_COOKIE(), {expires: 365});
  expect(S.SET_UTM_COOKIE).toBeCalledWith(
    {utm_source: 'abcd', utm_medium: 'web'},
    {expires: 1 / 48}
  );
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).not.toBeCalled();
});

test('main() should execute `event` command', async () => {
  main({
    globals: S.GLOBALS_DEFAULTS,
    cookie: S.COOKIE({
      utm: TE.left(new Error())
    }),
    document: S.DOC({}),
    http: _HTTP,
    location: S.LOCATION(),
    program: program(),
    uuid: S.UUID
  });

  window.ch('event', {
    type: 'completedOrder',
    properties: {orderId: '1234'}
  });

  await H.wait();

  expect(_HTTP.post).toBeCalledWith(
    `/workspaces/${H.WSID}/events`,
    {
      type: 'completedOrder',
      context: 'WEB',
      contextInfo: {},
      properties: {orderId: '1234'},
      tracking: undefined,
      customerId: undefined,
      bringBackProperties: {
        type: 'SESSION_ID',
        value: S.HUB_COOKIE().sid,
        nodeId: H.NID
      }
    },
    H.TOKEN
  );
});

test('main() should execute `customer` command', async () => {
  main({
    globals: S.GLOBALS_DEFAULTS,
    cookie: S.COOKIE({}),
    document: S.DOC({}),
    http: _HTTP,
    location: S.LOCATION(),
    program: program(),
    uuid: S.UUID
  });

  window.ch('customer', {id: H.CID});

  await H.wait();

  expect(_HTTP.post).toBeCalledTimes(1); // <-- `shouldUpdate` is false because;
  expect(_HTTP.post).toBeCalledWith(
    `/workspaces/${H.WSID}/customers/${H.CID}/sessions`,
    {value: S.HUB_COOKIE().sid},
    H.TOKEN
  );
  expect(_HTTP.patch).not.toBeCalled();
  expect(S.SET_HUB_COOKIE).toBeCalledWith(
    {
      ...S.HUB_COOKIE_CID(),
      hash: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a'
    },
    undefined
  );
});

test('main() should execute command using configured Hub object name', async () => {
  (window as any).chub = (...args: any[]) =>
    ((window as any).chub.q = (window as any).chub.q || []).push(args);

  main({
    globals: S.GLOBALS_CUSTOM,
    cookie: S.COOKIE({}),
    document: S.DOC({}),
    http: _HTTP,
    location: S.LOCATION(),
    program: program(),
    uuid: S.UUID
  });

  (window as any).chub('config', {
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID
  });

  await H.wait();

  expect(S.SET_HUB_COOKIE).toBeCalledWith(S.HUB_COOKIE(), {expires: 365});
  expect(S.SET_UTM_COOKIE).toBeCalledWith(
    {utm_source: 'abcd', utm_medium: 'web'},
    {expires: 1 / 48}
  );
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).not.toBeCalled();

  delete (window as any).chub;
});

test('main() should process operations queue', async () => {
  window.ch('config', {
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID
  });

  main({
    globals: S.GLOBALS_DEFAULTS,
    cookie: S.COOKIE({}),
    document: S.DOC({}),
    http: _HTTP,
    location: S.LOCATION(),
    program: program(),
    uuid: S.UUID
  });

  await H.wait();

  expect(S.SET_HUB_COOKIE).toBeCalledWith(S.HUB_COOKIE(), {expires: 365});
  expect(S.SET_UTM_COOKIE).toBeCalledWith(
    {utm_source: 'abcd', utm_medium: 'web'},
    {expires: 1 / 48}
  );
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).not.toBeCalled();
});

// --- Helpers
const _HTTP = S.HTTP({});
