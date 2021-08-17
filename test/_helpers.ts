import Cookies from 'js-cookie';

export const CH = '_ch';
export const UTM = '_chutm';
export const WSID = 'wsid';
export const NID = 'nid';
export const TOKEN = 'TOKEN';
export const CID = 'abcd1234';

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

/**
 * Waits for async command execution.
 */
export const wait = (): Promise<void> =>
  new Promise(resolve => {
    setTimeout(() => resolve(undefined), 2);
  });

// --- Cookie utilities
export const removeCookie = Cookies.remove;

export const getCookie = Cookies.get;

export const getCookieJSON = (name: string): any =>
  JSON.parse(Cookies.get(name) || '{}');

export const setCookieJSON = (name: string, value: any): string | undefined =>
  Cookies.set(name, JSON.stringify(value));
