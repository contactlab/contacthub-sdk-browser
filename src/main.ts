import {ConfigOptions, ConfigEnv, config} from './config';
import {CustomerData, CustomerEnv, customer} from './customer';
import {EventOptions, EventEnv, event} from './event';

interface MainEnv extends ConfigEnv, CustomerEnv, EventEnv {}

export interface SDK {
  (method: 'config', options: ConfigOptions): void;
  (method: 'event', options: EventOptions): void;
  (method: 'customer', options?: CustomerData): void;
}

export const main = (Env: MainEnv): void => {
  const sdk: SDK = (
    method: 'config' | 'event' | 'customer',
    options: unknown
  ) => {
    switch (method) {
      case 'config':
        return config(Env)(options as ConfigOptions);

      case 'customer':
        return customer(Env)(options as CustomerData);

      case 'event':
        return event(Env)(options as EventOptions);
    }
  };

  const varName = Env.varName();

  // Necessary evil...
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const ch = (window as any)[varName];

  if (ch && ch.q) {
    const q: any[] = ch.q;
    q.map(command => sdk(command[0], command[1]));
  }

  (window as any)[varName] = sdk;
  /* eslint-enable @typescript-eslint/no-explicit-any */
};
