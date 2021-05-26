import {post} from '@contactlab/appy';
import {withBody} from '@contactlab/appy/combinators/body';
import {withHeaders} from '@contactlab/appy/combinators/headers';
import * as IOE from 'fp-ts/IOEither';
import * as RTE from 'fp-ts/ReaderTaskEither';
import * as TE from 'fp-ts/TaskEither';
import {constVoid, pipe} from 'fp-ts/function';
import {Global} from './global';
import {Location} from './location';
import {Runner} from './runner';
import {SDKCookie} from './sdk-cookie';
import {UTMCookie} from './utm-cookie';

export interface EventEnv
  extends SDKCookie,
    UTMCookie,
    Global,
    Location,
    Runner {}

type EventProperties = Record<string, unknown>;

export interface EventOptions {
  type: string;
  properties?: EventProperties;
}

export interface Event {
  (options: EventOptions): void;
}

export const event =
  (Env: EventEnv): Event =>
  options =>
    pipe(
      IOE.Do,
      IOE.apS('opts', checkOptions(options)),
      IOE.apS('cookie', Env.cookie.get),
      IOE.apS(
        'tracking',
        pipe(
          Env.utmCookie.get,
          IOE.map(ga => ({ga})),
          IOE.orElseW(() => IOE.right(undefined))
        )
      ),
      IOE.apS('apiURL', IOE.rightIO(Env.apiUrl)),
      IOE.map(({cookie, opts, tracking, apiURL}) => {
        const {
          token,
          workspaceId,
          nodeId,
          context,
          contextInfo,
          customerId,
          sid
        } = cookie;

        const properties = inferProperties(Env)(opts);

        const bringBackProperties = customerId
          ? undefined
          : {type: 'SESSION_ID', value: sid, nodeId};

        return {
          url: `${apiURL}/workspaces/${workspaceId}/events`,
          data: {
            type: opts.type,
            context,
            contextInfo,
            properties,
            tracking,
            customerId,
            bringBackProperties
          },
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        };
      }),
      TE.fromIOEither,
      TE.chain(({data, headers, url}) =>
        pipe(
          post,
          withHeaders(headers),
          withBody(data),
          RTE.bimap(e => e.error, constVoid)
        )(url)
      ),
      Env.runAsync
    );

// --- Helpers
const checkOptions = (
  options: EventOptions
): IOE.IOEither<Error, EventOptions> =>
  pipe(
    options,
    IOE.fromPredicate(
      o => typeof o.type === 'string' && o.type.length > 0,
      () => new Error('Missing required event type')
    )
  );

const inferProperties =
  (Env: EventEnv) =>
  ({type, properties}: EventOptions): EventProperties | undefined => {
    if (type !== 'viewedPage') {
      return properties;
    }

    const {href, pathname} = Env.location();

    return {
      title: Env.title(),
      url: href,
      path: pathname,
      referer: Env.referrer(),

      ...properties
    };
  };
