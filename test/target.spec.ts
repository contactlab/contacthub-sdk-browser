import {left, right} from 'fp-ts/Either';
import {getNodeAndToken} from '../src/target';
import * as H from './_helpers';
import {HUB_COOKIE} from './services';

test('getNodeAndToken() should return `nodeId` and `token`', async () => {
  const withTarget = await getNodeAndToken(HUB_COOKIE())();

  expect(withTarget).toEqual(right({nodeId: H.NID, token: H.TOKEN}));

  const noTarget = await getNodeAndToken({
    ...HUB_COOKIE(),
    target: undefined
  })();

  expect(noTarget).toEqual(right({nodeId: H.NID, token: H.TOKEN}));
});

test('getNodeAndToken() should return `aggregateNodeId` and `aggregateToken`', async () => {
  const withAggregate = await getNodeAndToken({
    ...HUB_COOKIE(),
    target: 'AGGREGATE',
    aggregateNodeId: 'aggrNid',
    aggregateToken: 'AGGR_TOKEN'
  })();

  expect(withAggregate).toEqual(
    right({nodeId: 'aggrNid', token: 'AGGR_TOKEN'})
  );
});

test('getNodeAndToken() should fail if `aggregateNodeId` or `aggregateToken` are not defined', async () => {
  const noNodeId = await getNodeAndToken({
    ...HUB_COOKIE(),
    target: 'AGGREGATE',
    aggregateToken: 'AGGR_TOKEN'
  })();

  expect(noNodeId).toEqual(
    left(
      new Error(
        '"aggregateNodeId" and "aggregateToken" must be set when "target" is "AGGREGATE"'
      )
    )
  );

  const noToken = await getNodeAndToken({
    ...HUB_COOKIE(),
    target: 'AGGREGATE',
    aggregateNodeId: 'aggrNid'
  })();

  expect(noToken).toEqual(
    left(
      new Error(
        '"aggregateNodeId" and "aggregateToken" must be set when "target" is "AGGREGATE"'
      )
    )
  );
});
