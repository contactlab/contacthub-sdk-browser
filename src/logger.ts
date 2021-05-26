import {IO} from 'fp-ts/IO';
import {constVoid} from 'fp-ts/function';
import {GlobalEnv} from './global';

interface LoggerEnv extends GlobalEnv {}

export interface Logger {
  logger: {
    error: (error: Error) => IO<void>;
  };
}

export const logger = (Env: LoggerEnv): Logger => ({
  logger: {
    error: e => {
      if (!Env.window.console) {
        return constVoid;
      }

      return () =>
        Env.window.console.error('[DEBUG] @contactlab/sdk-browser', e.message);
    }
  }
});
