/**
 * Service to handle a "program" execution.
 *
 * @since 2.0.0
 */

import {fold} from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import {constVoid} from 'fp-ts/function';

// --- Aliases for better documentation
import TaskEither = TE.TaskEither;
// ---

/**
 * Defines an "effect" as an asyncronous operation that can fail (with an `Error`) or succeed with some value (`void` by default).
 *
 * @category model
 * @since 2.0.0
 */
export interface Effect<A = void> extends TaskEither<Error, A> {}

/**
 * @category capabilities
 * @since 2.0.0
 */
export interface ProgramSvc {
  program: Program;
}

/**
 * Defines the `Program` service capabilities.
 *
 * @category model
 * @since 2.0.0
 */
export interface Program {
  run: (p: Effect) => Promise<void>;
}

/**
 * Live instance of `Program` service.
 *
 * @category instances
 * @since 2.0.0
 */
export const program = (): Program => {
  const error = (e: Error): void =>
    // eslint-disable-next-line no-console
    console.error('[DEBUG] @contactlab/sdk-browser', e.message);

  return {
    run: p => p().then(fold(error, constVoid)).catch(error) // catch all
  };
};
