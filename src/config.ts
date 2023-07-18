/**
 * @since 2.0.0
 */

import {Endomorphism} from 'fp-ts/Endomorphism';
import * as TE from 'fp-ts/TaskEither';
import {pipe} from 'fp-ts/function';
import * as C from './cookie';
import {customer} from './customer';
import {GlobalsSvc} from './globals';
import {HttpSvc} from './http';
import {LocationSvc} from './location';
import {Effect} from './program';
import {UuisSvc} from './uuid';

// --- Aliases for better documentation
import CookieSvc = C.CookieSvc;
// ---

/**
 * Defines capabilities and services required by the `config` method in order to work.
 *
 * @category capabilities
 * @since 2.0.0
 */
export interface ConfigEnv
  extends GlobalsSvc,
    HttpSvc,
    CookieSvc,
    LocationSvc,
    UuisSvc {}

/**
 * Defines the `config` method signature.
 *
 * @category model
 * @since 2.0.0
 */
export interface Config {
  (options: ConfigOptions): Effect;
}

/**
 * Defines the `config` method options.
 *
 * @category model
 * @since 2.0.0
 */
export interface ConfigOptions {
  token: string;
  workspaceId: string;
  nodeId: string;
  target?: 'ENTRY' | 'AGGREGATE';
  context?: string;
  contextInfo?: Record<string, unknown>;
  debug?: boolean;
  aggregateToken?: string;
  aggregateNodeId?: string;
}

/**
 * SDK's configuration method: sets provided configuration and persists them in a cookie (with defaults).
 *
 * It also handles UTM values passed via query parameters and sets current customer if a `clabId` query param is provided.
 *
 * @category methods
 * @since 2.0.0
 */
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
        const id = E.location.qp(E.globals().clabIdName);

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
  target: 'ENTRY',
  sid: E.uuid.v4(),
  debug: E.options.debug ?? false,
  context: E.options.context ?? 'WEB',
  contextInfo: E.options.contextInfo ?? {}
});

const prepareCHCookie =
  (E: WithOptionsEnv): Endomorphism<C.HubCookie> =>
  ch => {
    const target = E.location.qp('target');

    // check if the auth token has changed
    const _ch = E.options.token === ch.token ? ch : ({} as C.HubCookie);

    _ch.sid = _ch.sid || E.uuid.v4();
    _ch.token = E.options.token;
    _ch.workspaceId = E.options.workspaceId;
    _ch.nodeId = E.options.nodeId;
    _ch.context = E.options.context ?? ch.context;
    _ch.contextInfo = E.options.contextInfo ?? ch.contextInfo;
    _ch.debug = E.options.debug ?? ch.debug;
    _ch.aggregateNodeId = E.options.aggregateNodeId ?? ch.aggregateNodeId;
    _ch.aggregateToken = E.options.aggregateToken ?? ch.aggregateToken;

    // set target from query string if any
    _ch.target = isTarget(target) ? target : E.options.target ?? ch.target;

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

const isTarget = (s?: string): s is NonNullable<C.HubCookie['target']> =>
  s === 'ENTRY' || s === 'AGGREGATE';
