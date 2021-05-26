import * as E from 'fp-ts/Either';
import * as IOE from 'fp-ts/IOEither';
import {pipe} from 'fp-ts/function';
import Cookies from 'js-cookie';

export interface Decoder<A> {
  (u: unknown): E.Either<Error, A>;
}

// --- CH cookie
export interface CHCookie {
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

export const CHDecoder: Decoder<CHCookie> = u => {
  const o = u as CHCookie;

  return 'workspaceId' in o && 'nodeId' in o && 'token' in o && 'sid' in o
    ? E.right(o)
    : E.left(new Error('Missing required ContactHub configuration.'));
};

// --- UTM cookie
export interface UTMCookie {
  utm_source?: string;
  utm_medium?: string;
  utm_term?: string;
  utm_content?: string;
  utm_campaign?: string;
}

export const UTMDecoder: Decoder<UTMCookie> = u => E.right(u as UTMCookie);

// --- Service
export interface CookieSvc {
  cookie: Cookie;
}

interface Cookie {
  get: <A>(
    name: string,
    decoder: Decoder<A>,
    fallback?: A
  ) => IOE.IOEither<Error, A>;

  set: <A>(
    name: string,
    value: A,
    options?: Cookies.CookieAttributes
  ) => IOE.IOEither<Error, void>;
}

export const cookie: Cookie = {
  get: (name, decoder, fallback) =>
    pipe(
      Cookies.get(name),
      fromNullable(new Error(`Missing "${name}" cookie`)),
      IOE.chain(s => {
        try {
          const v = JSON.parse(s);
          return IOE.fromEither(decoder(v));
        } catch (e) {
          return IOE.left(new Error(`Cookie "${name}" cannot be parsed`));
        }
      }),
      IOE.orElse(withFallback(fallback))
    ),

  set: (name, value, options) =>
    IOE.tryCatch(
      () => {
        const s = JSON.stringify(value);
        Cookies.set(name, s, options);
      },
      e => new Error(`Cookie "${name}" cannot be set: ${e}`)
    )
};

// --- Helpers
const fromNullable =
  <L>(e: L) =>
  <R>(a: R | undefined | null): IOE.IOEither<L, R> =>
    typeof a === 'undefined' || a === null ? IOE.left(e) : IOE.right(a);

const withFallback =
  <A>(fallback?: A) =>
  (e: Error): IOE.IOEither<Error, A> =>
    typeof fallback === 'undefined' ? IOE.left(e) : IOE.right(fallback);
