import {ConfigOptions, ConfigEnv, config} from './config';
import {CustomerData, CustomerEnv, customer} from './customer';
import {EventOptions, EventEnv, event} from './event';
import {Effect, ProgramSvc} from './program';

interface MainEnv extends ProgramSvc, ConfigEnv, CustomerEnv, EventEnv {}

export interface SDK {
  (method: 'config', options: ConfigOptions): Promise<void>;
  (method: 'event', options: EventOptions): Promise<void>;
  (method: 'customer', options?: CustomerData): Promise<void>;
}

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
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const win = window as any;
  const varName = win.ContactHubObject ?? 'ch';
  const ch = win[varName];

  if (ch && ch.q) {
    const q: any[] = ch.q;
    q.map(command => sdk(command[0], command[1]));
  }

  win[varName] = sdk;
  /* eslint-enable @typescript-eslint/no-explicit-any */
};
