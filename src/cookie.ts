/**
 * Service to handle cookies.
 *
 * @since 2.0.0
 */

import {Either, right, left} from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import {pipe} from 'fp-ts/function';
import Cookies from 'js-cookie';
import {GlobalsSvc} from './globals';
import {Effect} from './program';

interface Decoder<A> {
  (u: unknown): Either<Error, A>;
}

// --- Service
/**
 * @category capabilities
 * @since 2.0.0
 */
export interface CookieSvc {
  cookie: Cookie;
}

/**
 * Defines the `Cookie` service capabilities.
 *
 * @category model
 * @since 2.0.0
 */
export interface Cookie {
  /**
   * Gets the Hub cookie.
   */
  getHub: CookieGet<HubCookie, HubCookieWithTarget>;
  /**
   * Sets the Hub cookie.
   */
  setHub: CookieSet<HubCookie>;
  /**
   * Gets the UTM cookie.
   */
  getUTM: CookieGet<UTMCookie>;
  /**
   * Sets the UTM cookie.
   */
  setUTM: CookieSet<UTMCookie>;
}

/**
 * @since 2.0.0
 */
export interface CookieGet<B, A extends B = B> {
  (fallback?: B): Effect<A>;
}

/**
 * @since 2.0.0
 */
export interface CookieSet<A> {
  (value: A, options?: Cookies.CookieAttributes): Effect;
}

interface CookieEnv extends GlobalsSvc {}

/**
 * Live instance of `Cookie` service.
 *
 * @category instances
 * @since 2.0.0
 */
export const cookie = (E: CookieEnv): Cookie => ({
  getHub: fallback =>
    pipe(
      get(E.globals().cookieName, CHDecoder, fallback),
      TE.map(ch => ({...ch, target: ch.target ?? 'ENTRY'}))
    ),
  setHub: (value, opts) => set(E.globals().cookieName, value, opts),
  getUTM: fallback => get(E.globals().utmCookieName, UTMDecoder, fallback),
  setUTM: (value, opts) => set(E.globals().utmCookieName, value, opts)
});

// --- CH cookie
/**
 * Defines the shape of SDK's cookie value.
 *
 * @category model
 * @since 2.0.0
 */
export interface HubCookie {
  token: string;
  workspaceId: string;
  nodeId: string;
  debug: boolean;
  context: string;
  contextInfo: Record<string, unknown>;
  sid: string;
  customerId?: string;
  hash?: string;
  target?: 'ENTRY' | 'AGGREGATE';
  aggregateToken?: string;
  aggregateNodeId?: string;
}

/**
 * Makes mandatory the SDK's cookie `target` property.
 *
 * @category model
 * @since 2.1.0
 */
export interface HubCookieWithTarget extends HubCookie {
  target: Exclude<HubCookie['target'], undefined>;
}

const CHDecoder: Decoder<HubCookie> = u => {
  const o = u as HubCookie;

  return 'workspaceId' in o && 'nodeId' in o && 'token' in o && 'sid' in o
    ? right(o)
    : left(new Error('Missing required ContactHub configuration.'));
};

// --- UTM cookie
/**
 * Defines the shape of the UTM cookie value.
 *
 * @category model
 * @since 2.0.0
 */
export interface UTMCookie {
  utm_source?: string;
  utm_medium?: string;
  utm_term?: string;
  utm_content?: string;
  utm_campaign?: string;
}

const UTMDecoder: Decoder<UTMCookie> = u => right(u as UTMCookie);

// --- Helpers
const get = <A>(name: string, decoder: Decoder<A>, fallback?: A): Effect<A> =>
  pipe(
    fromNullable(name),
    TE.chain(s => {
      try {
        return TE.fromEither(decoder(JSON.parse(s)));
      } catch (e) {
        return TE.left(new Error(`Cookie "${name}" cannot be parsed`));
      }
    }),
    TE.orElse(e =>
      typeof fallback === 'undefined' ? TE.left(e) : TE.right(fallback)
    )
  );

const set = <A>(
  name: string,
  value: A,
  options?: Cookies.CookieAttributes
): Effect => {
  try {
    Cookies.set(name, JSON.stringify(value), options);
    return TE.right(undefined);
  } catch (e) {
    return TE.left(new Error(`Cookie "${name}" cannot be set: ${e}`));
  }
};

const fromNullable =
  (name: string): Effect<string> =>
  () => {
    const c = Cookies.get(name);
    const value =
      typeof c === 'undefined' || c === null
        ? left(new Error(`Missing "${name}" cookie`))
        : right(c);

    return Promise.resolve(value);
  };
