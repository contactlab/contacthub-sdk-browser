import {IO} from 'fp-ts/IO';

export interface LocationSvc {
  location: Location;
}

export interface Location {
  /**
   * Gets Location data of provided Window.
   */
  data: IO<Window['location']>;

  /**
   * Reads query parameter value from url.
   */
  qp: (name: string) => string | undefined;
}

export const location = (): Location => ({
  data: () => window.location,

  qp: name => {
    const match = new RegExp(`[?&]${name}=([^&]*)`).exec(window.location.href);
    const val = match && decodeURIComponent(match[1].replace(/\+/g, ' '));

    return val || undefined;
  }
});
