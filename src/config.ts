import * as IO from 'fp-ts/IO';
import * as TE from 'fp-ts/TaskEither';
import {Endomorphism, pipe} from 'fp-ts/function';
import {v4 as uuidv4} from 'uuid';
import * as C from './cookie';
import {customer} from './customer';
import {HttpSvc} from './http';
import {LocationSvc} from './location';
import {Effect} from './program';

export interface ConfigEnv extends HttpSvc, C.CookieSvc, LocationSvc {}

export interface Config {
  (options: ConfigOptions): Effect;
}

export interface ConfigOptions {
  token: string;
  workspaceId: string;
  nodeId: string;
  context?: string;
  contextInfo?: Record<string, unknown>;
  debug?: boolean;
}

const newSessionId: IO.IO<string> = () => uuidv4();

export const config =
  (E: ConfigEnv): Config =>
  options =>
    pipe(
      checkOptions(options),
      TE.chain(opts =>
        pipe(
          E.cookie.getHub(withDefaults(opts)),
          TE.map(prepareCHCookie(opts)),
          TE.chain(_ch => E.cookie.setHub(_ch, {expires: 365}))
        )
      ),
      TE.chain(() =>
        pipe(
          E.cookie.getUTM({}),
          TE.map(prepareUTMCookie(E)),
          TE.chain(_chutm => E.cookie.setUTM(_chutm, {expires: 1 / 48}))
        )
      ),
      TE.chain(() => {
        const id = E.location.qp('clabId');

        return typeof id === 'undefined'
          ? TE.right(undefined)
          : customer(E)({id});
      })
    );

// --- Helpers
const checkOptions = TE.fromPredicate<Error, ConfigOptions>(
  o => 'workspaceId' in o && 'nodeId' in o && 'token' in o,
  () => new Error('Invalid ContactHub configuration')
);

const withDefaults = (o: ConfigOptions): C.HubCookie => ({
  ...o,
  sid: newSessionId(),
  debug: o.debug || false,
  context: o.context || 'WEB',
  contextInfo: o.contextInfo || {}
});

const prepareCHCookie =
  (o: ConfigOptions): Endomorphism<C.HubCookie> =>
  ch => {
    // check if the auth token has changed
    const _ch = o.token === ch.token ? ch : ({} as C.HubCookie);

    _ch.sid = _ch.sid || newSessionId();
    _ch.token = o.token ?? ch.token;
    _ch.workspaceId = o.workspaceId ?? ch.workspaceId;
    _ch.nodeId = o.nodeId ?? ch.nodeId;
    _ch.context = o.context ?? ch.context;
    _ch.contextInfo = o.contextInfo ?? ch.contextInfo;
    _ch.debug = o.debug ?? ch.debug;

    return _ch;
  };

const prepareUTMCookie =
  (E: ConfigEnv): Endomorphism<C.UTMCookie> =>
  chutm => {
    const _chutm = {...chutm};

    // read Google Analytics UTM query params if present
    const utmSource = E.location.qp('utm_source');

    if (utmSource) {
      // Store UTM values in the _chutm cookie, overwriting any previous UTM value.
      _chutm.utm_source = utmSource;
      _chutm.utm_medium = E.location.qp('utm_medium');
      _chutm.utm_term = E.location.qp('utm_term');
      _chutm.utm_content = E.location.qp('utm_content');
      _chutm.utm_campaign = E.location.qp('utm_campaign');
    }

    return _chutm;
  };
