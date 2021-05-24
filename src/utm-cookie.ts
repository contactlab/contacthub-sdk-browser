import * as E from 'fp-ts/Either';
import {Cookie, Decoder, cookie} from './cookie';

export interface CHUtmCookie {
  utm_source: string;
  utm_medium?: string;
  utm_term?: string;
  utm_content?: string;
  utm_campaign?: string;
}

export interface UTMCookie {
  utmCookie: Cookie<CHUtmCookie>;
}

const CHUtmCookieDecoder: Decoder<CHUtmCookie> = u => {
  const o = u as CHUtmCookie;

  if (!('utm_source' in o)) {
    return E.left(toError());
  }

  return E.right(o);
};

const toError = (): Error => new Error('Missing required UTM source.');

export const utmCookie = cookie({
  decoder: CHUtmCookieDecoder,
  name: 'ContactHubUtmCookie',
  toError
});
