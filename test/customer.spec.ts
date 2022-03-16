import {left, right} from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import {HubCookieWithTarget} from '../src/cookie';
import {customer} from '../src/customer';
import {Http} from '../src/http';
import * as H from './_helpers';
import * as S from './services';

test('customer() should reset Hub cookie when called without options', async () => {
  const c = customer({
    http: _HTTP,
    cookie: S.COOKIE({}),
    uuid: S.UUID
  });

  const result = await c()();

  expect(result).toEqual(right(undefined));
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).not.toBeCalled();
  expect(S.SET_HUB_COOKIE).toBeCalledWith(
    {
      ...S.HUB_COOKIE(),
      sid: S.UUID_STR,
      customerId: undefined,
      hash: undefined
    },
    undefined
  );
});

test('customer() should reconcile and update when customer id is provided but is not in cookie', async () => {
  const c = customer({
    http: _HTTP,
    cookie: S.COOKIE({}),
    uuid: S.UUID
  });

  const result = await c({id: 'abcd1234'})();

  expect(result).toEqual(right(undefined));
  expect(_HTTP.post).toBeCalledTimes(1); // <-- `shouldUpdate` is false because;
  expect(_HTTP.post).toBeCalledWith(
    `/workspaces/${H.WSID}/customers/abcd1234/sessions`,
    {value: S.HUB_COOKIE().sid},
    H.TOKEN
  );
  expect(_HTTP.patch).not.toBeCalled();
  expect(S.SET_HUB_COOKIE).toBeCalledWith(
    {
      ...S.HUB_COOKIE(),
      customerId: 'abcd1234',
      hash: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a'
    },
    undefined
  );
});

test('customer() should reconcile and not update when customer id is provided but is not in cookie and target is AGGREGATE', async () => {
  const c = customer({
    http: _HTTP,
    cookie: S.COOKIE({hub: TE.right({...S.HUB_COOKIE(), ...AGGREGATE})}),
    uuid: S.UUID
  });

  const result = await c({id: 'abcd1234'})();

  expect(result).toEqual(
    left(new Error('this operation is allowed only when "target" is "ENTRY"'))
  );

  expect(_HTTP.post).toBeCalledTimes(1);
  expect(_HTTP.post).toBeCalledWith(
    `/workspaces/${H.WSID}/customers/abcd1234/sessions`,
    {value: S.HUB_COOKIE().sid},
    AGGREGATE.aggregateToken
  );

  expect(_HTTP.patch).not.toBeCalled();
  expect(S.SET_HUB_COOKIE).not.toBeCalled();
});

test('customer() should update when customer id is in cookie', async () => {
  const c = customer({
    http: _HTTP,
    cookie: S.COOKIE({
      hub: TE.right(S.HUB_COOKIE_CID())
    }),
    uuid: S.UUID
  });

  const result = await c({base: {firstName: 'Foo', lastName: 'Bar'}})();

  expect(result).toEqual(right(undefined));
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).toBeCalledTimes(1);
  expect(_HTTP.patch).toBeCalledWith(
    `/workspaces/${H.WSID}/customers/${H.CID}`,
    {base: {firstName: 'Foo', lastName: 'Bar'}},
    H.TOKEN
  );
  expect(S.SET_HUB_COOKIE).toBeCalledWith(
    {
      ...S.HUB_COOKIE_CID(),
      hash: 'e7489d96d261f13e4caaf12ac7145bf4d86ac81136af76532877a91e4f8b58a0'
    },
    undefined
  );
});

test('customer() should not update when customer id is in cookie and target is AGGREGATE', async () => {
  const c = customer({
    http: _HTTP,
    cookie: S.COOKIE({
      hub: TE.right({...S.HUB_COOKIE_CID(), target: 'AGGREGATE'})
    }),
    uuid: S.UUID
  });

  const result = await c({base: {firstName: 'Foo', lastName: 'Bar'}})();

  expect(result).toEqual(
    left(new Error('this operation is allowed only when "target" is "ENTRY"'))
  );
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).not.toBeCalled();
  expect(S.SET_HUB_COOKIE).not.toBeCalled();
});

