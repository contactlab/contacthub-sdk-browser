/**
 * Service to handle global configurations.
 *
 * @since 2.2.0
 */

import {IO} from 'fp-ts/IO';

interface WithVars extends Window {
  ContactHubObject?: string;
  ContactHubAPI?: string;
  ContactHubCookie?: string;
  ContactHubUtmCookie?: string;
  ContactHubClabId?: string;
}

/**
 * @category capabilities
 * @since 2.2.0
 */
export interface GlobalsSvc {
  globals: Globals;
}

/**
 * Defines the `Globals` service capabilities.
 *
 * @category model
 * @since 2.2.0
 */
export type Globals = IO<{
  chName: string;
  apiURL: string;
  cookieName: string;
  utmCookieName: string;
  clabIdName: string;
}>;

/**
 * Live instance of `Globals` service.
 *
 * @category instances
 * @since 2.2.0
 */
export const globals: Globals = () => {
  const win = window as WithVars;

  return {
    apiURL: win.ContactHubAPI ?? 'https://api.contactlab.it/hub/v1',
    chName: win.ContactHubObject ?? 'ch',
    clabIdName: win.ContactHubClabId ?? 'clabId',
    cookieName: win.ContactHubCookie ?? '_ch',
    utmCookieName: win.ContactHubUtmCookie ?? '_chutm'
  };
};
