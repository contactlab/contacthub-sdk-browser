import * as TE from 'fp-ts/TaskEither';
import {constVoid, pipe} from 'fp-ts/function';
import {CookieSvc} from './cookie';
import {DocumentSvc} from './doc';
import {HttpSvc} from './http';
import {LocationSvc} from './location';
import {Effect} from './program';

export interface EventEnv
  extends HttpSvc,
    CookieSvc,
    LocationSvc,
    DocumentSvc {}

type EventProperties = Record<string, unknown>;

export interface EventOptions {
  type: string;
  properties?: EventProperties;
}

export interface Event {
  (options: EventOptions): Effect;
}

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
