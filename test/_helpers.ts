interface WinMockEnv {
  href: string;
  title?: string;
  referrer?: string;
  ContactHubAPI?: string;
}

/**
 * Mocks global Window object and return a function to reset the mock.
 */
export const WIN_MOCK = (E: WinMockEnv): (() => void) => {
  (global as any).window = {
    ContactHubAPI: E.ContactHubAPI,
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
