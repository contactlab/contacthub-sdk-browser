import {left, right} from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import {config, ConfigOptions} from '../src/config';
import * as H from './_helpers';
import * as S from './services';

afterEach(() => {
  jest.clearAllMocks();
});

test('config() should set SDK configuration - with defaults', async () => {
  const _HTTP = S.HTTP({});

  const c = config({
    location: S.LOCATION(),
    cookie: S.COOKIE({hub: TE.left(new Error()), utm: TE.left(new Error())}),
    http: _HTTP,
    uuid: S.UUID
  });

  const OPTIONS: ConfigOptions = {
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID
  };

  const result = await c(OPTIONS)();

  expect(result).toEqual(right(undefined));
  expect(S.SET_HUB_COOKIE).toBeCalledWith(
    {
      ...OPTIONS,
      sid: S.UUID_STR,
      debug: false,
      context: 'WEB',
      contextInfo: {}
    },
    {expires: 365}
  );
  expect(S.SET_UTM_COOKIE).toBeCalledWith({}, {expires: 1 / 48});
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).not.toBeCalled();
});

test('config() should set SDK configuration - with cookies values', async () => {
  const _HTTP = S.HTTP({});

  const c = config({
    location: S.LOCATION(),
    cookie: S.COOKIE({
      hub: TE.right({
        token: 'DEF456',
        workspaceId: H.WSID,
        nodeId: H.NID,
        sid: S.UUID_STR,
        context: 'OTHER',
        contextInfo: {},
        debug: false
      }),
      utm: TE.right({utm_source: 'abc', utm_medium: 'web'})
    }),
    http: _HTTP,
    uuid: S.UUID
  });

  const OPTIONS: ConfigOptions = {
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID,
    context: 'AAA',
    contextInfo: {foo: 'bar'},
    debug: true
  };

  const result = await c(OPTIONS)();

  expect(result).toEqual(right(undefined));
  expect(S.SET_HUB_COOKIE).toBeCalledWith(
    {
      ...OPTIONS,
      sid: S.UUID_STR,
      context: 'AAA',
      contextInfo: {foo: 'bar'},
      debug: true
    },
    {expires: 365}
  );
  expect(S.SET_UTM_COOKIE).toBeCalledWith(
    {utm_source: 'abc', utm_medium: 'web'},
    {expires: 1 / 48}
  );
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).not.toBeCalled();
});

test('config() should fail if provided options are not valid', async () => {
  const _HTTP = S.HTTP({});

  const c = config({
    location: S.LOCATION(),
    cookie: S.COOKIE({hub: TE.left(new Error()), utm: TE.left(new Error())}),
    http: _HTTP,
    uuid: S.UUID
  });

  const result = await c({} as ConfigOptions)();

  expect(result).toEqual(left(new Error('Invalid ContactHub configuration')));
  expect(S.SET_HUB_COOKIE).not.toBeCalled();
  expect(S.SET_UTM_COOKIE).not.toBeCalled();
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).not.toBeCalled();
});

test('config() should use utm_* query params to set UTM cookie', async () => {
  const _HTTP = S.HTTP({});

  const c = config({
    location: S.LOCATION(
      'http://test.com?utm_source=def&utm_campaign=foo&utm_term=bar'
    ),
    cookie: S.COOKIE({
      hub: TE.left(new Error()),
      utm: TE.right({utm_source: 'abc', utm_medium: 'web'})
    }),
    http: _HTTP,
    uuid: S.UUID
  });

  const result = await c({
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID
  })();

  expect(result).toEqual(right(undefined));
  expect(S.SET_UTM_COOKIE).toBeCalledWith(
    {
      utm_source: 'def',
      utm_medium: undefined,
      utm_term: 'bar',
      utm_content: undefined,
      utm_campaign: 'foo'
    },
    {expires: 1 / 48}
  );
});

test('config() should fail is service fails', async () => {
  const _HTTP = S.HTTP({});

  const c = config({
    location: S.LOCATION(),
    cookie: S.COOKIE_SET_KO({
      hub: TE.left(new Error()),
      utm: TE.left(new Error())
    }),
    http: _HTTP,
    uuid: S.UUID
  });

  const result = await c({
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID
  })();

  expect(result).toEqual(left(new Error('Cookie "_ch" cannot be set')));
  expect(S.SET_UTM_COOKIE).not.toBeCalled();
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).not.toBeCalled();
});

test('config() should set customer if there is a clabId param in query string', async () => {
  const _HTTP = S.HTTP({});

  const c = config({
    location: S.LOCATION('http://test.com?clabId=abcdef123456'),
    cookie: S.COOKIE({
      hub: TE.right({
        token: H.TOKEN,
        workspaceId: H.WSID,
        nodeId: H.NID,
        sid: S.UUID_STR,
        context: 'WEB',
        contextInfo: {},
        debug: false
      }),
      utm: TE.left(new Error())
    }),
    http: _HTTP,
    uuid: S.UUID
  });

  const OPTIONS: ConfigOptions = {
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID
  };

  const result = await c(OPTIONS)();
  expect(result).toEqual(right(undefined));
  expect(S.SET_HUB_COOKIE).toBeCalledTimes(2);
  expect(S.SET_HUB_COOKIE).toHaveBeenNthCalledWith(
    1,
    {
      ...OPTIONS,
      sid: S.UUID_STR,
      context: 'WEB',
      contextInfo: {},
      debug: false
    },
    {expires: 365}
  );
  expect(S.SET_HUB_COOKIE).toHaveBeenNthCalledWith(2, {
    ...OPTIONS,
    sid: S.UUID_STR,
    context: 'WEB',
    contextInfo: {},
    debug: false,
    customerId: 'abcdef123456',
    hash: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a'
  });
  expect(_HTTP.post).toBeCalledTimes(1); // <-- custom `shouldUpdate` return false;
  expect(_HTTP.post).toBeCalledWith(
    '/workspaces/workspace_id/customers/abcdef123456/sessions',
    {value: '4ed6cae6-e956-4da1-9b06-c971887ed756'},
    'ABC123'
  );
});
