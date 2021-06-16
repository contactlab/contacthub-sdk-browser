import {left, right} from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import {HubCookie} from '../src/cookie';
import {event} from '../src/event';
import * as H from './_helpers';
import * as S from './services';

afterEach(() => {
  jest.clearAllMocks();
});

test('event() should send an event to API', async () => {
  const e = event({
    location: S.LOCATION(),
    http: _HTTP,
    cookie: S.COOKIE({
      hub: TE.right(S.HUB_COOKIE_CID),
      utm: TE.left(new Error())
    }),
    document: S.DOC({})
  });

  const result = await e({
    type: 'completedOrder',
    properties: {orderId: '1234'}
  })();

  expect(result).toEqual(right(undefined));
  expect(_HTTP.post).toBeCalledWith(
    `/workspaces/${H.WSID}/events`,
    {
      type: 'completedOrder',
      context: 'WEB',
      contextInfo: {},
      properties: {orderId: '1234'},
      tracking: undefined,
      customerId: H.CID,
      bringBackProperties: undefined
    },
    H.TOKEN
  );
});

test('event() should send an event to API - with tracking', async () => {
  const e = event({
    location: S.LOCATION(),
    http: _HTTP,
    cookie: S.COOKIE({
      hub: TE.right(S.HUB_COOKIE_CID)
    }),
    document: S.DOC({})
  });

  const result = await e({
    type: 'completedOrder',
    properties: {orderId: '1234'}
  })();

  expect(result).toEqual(right(undefined));
  expect(_HTTP.post).toBeCalledWith(
    `/workspaces/${H.WSID}/events`,
    {
      type: 'completedOrder',
      context: 'WEB',
      contextInfo: {},
      properties: {orderId: '1234'},
      tracking: {ga: {utm_source: 'abcd', utm_medium: 'web'}},
      customerId: H.CID,
      bringBackProperties: undefined
    },
    H.TOKEN
  );
});

test('event() should send an event to API - with bringBackProperties', async () => {
  const e = event({
    location: S.LOCATION(),
    http: _HTTP,
    cookie: S.COOKIE({
      utm: TE.left(new Error())
    }),
    document: S.DOC({})
  });

  const result = await e({
    type: 'completedOrder',
    properties: {orderId: '1234'}
  })();

  expect(result).toEqual(right(undefined));
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
        value: S.HUB_COOKIE.sid,
        nodeId: H.NID
      }
    },
    H.TOKEN
  );
});

test('event() should send an event to API - with inferred properties', async () => {
  const e = event({
    location: S.LOCATION(),
    http: _HTTP,
    cookie: S.COOKIE({
      hub: TE.right(S.HUB_COOKIE_CID),
      utm: TE.left(new Error())
    }),
    document: S.DOC({})
  });

  const result = await e({
    type: 'viewedPage',
    properties: {pageTags: ['a', 'b', 'c']}
  })();

  expect(result).toEqual(right(undefined));
  expect(_HTTP.post).toBeCalledWith(
    `/workspaces/${H.WSID}/events`,
    {
      type: 'viewedPage',
      context: 'WEB',
      contextInfo: {},
      properties: {
        title: 'Some title',
        url: 'http://test.com/some/path',
        path: '/some/path',
        referer: '',
        pageTags: ['a', 'b', 'c']
      },
      tracking: undefined,
      customerId: H.CID,
      bringBackProperties: undefined
    },
    H.TOKEN
  );
});

test('event() should fail if options are not valid', async () => {
  const e = event({
    location: S.LOCATION(),
    http: _HTTP,
    cookie: S.COOKIE({
      hub: TE.left(new Error()),
      utm: TE.left(new Error())
    }),
    document: S.DOC({})
  });

  const resultMissing = await e({
    properties: {orderId: '1234'}
  } as any)();

  expect(resultMissing).toEqual(left(new Error('Missing required event type')));

  const resultEmpty = await e({
    type: '',
    properties: {orderId: '1234'}
  } as any)();

  expect(resultEmpty).toEqual(left(new Error('Missing required event type')));

  expect(_HTTP.post).not.toBeCalled();
});

test('event() should fail if Hub cookie does not exists', async () => {
  const e = event({
    location: S.LOCATION(),
    http: _HTTP,
    cookie: S.COOKIE({
      hub: TE.left(new Error('Missing required ContactHub configuration.')),
      utm: TE.left(new Error())
    }),
    document: S.DOC({})
  });

  const result = await e({
    type: 'completedOrder',
    properties: {orderId: '1234'}
  })();

  expect(result).toEqual(
    left(new Error('Missing required ContactHub configuration.'))
  );
  expect(_HTTP.post).not.toBeCalled();
});

test('event() should fail if service fails', async () => {
  const HTTP_FAIL = S.HTTP({post: TE.left(new Error('network error'))});

  const e = event({
    location: S.LOCATION(),
    http: HTTP_FAIL,
    cookie: S.COOKIE({
      hub: TE.right(HUB_COOKIE),
      utm: TE.left(new Error())
    }),
    document: S.DOC({})
  });

  const result = await e({
    type: 'completedOrder',
    properties: {orderId: '1234'}
  })();

  expect(result).toEqual(left(new Error('network error')));
});

// --- Helpers
const _HTTP = S.HTTP({});

const HUB_COOKIE_NO_CID: HubCookie = {
  token: H.TOKEN,
  workspaceId: H.WSID,
  nodeId: H.NID,
  sid: S.UUID_STR,
  context: '',
  contextInfo: {},
  debug: false
};

const HUB_COOKIE: HubCookie = {...HUB_COOKIE_NO_CID, customerId: H.CID};
