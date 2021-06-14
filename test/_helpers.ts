import {ConfigOptions} from '../src/config';

export const CH = '_ch';
export const UTM = '_chutm';
// export const API = 'https://api.contactlab.it/hub/v1';
export const WSID = 'workspace_id';
export const NID = 'node_id';
export const TOKEN = 'ABC123';
export const CID = 'abcd';
export const CONFIG: ConfigOptions = {
  workspaceId: WSID,
  nodeId: NID,
  token: TOKEN
};

interface WinMockEnv {
  href: string;
  title?: string;
  referrer?: string;
  ContactHubAPI?: string;
  ContactHubCookie?: string;
  ContactHubUtmCookie?: string;
}

/**
 * Mocks global Window object and return a function to reset the mock.
 */
export const WIN_MOCK = (E: WinMockEnv): (() => void) => {
  (global as any).window = {
    ContactHubAPI: E.ContactHubAPI,
    ContactHubCookie: E.ContactHubCookie,
    ContactHubUtmCookie: E.ContactHubUtmCookie,
    document: {
      title: E.title || '',
      referrer: E.referrer || ''
    },
    location: {
      href: E.href,
      pathname: 'some/path'
    }
  } as unknown as Window;

  return () => delete (global as any).window;
};
