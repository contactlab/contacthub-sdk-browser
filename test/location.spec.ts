import {location} from '../src/location';
import {WIN_MOCK} from './_helpers';

afterEach(() => {
  jest.clearAllMocks();
});

test('location.data() should return window.locatio object', () => {
  const teardown = WIN_MOCK('http://test.com/some/path');

  expect(location().data()).toEqual({
    href: 'http://test.com/some/path',
    pathname: 'some/path'
  });

  teardown();
});

test('location.qp() should read query param from window href', () => {
  const teardown = WIN_MOCK(
    'http://test.com/some/path?foo=bar&baz=100&aaa=false'
  );

  expect(location().qp('baz')).toBe('100');
  expect(location().qp('bar')).toBe(undefined);

  teardown();
});
