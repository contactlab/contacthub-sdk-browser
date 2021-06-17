import {IO} from 'fp-ts/IO';
import {v4 as uuidv4} from 'uuid';

export interface Uuid {
  v4: IO<string>;
}

export interface UuisSvc {
  uuid: Uuid;
}

export const uuid = (): Uuid => ({
  v4: () => uuidv4()
});
