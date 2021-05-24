import {IO} from 'fp-ts/IO';
import {constVoid} from 'fp-ts/function';
import {WithWindow} from './win';

interface LoggerEnv extends WithWindow {}

export interface Logger {
  log: (debug: boolean, error: Error) => IO<void>;
}

export const logger = (Env: LoggerEnv): Logger => ({
  log: (d, e) => {
    if (!d || !Env.window.console) {
      return constVoid;
    }

    // const msg =
    //   typeof error.status !== 'undefined' && typeof error.response !== 'undefined'
    //     ? error.response
    //     : error;

    return () =>
      Env.window.console.error('[DEBUG] @contactlab/sdk-browser', e.message);
  }
});
