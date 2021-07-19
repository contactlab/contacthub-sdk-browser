/**
 * @since 2.0.0
 */

import * as TE from 'fp-ts/TaskEither';
import {constVoid, pipe} from 'fp-ts/function';
import {CookieSvc} from './cookie';
import {DocumentSvc} from './doc';
import {HttpSvc} from './http';
import {LocationSvc} from './location';
import {Effect} from './program';

/**
 * Defines capabilities and services required by the `event` method in order to work.
 *
 * @category capabilities
 * @since 2.0.0
 */
export interface EventEnv
  extends HttpSvc,
    CookieSvc,
    LocationSvc,
    DocumentSvc {}

/**
 * Defines the `event` method signature.
 *
 * @category model
 * @since 2.0.0
 */
export interface Event {
  (options: EventOptions): Effect;
}

/**
 * Defines the `event` method options.
 *
 * @category model
 * @since 2.0.0
 */
export interface EventOptions {
  type: string;
  properties?: EventProperties;
}

type EventProperties = Record<string, unknown>;

/**
 * SDK's event method: sends provided event to Customer Hub's API.
 *
 * @category methods
 * @since 2.0.0
 */
export const event =
  (E: EventEnv): Event =>
  options =>
    pipe(
      TE.Do,
      TE.apS('opts', checkOptions(options)),
      TE.apS('cookie', E.cookie.getHub()),
      TE.apS(
        'utm',
        pipe(
          E.cookie.getUTM(),
          TE.altW(() => TE.right(undefined))
        )
      ),
      TE.chain(({cookie, opts, utm}) => {
        const {
          token,
          workspaceId,
          nodeId,
          context,
          contextInfo,
          customerId,
          sid
        } = cookie;

        const properties = inferProperties(E)(opts);
        const tracking = typeof utm === 'undefined' ? utm : {ga: utm};

        const bringBackProperties = customerId
          ? undefined
          : {type: 'SESSION_ID', value: sid, nodeId};

        return E.http.post(
          `/workspaces/${workspaceId}/events`,
          {
            type: opts.type,
            context,
            contextInfo,
            properties,
            tracking,
            customerId,
            bringBackProperties
          },
          token
        );
      }),
      TE.map(constVoid)
    );

// --- Helpers
const checkOptions = TE.fromPredicate<Error, EventOptions>(
  o => typeof o.type === 'string' && o.type.length > 0,
  () => new Error('Missing required event type')
);

const inferProperties =
  (E: EventEnv) =>
  ({type, properties}: EventOptions): EventProperties | undefined => {
    if (type !== 'viewedPage') {
      return properties;
    }

    const {href, pathname} = E.location.data();

    return {
      title: E.document.title(),
      url: href,
      path: pathname,
      referer: E.document.referrer(),

      ...properties
    };
  };
