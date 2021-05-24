import * as E from 'fp-ts/Either';
import * as IOE from 'fp-ts/IOEither';
import {parse} from 'fp-ts/Json';
import {pipe} from 'fp-ts/function';
import Cookies from 'js-cookie';
import {WithWindow} from './win';

export interface Decoder<A> {
  (u: unknown): E.Either<Error, A>;
}

interface CookieProps<A, N extends string> {
  decoder: Decoder<A>;
  name: N;
  toError: () => Error;
}

// This MUST be exported in order to avoid TS error #4023
export interface CookieEnv<N extends string>
  extends WithWindow<{[K in N]?: string}> {}

export interface Cookie<A> {
  get: IOE.IOEither<Error, A>;

  // eslint-disable-next-line @typescript-eslint/ban-types
  set: <T extends object>( // <-- we need this to be compliant with `js-cookie` API
    value: string | T,
    options?: Cookies.CookieAttributes
  ) => IOE.IOEither<Error, void>;
}

export const cookie =
  <A, N extends string>({decoder, name, toError}: CookieProps<A, N>) =>
  (Env: CookieEnv<N>): Cookie<A> => {
    const cookieName: IOE.IOEither<Error, string> = IOE.rightIO(
      () => Env.window[name] ?? '_ch'
    );

    return {
      get: pipe(
        cookieName,
        IOE.chainEitherK(n =>
          pipe(
            Cookies.get(n),
            E.fromNullable(toError()),
            E.chain(parse),
            E.mapLeft(toError),
            E.chain(decoder)
          )
        )
      ),

      set: (v, o) =>
        pipe(
          cookieName,
          IOE.chain(n =>
            IOE.tryCatch(
              () => {
                Cookies.set(n, v, o);
              },
              e => new Error(`Something went wrong: ${e}`)
            )
          )
        )
    };
  };
