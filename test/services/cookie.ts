import {orElse, left, right, TaskEither} from 'fp-ts/TaskEither';
import {pipe} from 'fp-ts/function';
import {Cookie, HubCookie, UTMCookie} from '../../src/cookie';
import * as H from '../_helpers';

export const SET_HUB_COOKIE = jest.fn(() => right(undefined));
export const SET_HUB_COOKIE_KO = jest.fn(() =>
  left(new Error('Cookie "_ch" cannot be set'))
);

export const SET_UTM_COOKIE = jest.fn(() => right(undefined));
export const SET_UTM_COOKIE_KO = jest.fn(() =>
  left(new Error('Cookie "_chutm" cannot be set'))
);

const HUB_COOKIE: HubCookie = {
  token: H.TOKEN,
  workspaceId: H.WSID,
  nodeId: H.NID,
  debug: false,
  context: 'WEB',
  contextInfo: {},
  sid: 'ABCD-1234'
};

const UTM_COOKIE: UTMCookie = {
  utm_source: 'abcd',
  utm_medium: 'web'
};

interface CookieProps {
  hub?: TaskEither<Error, HubCookie>;
  utm?: TaskEither<Error, UTMCookie>;
}

export const COOKIE = ({
  hub = right(HUB_COOKIE),
  utm = right(UTM_COOKIE)
}: CookieProps): Cookie => ({
  getHub: f =>
    pipe(
      hub,
      orElse(e => (typeof f === 'undefined' ? left(e) : right(f)))
    ),

  setHub: SET_HUB_COOKIE,

  getUTM: f =>
    pipe(
      utm,
      orElse(e => (typeof f === 'undefined' ? left(e) : right(f)))
    ),

  setUTM: SET_UTM_COOKIE
});

export const COOKIE_SET_KO = ({
  hub = right(HUB_COOKIE),
  utm = right(UTM_COOKIE)
}: CookieProps): Cookie => ({
  getHub: f =>
    pipe(
      hub,
      orElse(e => (typeof f === 'undefined' ? left(e) : right(f)))
    ),

  setHub: SET_HUB_COOKIE_KO,

  getUTM: f =>
    pipe(
      utm,
      orElse(e => (typeof f === 'undefined' ? left(e) : right(f)))
    ),

  setUTM: SET_UTM_COOKIE_KO
});
