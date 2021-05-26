import {IO} from 'fp-ts/IO';
import {constVoid} from 'fp-ts/function';

export interface LoggerSvc {
  logger: Logger;
}

export interface Logger {
  error: (error: Error) => IO<void>;
}

export const logger: Logger = {
  error: e => {
    if (!window.console) {
      return constVoid;
    }

    return () =>
      window.console.error('[DEBUG] @contactlab/sdk-browser', e.message);
  }
};
