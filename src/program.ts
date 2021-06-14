import {fold} from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import {constVoid} from 'fp-ts/function';

export interface Effect<A = void> extends TE.TaskEither<Error, A> {}

export interface ProgramSvc {
  program: Program;
}

export interface Program {
  run: (p: Effect) => Promise<void>;
}

export const program = (): Program => {
  const error = (e: Error): void =>
    // eslint-disable-next-line no-console
    console.error('[DEBUG] @contactlab/sdk-browser', e.message);

  return {
    run: p => p().then(fold(error, constVoid)).catch(error) // catch all
  };
};
