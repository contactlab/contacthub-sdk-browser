import * as E from 'fp-ts/Either';
import {Cookie, Decoder, cookie} from './cookie';
import {Global} from './global';

interface SDKCookieEnv extends Global {}

export interface SDKCookie {
  cookie: Cookie<CHCookie>;
}

export interface CHCookie {
  token: string;
  workspaceId: string;
  nodeId: string;
  debug: boolean;
  context: string;
  contextInfo: Record<string, unknown>;
  sid: string;
  customerId?: string;
  hash?: string;
}

export const sdkCookie = (Env: SDKCookieEnv): SDKCookie => ({
  cookie: cookie({decoder, name: Env.cookieName, toError})
});

// --- Helpers
const decoder: Decoder<CHCookie> = u => {
  const o = u as CHCookie;

  return 'workspaceId' in o && 'nodeId' in o && 'token' in o && 'sid' in o
    ? E.right(o)
    : E.left(toError());
};

const toError = (): Error =>
  new Error('Missing required ContactHub configuration.');