test('customer() should resolve and update when customer id is provided and is in cookie', async () => {
  const c = customer({
    http: _HTTP,
    cookie: S.COOKIE({
      hub: TE.right(S.HUB_COOKIE_CID())
    }),
    uuid: S.UUID
  });

  const result = await c({
    id: 'efgh5678',
    base: {firstName: 'Foo', lastName: 'Bar'}
  })();

  expect(result).toEqual(right(undefined));
  expect(S.SET_HUB_COOKIE).toBeCalledWith(
    {
      ...S.HUB_COOKIE(),
      sid: S.UUID_STR,
      customerId: undefined,
      hash: undefined
    },
    undefined
  );
  expect(_HTTP.post).toBeCalledTimes(1);
  expect(_HTTP.post).toBeCalledWith(
    `/workspaces/${H.WSID}/customers/efgh5678/sessions`,
    {value: S.UUID_STR},
    H.TOKEN
  );
  expect(_HTTP.patch).toBeCalledTimes(1);
  expect(_HTTP.patch).toBeCalledWith(
    `/workspaces/${H.WSID}/customers/efgh5678`,
    {id: 'efgh5678', base: {firstName: 'Foo', lastName: 'Bar'}},
    H.TOKEN
  );
  expect(S.SET_HUB_COOKIE).toBeCalledWith(
    {
      ...S.HUB_COOKIE(),
      sid: S.UUID_STR,
      customerId: 'efgh5678',
      hash: 'e7489d96d261f13e4caaf12ac7145bf4d86ac81136af76532877a91e4f8b58a0'
    },
    undefined
  );
});

test('customer() should resolve but not update when customer id is provided and is in cookie and target is AGGREGATE', async () => {
  const c = customer({
    http: _HTTP,
    cookie: S.COOKIE({
      hub: TE.right({...S.HUB_COOKIE_CID(), ...AGGREGATE})
    }),
    uuid: S.UUID
  });

  const result = await c({
    id: 'efgh5678',
    base: {firstName: 'Foo', lastName: 'Bar'}
  })();

  expect(result).toEqual(
    left(new Error('this operation is allowed only when "target" is "ENTRY"'))
  );

  expect(S.SET_HUB_COOKIE).toBeCalledTimes(1);
  expect(S.SET_HUB_COOKIE).toBeCalledWith(
    {
      ...S.HUB_COOKIE(),
      target: 'AGGREGATE',
      aggregateNodeId: 'aggr_nid',
      aggregateToken: 'AGGR_TOKEN',
      sid: S.UUID_STR,
      customerId: undefined,
      hash: undefined
    },
    undefined
  );

  expect(_HTTP.post).toBeCalledTimes(1);
  expect(_HTTP.post).toBeCalledWith(
    `/workspaces/${H.WSID}/customers/efgh5678/sessions`,
    {value: S.UUID_STR},
    AGGREGATE.aggregateToken
  );
  expect(_HTTP.patch).not.toBeCalled();
});

test('customer() should only update when customer id is provided and is in cookie and are equals', async () => {
  const c = customer({
    http: _HTTP,
    cookie: S.COOKIE({
      hub: TE.right(S.HUB_COOKIE_CID())
    }),
    uuid: S.UUID
  });

  const result = await c({
    id: 'abcd1234',
    base: {firstName: 'Foo', lastName: 'Bar'}
  })();

  expect(result).toEqual(right(undefined));
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).toBeCalledTimes(1);
  expect(_HTTP.patch).toBeCalledWith(
    `/workspaces/${H.WSID}/customers/${H.CID}`,
    {id: 'abcd1234', base: {firstName: 'Foo', lastName: 'Bar'}},
    H.TOKEN
  );
  expect(S.SET_HUB_COOKIE).toBeCalledTimes(1);
  expect(S.SET_HUB_COOKIE).toBeCalledWith(
    {
      ...S.HUB_COOKIE_CID(),
      hash: 'e7489d96d261f13e4caaf12ac7145bf4d86ac81136af76532877a91e4f8b58a0'
    },
    undefined
  );
});

test('customer() should create and reconcile when no customer id is provided or in cookie', async () => {
  let RUN_SECOND = false;

  const HTTP_CREATE: Http = {
    post: jest.fn(() => {
      const POST = RUN_SECOND ? TE.right({}) : TE.right({id: 'abcd1234'});

      RUN_SECOND = true;

      return POST;
    }),
    patch: jest.fn(() => TE.right({}))
  };

  const c = customer({
    http: HTTP_CREATE,
    cookie: S.COOKIE({}),
    uuid: S.UUID
  });

  const result = await c({base: {firstName: 'Foo', lastName: 'Bar'}})();

  expect(result).toEqual(right(undefined));
  expect(HTTP_CREATE.post).toBeCalledTimes(2);
  expect(HTTP_CREATE.post).toBeCalledWith(
    `/workspaces/${H.WSID}/customers`,
    {base: {firstName: 'Foo', lastName: 'Bar'}, nodeId: H.NID},
    H.TOKEN
  );
  expect(S.SET_HUB_COOKIE).toBeCalledWith(
    {
      ...S.HUB_COOKIE(),
      customerId: 'abcd1234',
      hash: 'e7489d96d261f13e4caaf12ac7145bf4d86ac81136af76532877a91e4f8b58a0'
    },
    undefined
  );
  expect(HTTP_CREATE.post).toBeCalledWith(
    `/workspaces/${H.WSID}/customers/abcd1234/sessions`,
    {value: S.HUB_COOKIE().sid},
    H.TOKEN
  );
});

