import * as E from 'fp-ts/Either';
import {Cookie, Decoder, cookie} from './cookie';

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

export interface SDKCookie {
  cookie: Cookie<CHCookie>;
}

const CHCookieDecoder: Decoder<CHCookie> = u => {
  const o = u as CHCookie;

  if (!(o.workspaceId && o.nodeId && o.token && o.sid)) {
    return E.left(toError());
  }

  o.debug = o.debug || false;
  o.context = o.context || 'WEB';
  o.contextInfo = o.contextInfo || {};

  return E.right(o);
};

const toError = (): Error =>
  new Error('Missing required ContactHub configuration.');

export const sdkCookie = cookie({
  decoder: CHCookieDecoder,
  name: 'ContactHubCookie',
  toError
});
