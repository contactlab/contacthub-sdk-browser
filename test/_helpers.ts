/**
 * Mocks global Window object and return a function to reset the mock.
 */
export const WIN_MOCK = (href: string): (() => void) => {
  (global as any).window = {
    location: {
      href,
      pathname: 'some/path'
    }
  } as unknown as Window;

  return () => delete (global as any).window;
};
