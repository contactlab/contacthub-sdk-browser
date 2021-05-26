import * as IO from 'fp-ts/IO';
import * as IOE from 'fp-ts/IOEither';
import {constVoid, Endomorphism, pipe} from 'fp-ts/function';
import {v4 as uuidv4} from 'uuid';
import {Location} from './location';
import {Runner} from './runner';
import {SDKCookie, CHCookie} from './sdk-cookie';
import {UTMCookie, CHUtmCookie} from './utm-cookie';

export interface ConfigEnv extends SDKCookie, UTMCookie, Location, Runner {}

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
          Env.cookie.get,
          IOE.alt(() => IOE.right(withDefaults(opts))),
          IOE.map(prepareCHCookie(opts)),
          IOE.chain(
            _ch => Env.cookie.set(_ch, {expires: 365}) // expires in 1 year
          )
        )
      ),
      IOE.chain(() =>
        pipe(
          Env.utmCookie.get,
          IOE.map(prepareUTMCookie(Env)),
          IOE.chain(
            _chutm => Env.utmCookie.set(_chutm, {expires: 1 / 48}) // expires in 30 mins
          ),
          IOE.alt(() => IOE.right(constVoid())) // `constVoid` needed to generate a `void` value
        )
      ),
      // TODO: CUSTOMER FUNCTION
      // IOE.chain(() => {
      //     // if (clabId) {
      //     //   customer({id: clabId});
      //     // }
      // })
      Env.run
    );

// --- Helpers
const checkOptions = IOE.fromPredicate<Error, ConfigOptions>(
  o => 'workspaceId' in o && 'nodeId' in o && 'token' in o,
  () => new Error('Invalid ContactHub configuration')
);

const withDefaults = (o: ConfigOptions): CHCookie => ({
  ...o,
  sid: newSessionId(),
  debug: o.debug || false,
  context: o.context || 'WEB',
  contextInfo: o.contextInfo || {}
});

const prepareCHCookie =
  (o: ConfigOptions): Endomorphism<CHCookie> =>
  ch =>
    o.token === ch.token // check if the auth token has changed
      ? ch
      : {
          sid: newSessionId(),
          token: o.token,
          workspaceId: o.workspaceId ?? ch.workspaceId,
          nodeId: o.nodeId ?? ch.nodeId,
          context: o.context ?? ch.context,
          contextInfo: o.contextInfo ?? ch.contextInfo,
          debug: o.debug ?? ch.debug
        };

const prepareUTMCookie =
  (Env: ConfigEnv): Endomorphism<CHUtmCookie> =>
  chutm => {
    const _chutm: CHUtmCookie = {...chutm};

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
