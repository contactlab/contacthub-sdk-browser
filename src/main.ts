/**
 * @since 2.0.0
 */

import {ConfigOptions, ConfigEnv, config} from './config';
import {CustomerData, CustomerEnv, customer} from './customer';
import {EventOptions, EventEnv, event} from './event';
import {GlobalsSvc} from './globals';
import {Effect, ProgramSvc} from './program';

/**
 * Defines capabilities and services required by the SDK's `main` function.
 *
 * @category capabilities
 * @since 2.0.0
 */
export interface MainEnv
  extends GlobalsSvc,
    ProgramSvc,
    ConfigEnv,
    CustomerEnv,
    EventEnv {}

/**
 * SDK signature.
 *
 * @category model
 * @since 2.0.0
 */
export interface SDK {
  (method: 'config', options: ConfigOptions): Promise<void>;
  (method: 'event', options: EventOptions): Promise<void>;
  (method: 'customer', options?: CustomerData): Promise<void>;
  q?: unknown[];
}

/**
 * Main function that starts and makes available the SDK features.
 *
 * @category methods
 * @since 2.0.0
 */
export const main = (E: MainEnv): void => {
  const sdk: SDK = (
    method: 'config' | 'event' | 'customer',
    options: unknown
  ) => {
    let effect: Effect;

    switch (method) {
      case 'config': {
        effect = config(E)(options as ConfigOptions);
        break;
      }

      case 'customer': {
        effect = customer(E)(options as CustomerData);
        break;
      }

      case 'event': {
        effect = event(E)(options as EventOptions);
        break;
      }
    }

    return E.program.run(effect);
  };

  // Necessary evil...
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
  const win = window as any;
  const varName = E.globals().chName;
  const ch = win[varName];

  if (ch?.q) {
    const q: any[] = ch.q;
    q.map(command => sdk(command[0], command[1]));
  }

  win[varName] = sdk;
  /* eslint-enable @typescript-eslint/no-explicit-any */
};
