/**
 * Create a globally available mocked version of `fetch` with `fetchMock.sandbox()`
 */

import FM from 'fetch-mock';

const sb = FM.sandbox();

sb.config.overwriteRoutes = true;

(window as any).fetchMock = sb;
window.fetch = sb;
