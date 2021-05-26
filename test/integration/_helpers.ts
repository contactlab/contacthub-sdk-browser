/**
 * Mocked Ajax calls return immediately but need a short setTimeout to avoid
 * race conditions. 0 ms works fine on all browsers except IE 10 which requires
 * at least 2 ms.
 */
export const whenDone = (f: () => void): void => {
  setTimeout(() => f(), 2);
};

/**
 * Shorthand for globally defined SDK function
 */
export const _ch = window.ch;

/**
 * Shorthand for globallly available `fetchMock` sandbox instance
 */
export const _fetchMock = window.fetchMock;
