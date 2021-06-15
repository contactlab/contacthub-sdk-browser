import {IO} from 'fp-ts/IO';
import {v4 as uuidv4} from 'uuid';

export interface UUID {
  v4: IO<string>;
}

export interface UUIDSvc {
  uuid: UUID;
}

export const uuid: UUID = {
  v4: () => uuidv4()
};
