import {Uuid} from '../../src/uuid';

export const UUID_STR = '4ed6cae6-e956-4da1-9b06-c971887ed756';

export const UUID: Uuid = {
  v4: jest.fn(() => UUID_STR)
};
