import {left, right} from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import {config, ConfigOptions} from '../src/config';
import * as H from './_helpers';
import * as S from './services';

afterEach(() => {
  jest.clearAllMocks();
});

test('config() should set SDK configuration - with defaults', async () => {
  const c = config({
    location: S.LOCATION(),
    cookie: S.COOKIE({
      hub: TE.left(new Error()),
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
  expect(S.SET_HUB_COOKIE).toBeCalledWith(
    {
      ...OPTIONS,
      target: 'ENTRY',
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
  const c = config({
    location: S.LOCATION(),
    cookie: S.COOKIE({}),
    http: _HTTP,
    uuid: S.UUID
  });

  const OPTIONS: ConfigOptions = {
    token: 'OTHER_TOKEN',
    workspaceId: H.WSID,
    nodeId: H.NID,
    target: 'AGGREGATE',
    context: 'AAA',
    contextInfo: {foo: 'bar'},
    debug: true,
    aggregateNodeId: 'aggrNid',
    aggregateToken: 'AGGR_TOKEN'
  };

  const result = await c(OPTIONS)();

  expect(result).toEqual(right(undefined));
  expect(S.SET_HUB_COOKIE).toBeCalledWith(
    {
      ...OPTIONS,
      sid: S.UUID_STR,
      context: 'AAA',
      contextInfo: {foo: 'bar'},
      debug: true,
      aggregateNodeId: 'aggrNid',
      aggregateToken: 'AGGR_TOKEN'
    },
    {expires: 365}
  );
  expect(S.SET_UTM_COOKIE).toBeCalledWith(
    {utm_source: 'abcd', utm_medium: 'web'},
    {expires: 1 / 48}
  );
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).not.toBeCalled();
});

test('config() should fail if provided options are not valid', async () => {
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
  const c = config({
    location: S.LOCATION(
      'http://test.com?utm_source=def&utm_campaign=foo&utm_term=bar'
    ),
    cookie: S.COOKIE({
      hub: TE.left(new Error())
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

test('config() should set target if there is a `target` param in query string', async () => {
  const withRightParam = config({
    location: S.LOCATION('http://test.com?target=AGGREGATE'),
    cookie: S.COOKIE({}),
    http: _HTTP,
    uuid: S.UUID
  });

  const withWrongParam = config({
    location: S.LOCATION('http://test.com?target=foobarbaz'),
    cookie: S.COOKIE({}),
    http: _HTTP,
    uuid: S.UUID
  });

  const OPTIONS: ConfigOptions = {
    token: H.TOKEN,
    workspaceId: H.WSID,
    nodeId: H.NID
  };

  await withRightParam(OPTIONS)();

  expect(S.SET_HUB_COOKIE).toBeCalledWith(
    {...S.HUB_COOKIE(), target: 'AGGREGATE'},
    {expires: 365}
  );

  await withWrongParam(OPTIONS)();

  expect(S.SET_HUB_COOKIE).toBeCalledWith(S.HUB_COOKIE(), {expires: 365});
});

test('config() should set customer if there is a clabId param in query string', async () => {
  const c = config({
    location: S.LOCATION('http://test.com?clabId=abcdef123456'),
    cookie: S.COOKIE({}),
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
  expect(S.SET_HUB_COOKIE).toHaveBeenNthCalledWith(1, S.HUB_COOKIE(), {
    expires: 365
  });
  expect(S.SET_HUB_COOKIE).toHaveBeenNthCalledWith(
    2,
    {
      ...S.HUB_COOKIE(),
      customerId: 'abcdef123456',
      hash: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a'
    },
    undefined
  );
  expect(_HTTP.post).toBeCalledTimes(1); // <-- customer `shouldUpdate` return false;
  expect(_HTTP.post).toBeCalledWith(
    `/workspaces/${H.WSID}/customers/abcdef123456/sessions`,
    {value: S.HUB_COOKIE().sid},
    H.TOKEN
  );
});

// --- Helpers
const _HTTP = S.HTTP({});
