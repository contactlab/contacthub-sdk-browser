import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import {pipe} from 'fp-ts/function';

type FetchInstance = typeof fetch;

interface WithVars extends Window {
  ContactHubAPI?: string;
}

export interface Http {
  post: <A>(
    path: string,
    body: A,
    token: string
  ) => TE.TaskEither<Error, unknown>;

  patch: <A>(
    path: string,
    body: A,
    token: string
  ) => TE.TaskEither<Error, unknown>;
}

export interface HttpSvc {
  http: Http;
}

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
  (url: string, options: RequestInit): TE.TaskEither<Error, unknown> =>
  () =>
    F(url, options)
      .then(resp => {
        if (!resp.ok) {
          throw new Error(`Request responded with status code ${resp.status}`);
        }

        return resp.text().then(v => {
          const result = JSON.parse(v.length === 0 ? '{}' : v);

          return E.right(result);
        });
      })
      .catch(e => E.left(e));

const stringify = <A>(a: A): TE.TaskEither<Error, string> => {
  try {
    return TE.right(JSON.stringify(a));
  } catch (e) {
    return TE.left(e);
  }
};

const headers = (token: string): Record<string, string> => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
});
