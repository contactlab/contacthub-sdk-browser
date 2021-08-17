/**
 * Utilities related to `target` node.
 *
 * @since 2.1.0
 */

import * as TE from 'fp-ts/TaskEither';
import {HubCookie} from './cookie';
import {Effect} from './program';

interface NodeAndToken {
  nodeId: string;
  token: string;
}

/**
 * Gets the node id and token based on `target`.
 *
 * @since 2.1.0
 */
export const getNodeAndToken = (c: HubCookie): Effect<NodeAndToken> => {
  const target = c.target || 'ENTRY';

  if (target === 'ENTRY') {
    return TE.right({nodeId: c.nodeId, token: c.token});
  }

  return c.aggregateNodeId && c.aggregateToken
    ? TE.right({nodeId: c.aggregateNodeId, token: c.aggregateToken})
    : TE.left(
        new Error(
          '"aggregateNodeId" and "aggregateToken" must be set when "target" is "AGGREGATE"'
        )
      );
};
