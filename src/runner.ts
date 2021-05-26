import * as E from 'fp-ts/Either';
import * as IOE from 'fp-ts/IOEither';
import * as TE from 'fp-ts/TaskEither';
import {constVoid, pipe} from 'fp-ts/function';
import {LoggerSvc} from './logger';

interface RunnerEnv extends LoggerSvc {}

export interface Runner {
  run: (p: IOE.IOEither<Error, void>) => void;
  runAsync: (p: TE.TaskEither<Error, void>) => void;
}

export const runner = (Env: RunnerEnv): Runner => ({
  run: p =>
    pipe(
      p,
      IOE.fold(
        e => Env.logger.error(e),
        () => constVoid
      )
    )(),

  runAsync: p => {
    p()
      .then(E.fold(e => Env.logger.error(e)(), constVoid))
      .catch(e => Env.logger.error(e)()); // catch all
  }
});
