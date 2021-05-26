import {post} from '@contactlab/appy';
import {withBody} from '@contactlab/appy/combinators/body';
import {withHeaders} from '@contactlab/appy/combinators/headers';
import * as IOE from 'fp-ts/IOEither';
import * as RTE from 'fp-ts/ReaderTaskEither';
import * as TE from 'fp-ts/TaskEither';
import {constVoid, pipe} from 'fp-ts/function';
import * as C from './cookie';
import {Global} from './global';
import {Location} from './location';
import {Runner} from './runner';

export interface EventEnv extends C.CookieSvc, Global, Location, Runner {}

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
      IOE.apS('cookie', Env.cookie.get(Env.cookieName(), C.CHDecoder)),
      IOE.apS(
        'utm',
        pipe(
          Env.cookie.get(Env.utmCookieName(), C.UTMDecoder),
          IOE.altW(() => IOE.right(undefined))
        )
      ),
      TE.fromIOEither,
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

        const properties = inferProperties(Env)(opts);
        const tracking = typeof utm === 'undefined' ? utm : {ga: utm};

        const bringBackProperties = customerId
          ? undefined
          : {type: 'SESSION_ID', value: sid, nodeId};

        const url = `${Env.apiUrl()}/workspaces/${workspaceId}/events`;
        const req = pipe(
          post,
          withHeaders({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }),
          withBody({
            type: opts.type,
            context,
            contextInfo,
            properties,
            tracking,
            customerId,
            bringBackProperties
          }),
          RTE.bimap(e => e.error, constVoid)
        );

        return req(url);
      }),
      Env.runAsync
    );

// --- Helpers
const checkOptions = IOE.fromPredicate<Error, EventOptions>(
  o => typeof o.type === 'string' && o.type.length > 0,
  () => new Error('Missing required event type')
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
