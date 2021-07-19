/**
 * Service to handle page's `Location`.
 *
 * @since 2.0.0
 */

import {IO} from 'fp-ts/IO';

/**
 * @category capabilities
 * @since 2.0.0
 */
export interface LocationSvc {
  location: Location;
}

/**
 * Defines the `Location` service capabilities.
 *
 * @category model
 * @since 2.0.0
 */
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

/**
 * Live instance of `Location` service.
 *
 * @category instances
 * @since 2.0.0
 */
export const location = (): Location => ({
  data: () => window.location,

  qp: name => {
    const match = new RegExp(`[?&]${name}=([^&]*)`).exec(window.location.href);
    const val = match && decodeURIComponent(match[1].replace(/\+/g, ' '));

    return val || undefined;
  }
});
