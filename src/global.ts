import {IO} from 'fp-ts/IO';

export interface GlobalEnv {
  window: Window & typeof globalThis & Vars;
}

interface Vars {
  ContactHubObject?: string;
  ContactHubCookie?: string;
  ContactHubUtmCookie?: string;
  ContactHubAPI?: string;
}

export interface Global {
  title: IO<string>;
  referrer: IO<string>;
  varName: IO<string>;
  cookieName: IO<string>;
  utmCookieName: IO<string>;
  apiUrl: IO<string>;
}

export const global = (Env: GlobalEnv): Global => ({
  title: () => Env.window.document.title,
  referrer: () => Env.window.document.referrer,
  varName: () => Env.window.ContactHubAPI ?? 'ch',
  cookieName: () => Env.window.ContactHubCookie ?? '_ch',
  utmCookieName: () => Env.window.ContactHubUtmCookie ?? '_chutm',
  apiUrl: () => Env.window.ContactHubAPI ?? 'https://api.contactlab.it/hub/v1'
});
