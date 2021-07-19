/**
 * Service to handle a UUID generation.
 *
 * @since 2.0.0
 */

import {IO} from 'fp-ts/IO';
import {v4 as uuidv4} from 'uuid';

/**
 * @category capabilities
 * @since 2.0.0
 */
export interface UuisSvc {
  uuid: Uuid;
}

/**
 * Defines the `Uuid` service capabilities.
 *
 * @category model
 * @since 2.0.0
 */
export interface Uuid {
  v4: IO<string>;
}

/**
 * Live instance of `Uuid` service.
 *
 * @category instances
 * @since 2.0.0
 */
export const uuid = (): Uuid => ({
  v4: () => uuidv4()
});
