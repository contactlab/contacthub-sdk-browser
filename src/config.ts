import * as IO from 'fp-ts/IO';
import * as IOE from 'fp-ts/IOEither';
import {Endomorphism, pipe} from 'fp-ts/function';
import {v4 as uuidv4} from 'uuid';
import * as C from './cookie';
import {customer} from './customer';
import {Global} from './global';
import {Location} from './location';
import {Runner} from './runner';

export interface ConfigEnv extends C.CookieSvc, Location, Global, Runner {}

export interface Config {
  (options: ConfigOptions): void;
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
  (Env: ConfigEnv): Config =>
  options =>
    pipe(
      checkOptions(options),
      IOE.chain(opts =>
        pipe(
          Env.cookie.get(Env.cookieName(), C.CHDecoder, withDefaults(opts)),
          IOE.map(prepareCHCookie(opts)),
          IOE.chain(
            _ch => Env.cookie.set(Env.cookieName(), _ch, {expires: 365}) // expires in 1 year
          )
        )
      ),
      IOE.chain(() =>
        pipe(
          Env.cookie.get(Env.utmCookieName(), C.UTMDecoder, {}),
          IOE.map(prepareUTMCookie(Env)),
          IOE.chain(
            _chutm =>
              Env.cookie.set(Env.utmCookieName(), _chutm, {expires: 1 / 48}) // expires in 30 mins
          )
        )
      ),
      IOE.chain(() =>
        IOE.rightIO(() => {
          const id = Env.queryParam('clabId');

          return typeof id === 'undefined' ? undefined : customer(Env)({id});
        })
      ),
      Env.run
    );

// --- Helpers
const checkOptions = IOE.fromPredicate<Error, ConfigOptions>(
  o => 'workspaceId' in o && 'nodeId' in o && 'token' in o,
  () => new Error('Invalid ContactHub configuration')
);

const withDefaults = (o: ConfigOptions): C.CHCookie => ({
  ...o,
  sid: newSessionId(),
  debug: o.debug || false,
  context: o.context || 'WEB',
  contextInfo: o.contextInfo || {}
});

const prepareCHCookie =
  (o: ConfigOptions): Endomorphism<C.CHCookie> =>
  ch => {
    // check if the auth token has changed
    const _ch = o.token === ch.token ? ch : ({} as C.CHCookie);

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
  (Env: ConfigEnv): Endomorphism<C.UTMCookie> =>
  chutm => {
    const _chutm = {...chutm};

    // read Google Analytics UTM query params if present
    const utmSource = Env.queryParam('utm_source');

    if (utmSource) {
      // Store UTM values in the _chutm cookie, overwriting any previous UTM value.
      _chutm.utm_source = utmSource;
      _chutm.utm_medium = Env.queryParam('utm_medium');
      _chutm.utm_term = Env.queryParam('utm_term');
      _chutm.utm_content = Env.queryParam('utm_content');
      _chutm.utm_campaign = Env.queryParam('utm_campaign');
    }

    return _chutm;
  };
