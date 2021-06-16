import {orElse, left, right, TaskEither} from 'fp-ts/TaskEither';
import {constVoid, pipe} from 'fp-ts/function';
import {Cookie, HubCookie, UTMCookie} from '../../src/cookie';
import * as H from '../_helpers';

type MockedSetHub = jest.MockedFunction<Cookie['setHub']>;
type MockedSetUTM = jest.MockedFunction<Cookie['setUTM']>;

export const SET_HUB_COOKIE: MockedSetHub = jest.fn((_v, _o) =>
  right(constVoid())
);
export const SET_HUB_COOKIE_KO: MockedSetHub = jest.fn((_v, _o) =>
  left(new Error('Cookie "_ch" cannot be set'))
);

export const SET_UTM_COOKIE: MockedSetUTM = jest.fn((_v, _o) =>
  right(constVoid())
);
export const SET_UTM_COOKIE_KO: MockedSetUTM = jest.fn((_v, _o) =>
  left(new Error('Cookie "_chutm" cannot be set'))
);

export const HUB_COOKIE: HubCookie = {
  token: H.TOKEN,
  workspaceId: H.WSID,
  nodeId: H.NID,
  debug: false,
  context: 'WEB',
  contextInfo: {},
  sid: '5ed6cae6-e956-4da1-9b06-c971887ed756'
};

export const HUB_COOKIE_CID: HubCookie = {...HUB_COOKIE, customerId: H.CID};

export const UTM_COOKIE: UTMCookie = {
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
}: CookieProps): Cookie => {
  let _hub = hub;
  let _utm = utm;

  return {
    getHub: f =>
      pipe(
        _hub,
        orElse(e => (typeof f === 'undefined' ? left(e) : right(f)))
      ),

    setHub: (v, o) =>
      pipe(SET_HUB_COOKIE(v, o), x => {
        _hub = right(v);
        return x;
      }),

    getUTM: f =>
      pipe(
        _utm,
        orElse(e => (typeof f === 'undefined' ? left(e) : right(f)))
      ),

    setUTM: (v, o) =>
      pipe(SET_UTM_COOKIE(v, o), x => {
        _utm = right(v);
        return x;
      })
  };
};

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
