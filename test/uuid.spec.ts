import {uuid} from '../src/uuid';

test('uuid.v4() should return a random uuid v4 string', () => {
  const uuidV4 =
    /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

  const first = uuid().v4();
  const second = uuid().v4();

  expect(uuidV4.test(first)).toBe(true);
  expect(uuidV4.test(second)).toBe(true);
  expect(first).not.toBe(second);
});
