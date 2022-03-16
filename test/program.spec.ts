import {left, rightIO} from 'fp-ts/TaskEither';
import {Effect, program} from '../src/program';

let oriConsole: typeof console.error;

beforeAll(() => {
  /* eslint-disable no-console*/
  oriConsole = console.error;

  console.error = jest.fn();
  /* eslint-enable*/
});

afterAll(() => {
  // eslint-disable-next-line no-console
  console.error = oriConsole;
});

test('program.run() should run provided effect - success', async () => {
  const spy = jest.fn();

  const ok: Effect = rightIO(() => spy('OK'));

  const result = await program().run(ok);

  expect(result).toBe(undefined);

  expect(spy).toBeCalledWith('OK');
});

test('program.run() should run provided effect - failure', async () => {
  const spy = jest.fn();

  const ko: Effect = left(new Error('something went wrong'));

  const result = await program().run(ko);

  expect(result).toBe(undefined);
  expect(spy).not.toBeCalled();
  // eslint-disable-next-line no-console
  expect(console.error).toBeCalledWith(
    '[DEBUG] @contactlab/sdk-browser',
    'something went wrong'
  );
});

test('program.run() should catch unhandled errors', async () => {
  const spy = jest.fn();

  const unexpected: Effect = () => Promise.reject(new Error('boom')) as any;

  const result = await program().run(unexpected);

  expect(result).toBe(undefined);
  expect(spy).not.toBeCalled();
  // eslint-disable-next-line no-console
  expect(console.error).toBeCalledWith(
    '[DEBUG] @contactlab/sdk-browser',
    'boom'
  );
});
