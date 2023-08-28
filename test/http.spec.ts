import fetchMock from 'fetch-mock';
import * as E from 'fp-ts/Either';
import {http} from '../src/http';
import * as S from './services';

test('http.post() should fetch a `post` request - success', async () => {
  const f = fetchMock
    .sandbox()
    .post('https://api.contactlab.it/hub/v1/endpoint', {id: 'abcd'});

  const result = await http({
    globals: S.GLOBALS_DEFAULTS,
    fetch: f as any
  }).post('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(E.right({id: 'abcd'}));
  expect(f.lastOptions()?.method).toBe('POST');
  expect(f.lastOptions()?.body).toEqual(JSON.stringify({foo: 'bar'}));
  expect(f.lastOptions()?.headers).toEqual({
    Accept: 'application/json',
    'Contactlab-ClientId': 'sdk-browser',
    'Content-Type': 'application/json',
    Authorization: `Bearer TOKEN`
  });
});

test('http.post() should fetch a `post` request - success empty response', async () => {
  const f = fetchMock
    .sandbox()
    .post('https://api.contactlab.it/hub/v1/endpoint', 200);

  const result = await http({
    globals: S.GLOBALS_DEFAULTS,
    fetch: f as any
  }).post('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(E.right({}));
});

test('http.post() should fetch a `post` request - failure on request', async () => {
  const f = fetchMock
    .sandbox()
    .post('https://api.contactlab.it/hub/v1/endpoint', {
      throws: new Error('network error')
    });

  const result = await http({
    globals: S.GLOBALS_DEFAULTS,
    fetch: f as any
  }).post('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(E.left(new Error('network error')));
});

test('http.post() should fetch a `post` request - failure on response', async () => {
  const f = fetchMock
    .sandbox()
    .post('https://api.contactlab.it/hub/v1/endpoint', 500);

  const result = await http({
    globals: S.GLOBALS_DEFAULTS,
    fetch: f as any
  }).post('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(
    E.left(new Error('Request responded with status code 500'))
  );
});

test('http.post() should fetch a `post` request - failure stringify on request', async () => {
  const f = fetchMock
    .sandbox()
    .post('https://api.contactlab.it/hub/v1/endpoint', 200);

  const result = await http({
    globals: S.GLOBALS_DEFAULTS,
    fetch: f as any
  }).post('/endpoint', CIRCULAR, 'TOKEN')();

  expect(result).toEqual(
    E.left(
      new TypeError(`Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    --- property 'reference' closes the circle`)
    )
  );
});

test('http.post() should fetch a `post` request - failure parse on response', async () => {
  const f = fetchMock
    .sandbox()
    .post('https://api.contactlab.it/hub/v1/endpoint', new Response('foo'));

  const result = await http({
    globals: S.GLOBALS_DEFAULTS,
    fetch: f as any
  }).post('/endpoint', {}, 'TOKEN')();

  // --- we need this trick because `SyntaxError` messages are not consistent between platform versions
  expect(E.isLeft(result)).toBe(true);

  const error = (result as E.Left<Error>).left;

  expect(error.name).toBe('SyntaxError');
});

test('http.post() should fetch a `post` request using configured api endpoint', async () => {
  const f = fetchMock.sandbox().post('http://api.endpoint/v2/path', 200);

  const result = await http({globals: S.GLOBALS_CUSTOM, fetch: f as any}).post(
    '/path',
    {},
    'TOKEN'
  )();

  expect(E.isRight(result)).toBe(true);
});

test('http.patch() should fetch a `patch` request - success', async () => {
  const f = fetchMock
    .sandbox()
    .patch('https://api.contactlab.it/hub/v1/endpoint', {id: 'abcd'});

  const result = await http({
    globals: S.GLOBALS_DEFAULTS,
    fetch: f as any
  }).patch('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(E.right({id: 'abcd'}));
  expect(f.lastOptions()?.method).toBe('PATCH');
  expect(f.lastOptions()?.body).toEqual(JSON.stringify({foo: 'bar'}));
  expect(f.lastOptions()?.headers).toEqual({
    Accept: 'application/json',
    'Contactlab-ClientId': 'sdk-browser',
    'Content-Type': 'application/json',
    Authorization: `Bearer TOKEN`
  });
});

test('http.patch() should fetch a `patch` request - success empty response', async () => {
  const f = fetchMock
    .sandbox()
    .patch('https://api.contactlab.it/hub/v1/endpoint', 200);

  const result = await http({
    globals: S.GLOBALS_DEFAULTS,
    fetch: f as any
  }).patch('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(E.right({}));
});

test('http.patch() should fetch a `patch` request - failure on request', async () => {
  const f = fetchMock
    .sandbox()
    .patch('https://api.contactlab.it/hub/v1/endpoint', {
      throws: new Error('network error')
    });

  const result = await http({
    globals: S.GLOBALS_DEFAULTS,
    fetch: f as any
  }).patch('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(E.left(new Error('network error')));
});

test('http.patch() should fetch a `patch` request - failure on response', async () => {
  const f = fetchMock
    .sandbox()
    .patch('https://api.contactlab.it/hub/v1/endpoint', 500);

  const result = await http({
    globals: S.GLOBALS_DEFAULTS,
    fetch: f as any
  }).patch('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(
    E.left(new Error('Request responded with status code 500'))
  );
});

test('http.patch() should fetch a `patch` request - failure stringify on request', async () => {
  const f = fetchMock
    .sandbox()
    .patch('https://api.contactlab.it/hub/v1/endpoint', 200);

  const result = await http({
    globals: S.GLOBALS_DEFAULTS,
    fetch: f as any
  }).patch('/endpoint', CIRCULAR, 'TOKEN')();

  expect(result).toEqual(
    E.left(
      new TypeError(`Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    --- property 'reference' closes the circle`)
    )
  );
});

test('http.patch() should fetch a `patch` request - failure parse on response', async () => {
  const f = fetchMock
    .sandbox()
    .patch('https://api.contactlab.it/hub/v1/endpoint', new Response('foo'));

  const result = await http({
    globals: S.GLOBALS_DEFAULTS,
    fetch: f as any
  }).patch('/endpoint', {}, 'TOKEN')();

  // --- we need this trick because `SyntaxError` messages are not consistent between platform versions
  expect(E.isLeft(result)).toBe(true);

  const error = (result as E.Left<Error>).left;

  expect(error.name).toBe('SyntaxError');
});

test('http.patch() should fetch a `patch` request using configured api endpoint', async () => {
  const f = fetchMock.sandbox().patch('http://api.endpoint/v2/path', 200);

  const result = await http({globals: S.GLOBALS_CUSTOM, fetch: f as any}).patch(
    '/path',
    {},
    'TOKEN'
  )();

  expect(E.isRight(result)).toBe(true);
});

// --- Helpers
const CIRCULAR: any = {};
CIRCULAR.reference = CIRCULAR;
