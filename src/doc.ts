/**
 * Service to handle page's `Document` data.
 *
 * @since 2.0.0
 */

import {IO} from 'fp-ts/IO';

/**
 * @category capabilities
 * @since 2.0.0
 */
export interface DocumentSvc {
  document: Document;
}

/**
 * Defines the `Document` service capabilities.
 *
 * @category model
 * @since 2.0.0
 */
export interface Document {
  title: IO<string>;
  referrer: IO<string>;
}

/**
 * Live instance of `Document` service.
 *
 * @category instances
 * @since 2.0.0
 */
export const document = (): Document => ({
  title: () => window.document.title,

  referrer: () => window.document.referrer
});
