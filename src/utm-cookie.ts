import * as E from 'fp-ts/Either';
import {Cookie, Decoder, cookie} from './cookie';
import {Global} from './global';

interface UTMCookieEnv extends Global {}

export interface UTMCookie {
  utmCookie: Cookie<CHUtmCookie>;
}

export interface CHUtmCookie {
  utm_source: string;
  utm_medium?: string;
  utm_term?: string;
  utm_content?: string;
  utm_campaign?: string;
}

export const utmCookie = (Env: UTMCookieEnv): UTMCookie => ({
  utmCookie: cookie({decoder, name: Env.utmCookieName, toError})
});

// --- Helpers
const decoder: Decoder<CHUtmCookie> = u => {
  const o = u as CHUtmCookie;

  return 'utm_source' in o ? E.right(o) : E.left(toError());
};

const toError = (): Error => new Error('Missing required UTM source.');