test('customer() should not create and reconcile when no customer id is provided or in cookie and target is AGGREGATE', async () => {
  const c = customer({
    http: _HTTP,
    cookie: S.COOKIE({hub: TE.right({...S.HUB_COOKIE(), ...AGGREGATE})}),
    uuid: S.UUID
  });

  const result = await c({base: {firstName: 'Foo', lastName: 'Bar'}})();

  expect(result).toEqual(
    left(new Error('this operation is allowed only when "target" is "ENTRY"'))
  );

  expect(_HTTP.post).not.toBeCalled();
  expect(S.SET_HUB_COOKIE).not.toBeCalled();
});

test('customer() should do nothing if data are the same', async () => {
  const c = customer({
    http: _HTTP,
    cookie: S.COOKIE({
      hub: TE.right({
        ...S.HUB_COOKIE_CID(),
        hash: 'e7489d96d261f13e4caaf12ac7145bf4d86ac81136af76532877a91e4f8b58a0'
      })
    }),
    uuid: S.UUID
  });

  const result = await c({
    id: 'abcd1234',
    base: {firstName: 'Foo', lastName: 'Bar'}
  })();

  expect(result).toEqual(right(undefined));
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).not.toBeCalled();
  expect(S.SET_HUB_COOKIE).not.toBeCalled();
});

test('customer() should fail if Hub cookie does not exists', async () => {
  const c = customer({
    http: _HTTP,
    cookie: S.COOKIE({
      hub: TE.left(new Error('Missing required ContactHub configuration.'))
    }),
    uuid: S.UUID
  });

  const result = await c({
    id: 'abcd1234',
    base: {firstName: 'Foo', lastName: 'Bar'}
  })();

  expect(result).toEqual(
    left(new Error('Missing required ContactHub configuration.'))
  );
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).not.toBeCalled();
  expect(S.SET_HUB_COOKIE).not.toBeCalled();
});

test('customer() should fail if computing hash fails', async () => {
  const c = customer({
    http: _HTTP,
    cookie: S.COOKIE({}),
    uuid: S.UUID
  });

  const extended: any = {foo: 'bar'};
  extended.circular = extended;

  const result = await c({
    id: 'abcd1234',
    base: {firstName: 'Foo', lastName: 'Bar'},
    extended
  })();

  expect(result).toEqual(
    left(new Error('Customer data cannot be stringified'))
  );
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).not.toBeCalled();
  expect(S.SET_HUB_COOKIE).not.toBeCalled();
});

test('customer() should fail if service fails', async () => {
  const HTTP_FAIL = S.HTTP({post: TE.left(new Error('network error'))});

  const c = customer({
    http: HTTP_FAIL,
    cookie: S.COOKIE({}),
    uuid: S.UUID
  });

  const result = await c({
    id: 'abcd1234',
    base: {firstName: 'Foo', lastName: 'Bar'}
  })();

  expect(result).toEqual(left(new Error('network error')));
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).not.toBeCalled();
  expect(S.SET_HUB_COOKIE).not.toBeCalled();
});

test('customer() should fail on create if API payload decoding fails', async () => {
  const c = customer({
    http: _HTTP,
    cookie: S.COOKIE({}),
    uuid: S.UUID
  });

  const result = await c({base: {firstName: 'Foo', lastName: 'Bar'}})();

  expect(result).toEqual(left(new Error('Customer id has to be a string')));
  expect(_HTTP.post).toBeCalledTimes(1);
  expect(_HTTP.post).toBeCalledWith(
    `/workspaces/${H.WSID}/customers`,
    {base: {firstName: 'Foo', lastName: 'Bar'}, nodeId: H.NID},
    H.TOKEN
  );
  expect(_HTTP.patch).not.toBeCalled();
  expect(S.SET_HUB_COOKIE).not.toBeCalled();
});

test('customer() should fail when customer id conflict cannot be resolved', async () => {
  const c = customer({
    http: _HTTP,
    cookie: S.COOKIE({
      hub: TE.right(S.HUB_COOKIE_CID())
    }),
    uuid: S.UUID
  });

  const result = await c({id: 'efgh5678'})();

  expect(result).toEqual(
    left(
      new Error('The provided id conflicts with the id stored in the cookie')
    )
  );
  expect(S.SET_HUB_COOKIE).not.toBeCalled();
  expect(_HTTP.post).not.toBeCalled();
  expect(_HTTP.patch).not.toBeCalled();
});

// --- Helpers
const _HTTP = S.HTTP({});

const AGGREGATE: Partial<HubCookieWithTarget> = {
  target: 'AGGREGATE',
  aggregateNodeId: 'aggr_nid',
  aggregateToken: 'AGGR_TOKEN'
};
