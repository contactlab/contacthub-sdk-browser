import * as TE from 'fp-ts/TaskEither';
import {Endomorphism, pipe} from 'fp-ts/function';
import * as C from './cookie';
import {customer} from './customer';
import {HttpSvc} from './http';
import {LocationSvc} from './location';
import {Effect} from './program';
import {UuisSvc} from './uuid';

export interface ConfigEnv extends HttpSvc, C.CookieSvc, LocationSvc, UuisSvc {}

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

export const config =
  (E: ConfigEnv): Config =>
  options =>
    pipe(
      checkOptions(options),
      TE.chain(opts => {
        const OE = {...E, options: opts};

        return pipe(
          E.cookie.getHub(withDefaults(OE)),
          TE.map(prepareCHCookie(OE)),
          TE.chain(_ch => E.cookie.setHub(_ch, {expires: 365}))
        );
      }),
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

interface WithOptionsEnv extends ConfigEnv {
  options: ConfigOptions;
}

const withDefaults = (E: WithOptionsEnv): C.HubCookie => ({
  ...E.options,
  sid: E.uuid.v4(),
  debug: E.options.debug || false,
  context: E.options.context || 'WEB',
  contextInfo: E.options.contextInfo || {}
});

const prepareCHCookie =
  (E: WithOptionsEnv): Endomorphism<C.HubCookie> =>
  ch => {
    // check if the auth token has changed
    const _ch = E.options.token === ch.token ? ch : ({} as C.HubCookie);

    _ch.sid = _ch.sid || E.uuid.v4();
    _ch.token = E.options.token;
    _ch.workspaceId = E.options.workspaceId;
    _ch.nodeId = E.options.nodeId;
    _ch.context = E.options.context ?? ch.context;
    _ch.contextInfo = E.options.contextInfo ?? ch.contextInfo;
    _ch.debug = E.options.debug ?? ch.debug;

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
