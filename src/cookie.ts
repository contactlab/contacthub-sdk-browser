import {Either, right, left} from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import {pipe} from 'fp-ts/function';
import Cookies from 'js-cookie';
import {Effect} from './program';

interface Decoder<A> {
  (u: unknown): Either<Error, A>;
}

// --- Service
interface WithVars extends Window {
  ContactHubCookie?: string;
  ContactHubUtmCookie?: string;
}

export interface CookieSvc {
  cookie: Cookie;
}

export interface Cookie {
  /**
   * Gets the Hub cookie.
   */
  getHub: CookieGet<HubCookie>;
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

interface CookieGet<A> {
  (fallback?: A): Effect<A>;
}

interface CookieSet<A> {
  (value: A, options?: Cookies.CookieAttributes): Effect;
}

export const cookie = (): Cookie => {
  const hubName = (): string => (window as WithVars).ContactHubCookie ?? '_ch';

  const utmName = (): string =>
    (window as WithVars).ContactHubUtmCookie ?? '_chutm';

  return {
    getHub: fallback => get(hubName(), CHDecoder, fallback),
    setHub: (value, opts) => set(hubName(), value, opts),
    getUTM: fallback => get(utmName(), UTMDecoder, fallback),
    setUTM: (value, opts) => set(utmName(), value, opts)
  };
};

// --- CH cookie
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
}

const CHDecoder: Decoder<HubCookie> = u => {
  const o = u as HubCookie;

  return 'workspaceId' in o && 'nodeId' in o && 'token' in o && 'sid' in o
    ? right(o)
    : left(new Error('Missing required ContactHub configuration.'));
};

// --- UTM cookie
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
