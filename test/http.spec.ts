import fetchMock from 'fetch-mock';
import {isRight, left, right} from 'fp-ts/Either';
import {http} from '../src/http';
import {WIN_MOCK} from './_helpers';

afterEach(() => {
  jest.clearAllMocks();
});

test('http.post() should fetch a `post` request - success', async () => {
  const teardown = WIN_MOCK({href: 'http://test.com'});

  const fetch = fetchMock
    .sandbox()
    .post('https://api.contactlab.it/hub/v1/endpoint', {id: 'abcd'});

  const result = await http(fetch).post('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(right({id: 'abcd'}));
  expect(fetch.lastOptions()?.method).toBe('POST');
  expect(fetch.lastOptions()?.body).toEqual(JSON.stringify({foo: 'bar'}));
  expect(fetch.lastOptions()?.headers).toEqual({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer TOKEN`
  });

  teardown();
});

test('http.post() should fetch a `post` request - success empty response', async () => {
  const teardown = WIN_MOCK({href: 'http://test.com'});

  const fetch = fetchMock
    .sandbox()
    .post('https://api.contactlab.it/hub/v1/endpoint', 200);

  const result = await http(fetch).post('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(right({}));

  teardown();
});

test('http.post() should fetch a `post` request - failure on request', async () => {
  const teardown = WIN_MOCK({href: 'http://test.com'});

  const fetch = fetchMock
    .sandbox()
    .post('https://api.contactlab.it/hub/v1/endpoint', {
      throws: new Error('network error')
    });

  const result = await http(fetch).post('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(left(new Error('network error')));

  teardown();
});

test('http.post() should fetch a `post` request - failure on response', async () => {
  const teardown = WIN_MOCK({href: 'http://test.com'});

  const fetch = fetchMock
    .sandbox()
    .post('https://api.contactlab.it/hub/v1/endpoint', 500);

  const result = await http(fetch).post('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(
    left(new Error('Request responded with status code 500'))
  );

  teardown();
});

test('http.post() should fetch a `post` request - failure stringify on request', async () => {
  const teardown = WIN_MOCK({href: 'http://test.com'});

  const fetch = fetchMock
    .sandbox()
    .post('https://api.contactlab.it/hub/v1/endpoint', 200);

  const result = await http(fetch).post('/endpoint', CIRCULAR, 'TOKEN')();

  expect(result).toEqual(
    left(
      new TypeError(`Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    --- property 'reference' closes the circle`)
    )
  );

  teardown();
});

test('http.post() should fetch a `post` request - failure parse on response', async () => {
  const teardown = WIN_MOCK({href: 'http://test.com'});

  const fetch = fetchMock
    .sandbox()
    .post('https://api.contactlab.it/hub/v1/endpoint', new Response('foo'));

  const result = await http(fetch).post('/endpoint', {}, 'TOKEN')();

  expect(result).toEqual(
    left(new SyntaxError(`Unexpected token o in JSON at position 1`))
  );

  teardown();
});

test('http.post() should fetch a `post` request using configured api endpoint', async () => {
  const teardown = WIN_MOCK({
    href: 'http://test.com',
    ContactHubAPI: 'http://api.endpoint/v2'
  });

  const fetch = fetchMock.sandbox().post('http://api.endpoint/v2/path', 200);

  const result = await http(fetch).post('/path', {}, 'TOKEN')();

  expect(isRight(result)).toBe(true);

  teardown();
});

test('http.patch() should fetch a `patch` request - success', async () => {
  const teardown = WIN_MOCK({href: 'http://test.com'});

  const fetch = fetchMock
    .sandbox()
    .patch('https://api.contactlab.it/hub/v1/endpoint', {id: 'abcd'});

  const result = await http(fetch).patch('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(right({id: 'abcd'}));
  expect(fetch.lastOptions()?.method).toBe('PATCH');
  expect(fetch.lastOptions()?.body).toEqual(JSON.stringify({foo: 'bar'}));
  expect(fetch.lastOptions()?.headers).toEqual({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer TOKEN`
  });

  teardown();
});

test('http.patch() should fetch a `patch` request - success empty response', async () => {
  const teardown = WIN_MOCK({href: 'http://test.com'});

  const fetch = fetchMock
    .sandbox()
    .patch('https://api.contactlab.it/hub/v1/endpoint', 200);

  const result = await http(fetch).patch('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(right({}));

  teardown();
});

test('http.patch() should fetch a `patch` request - failure on request', async () => {
  const teardown = WIN_MOCK({href: 'http://test.com'});

  const fetch = fetchMock
    .sandbox()
    .patch('https://api.contactlab.it/hub/v1/endpoint', {
      throws: new Error('network error')
    });

  const result = await http(fetch).patch('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(left(new Error('network error')));

  teardown();
});

test('http.patch() should fetch a `patch` request - failure on response', async () => {
  const teardown = WIN_MOCK({href: 'http://test.com'});

  const fetch = fetchMock
    .sandbox()
    .patch('https://api.contactlab.it/hub/v1/endpoint', 500);

  const result = await http(fetch).patch('/endpoint', {foo: 'bar'}, 'TOKEN')();

  expect(result).toEqual(
    left(new Error('Request responded with status code 500'))
  );

  teardown();
});

test('http.patch() should fetch a `patch` request - failure stringify on request', async () => {
  const teardown = WIN_MOCK({href: 'http://test.com'});

  const fetch = fetchMock
    .sandbox()
    .patch('https://api.contactlab.it/hub/v1/endpoint', 200);

  const result = await http(fetch).patch('/endpoint', CIRCULAR, 'TOKEN')();

  expect(result).toEqual(
    left(
      new TypeError(`Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    --- property 'reference' closes the circle`)
    )
  );

  teardown();
});

test('http.patch() should fetch a `patch` request - failure parse on response', async () => {
  const teardown = WIN_MOCK({href: 'http://test.com'});

  const fetch = fetchMock
    .sandbox()
    .patch('https://api.contactlab.it/hub/v1/endpoint', new Response('foo'));

  const result = await http(fetch).patch('/endpoint', {}, 'TOKEN')();

  expect(result).toEqual(
    left(new SyntaxError(`Unexpected token o in JSON at position 1`))
  );

  teardown();
});

test('http.patch() should fetch a `patch` request using configured api endpoint', async () => {
  const teardown = WIN_MOCK({
    href: 'http://test.com',
    ContactHubAPI: 'http://api.endpoint/v2'
  });

  const fetch = fetchMock.sandbox().patch('http://api.endpoint/v2/path', 200);

  const result = await http(fetch).patch('/path', {}, 'TOKEN')();

  expect(isRight(result)).toBe(true);

  teardown();
});

// --- Helpers
const CIRCULAR: any = {};
CIRCULAR.reference = CIRCULAR;
