import * as IO from 'fp-ts/IO';
import * as IOE from 'fp-ts/IOEither';
import {Endomorphism, constVoid, pipe} from 'fp-ts/function';
import {v4 as uuidv4} from 'uuid';
import {Logger} from './logger';
import {SDKCookie, CHCookie} from './sdk-cookie';
import {UTMCookie, CHUtmCookie} from './utm-cookie';
import {WithWindow} from './win';

interface ConfigEnv extends Logger, SDKCookie, UTMCookie, WithWindow {}

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
      IOE.chain(() =>
        pipe(
          Env.cookie.get,
          IOE.map(prepareCHCookie(options)),
          IOE.chain(
            _ch => Env.cookie.set(_ch, {expires: 365}) // expires in 1 year
          )
        )
      ),
      IOE.chain(() =>
        pipe(
          Env.utmCookie.get,
          IOE.map(prepareUTMCookie(Env.window.location.href)),
          IOE.chain(
            _chutm => Env.utmCookie.set(_chutm, {expires: 1 / 48}) // expires in 30 mins
          )
        )
      ),
      // TODO: CUSTOMER FUNCTION
      // IOE.chain(() => {
      //     // if (clabId) {
      //     //   customer({id: clabId});
      //     // }
      // })
      IOE.match(e => Env.log(options.debug || false, e)(), constVoid)
    );

const prepareCHCookie =
  (o: ConfigOptions): Endomorphism<CHCookie> =>
  ch =>
    o.token === ch.token
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
  (href: string): Endomorphism<CHUtmCookie> =>
  chutm => {
    const qp = queryParam(href);

    const _chutm: CHUtmCookie = {...chutm};

    // read Google Analytics UTM query params if present
    const utmSource = qp('utm_source');

    if (utmSource) {
      // Store UTM values in the _chutm cookie, overwriting any previous UTM value.
      _chutm.utm_source = utmSource;
      _chutm.utm_medium = qp('utm_medium');
      _chutm.utm_term = qp('utm_term');
      _chutm.utm_content = qp('utm_content');
      _chutm.utm_campaign = qp('utm_campaign');
    }

    return _chutm;
  };

// const allowedConfigOptions = [
//   'token',
//   'workspaceId',
//   'nodeId',
//   'context',
//   'contextInfo',
//   'debug'
// ];

// export const config2 =
//   (Env: ConfigEnv): Config =>
//   options => {
//     if (!(options.workspaceId && options.nodeId && options.token)) {
//       const err = new Error('Invalid ContactHub configuration');

//       Env.log(options.debug || false, err)();

//       throw err;
//     }

//     // get current _ch cookie, if any
//     const currentCookie = cookies.getJSON(cookieName) || {};

//     // check if the auth token has changed
//     const hasTokenChanged = options.token !== currentCookie.token;

//     const _ch = hasTokenChanged ? {} : currentCookie;

//     // generate sid if not already present
//     _ch.sid = _ch.sid || newSessionId();

//     // set all valid option params, keeping current value (if any)
//     const filteredOptions = Object.keys(options)
//       .filter(key => allowedConfigOptions.indexOf(key) !== -1)
//       .reduce((obj, key) => {
//         obj[key] = options[key];
//         return obj;
//       }, {});

//     Object.assign(_ch, filteredOptions);

//     // default values for context and contextInfo
//     _ch.context = _ch.context || 'WEB';
//     _ch.contextInfo = _ch.contextInfo || {};
//     _ch.debug = _ch.debug || false;

//     // set updated cookie
//     cookies.set(cookieName, _ch, {expires: 365}); // expires in 1 year

//     // get current _chutm cookie, if any
//     const _chutm = cookies.getJSON(utmCookieName) || {};

//     // read Google Analytics UTM query params if present
//     const utmSource = getQueryParam('utm_source');

//     if (utmSource) {
//       // Store UTM values in the _chutm cookie, overwriting any previous UTM value.
//       _chutm.utm_source = getQueryParam('utm_source');
//       _chutm.utm_medium = getQueryParam('utm_medium');
//       _chutm.utm_term = getQueryParam('utm_term');
//       _chutm.utm_content = getQueryParam('utm_content');
//       _chutm.utm_campaign = getQueryParam('utm_campaign');
//     }

//     // set updated utm cookie
//     cookies.set(utmCookieName, _chutm, {expires: 1 / 48}); // expires in 30 mins

//     // support special query param clabId
//     const clabId = getQueryParam('clabId');

//     if (clabId) {
//       customer({id: clabId});
//     }
//   };

// --- Helpers
const checkOptions = (
  options: ConfigOptions
): IOE.IOEither<Error, ConfigOptions> =>
  pipe(
    options,
    IOE.fromPredicate(
      o => 'workspaceId' in o && 'nodeId' in o && 'token' in o,
      () => new Error('Invalid ContactHub configuration')
    )
  );

const queryParam =
  (href: string) =>
  (name: string): string | undefined => {
    const match = new RegExp(`[?&]${name}=([^&]*)`).exec(href);
    const val = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    return val || undefined;
  };
