/**
 * Service to handle http requests.
 *
 * @since 2.0.0
 */

import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import {pipe} from 'fp-ts/function';

// --- Aliases for better documentation
import TaskEither = TE.TaskEither;
// ---

type FetchInstance = typeof fetch;

interface WithVars extends Window {
  ContactHubAPI?: string;
}

/**
 * @category capabilities
 * @since 2.0.0
 */
export interface HttpSvc {
  http: Http;
}

/**
 * Defines the `Http` service capabilities.
 *
 * @category model
 * @since 2.0.0
 */
export interface Http {
  post: <A>(path: string, body: A, token: string) => TaskEither<Error, unknown>;

  patch: <A>(
    path: string,
    body: A,
    token: string
  ) => TaskEither<Error, unknown>;
}

/**
 * Live instance of `Http` service.
 *
 * @category instances
 * @since 2.0.0
 */
export const http = (F: FetchInstance): Http => {
  const apiUrl = (): string =>
    (window as WithVars).ContactHubAPI ?? 'https://api.contactlab.it/hub/v1';

  const r = request(F);

  return {
    post: (p, b, t) =>
      pipe(
        stringify(b),
        TE.chain(body =>
          r(`${apiUrl()}${p}`, {method: 'POST', body, headers: headers(t)})
        )
      ),

    patch: (p, b, t) =>
      pipe(
        stringify(b),
        TE.chain(body =>
          r(`${apiUrl()}${p}`, {method: 'PATCH', body, headers: headers(t)})
        )
      )
  };
};

// --- Helpers
const request =
  (F: FetchInstance) =>
  (url: string, options: RequestInit): TaskEither<Error, unknown> =>
  () =>
    F(url, options)
      .then(resp => {
        if (!resp.ok) {
          throw new Error(`Request responded with status code ${resp.status}`);
        }

        return resp
          .text()
          .then(v => E.right(JSON.parse(v.length === 0 ? '{}' : v)));
      })
      .catch(e => E.left(e));

const stringify = <A>(a: A): TaskEither<Error, string> => {
  try {
    return TE.right(JSON.stringify(a));
  } catch (e) {
    return TE.left(E.toError(e));
  }
};

const headers = (token: string): Record<string, string> => ({
  Accept: 'application/json',
  'Contactlab-ClientId': 'sdk-browser',
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
});
