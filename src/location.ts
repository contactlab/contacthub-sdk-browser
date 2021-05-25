import {IO} from 'fp-ts/IO';

interface LocationEnv {
  window: Window & typeof globalThis;
}

export interface Location {
  location: IO<Window['location']>;

  queryParam: (name: string) => string | undefined;
}

export const location = (Env: LocationEnv): Location => ({
  location: () => Env.window.location,

  queryParam: name => {
    const match = new RegExp(`[?&]${name}=([^&]*)`).exec(
      Env.window.location.href
    );
    const val = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    return val || undefined;
  }
});
