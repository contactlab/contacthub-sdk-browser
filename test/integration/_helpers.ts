import {ConfigOptions} from '../../src/config';

export const CH = '_ch';
export const UTM = '_chutm';
export const API = 'https://api.contactlab.it/hub/v1';
export const WSID = 'workspace_id';
export const NID = 'node_id';
export const TOKEN = 'ABC123';
export const CONFIG: ConfigOptions = {
  workspaceId: WSID,
  nodeId: NID,
  token: TOKEN
};

/**
 * Mocked Ajax calls return immediately but need a short setTimeout to avoid
 * race conditions. 0 ms works fine on all browsers except IE 10 which requires
 * at least 2 ms.
 */
export const whenDone = (f: () => void, done?: () => void): void => {
  setTimeout(() => {
    f();

    return done ? done() : undefined;
  }, 2);
};

/**
 * Shorthand for globally defined SDK function
 */
export const _ch = window.ch;

/**
 * Shorthand for globallly available `fetchMock` sandbox instance
 */
export const _fetchMock = window.fetchMock;
