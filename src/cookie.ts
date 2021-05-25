import * as E from 'fp-ts/Either';
import {IO} from 'fp-ts/IO';
import * as IOE from 'fp-ts/IOEither';
import {parse} from 'fp-ts/Json';
import {pipe} from 'fp-ts/function';
import Cookies from 'js-cookie';

export interface Decoder<A> {
  (u: unknown): E.Either<Error, A>;
}

interface CookieProps<A> {
  decoder: Decoder<A>;
  name: IO<string>;
  toError: () => Error;
}

export interface Cookie<A> {
  get: IOE.IOEither<Error, A>;

  // eslint-disable-next-line @typescript-eslint/ban-types
  set: <T extends object>( // <-- we need this to be compliant with `js-cookie` API
    value: string | T,
    options?: Cookies.CookieAttributes
  ) => IOE.IOEither<Error, void>;
}

export const cookie = <A>({
  decoder,
  name,
  toError
}: CookieProps<A>): Cookie<A> => ({
  get: pipe(
    IOE.rightIO(name),
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
      IOE.rightIO(name),
      IOE.chain(n =>
        IOE.tryCatch(
          () => {
            Cookies.set(n, v, o);
          },
          e => new Error(`Something went wrong: ${e}`)
        )
      )
    )
});
