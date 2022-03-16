import {globals} from '../src/globals';
import {WIN_MOCK} from './_helpers';

test('globals() should return global objects with default values', () => {
  const teardown = WIN_MOCK({href: 'http://test.com/some/path'});

  expect(globals()).toEqual({
    apiURL: 'https://api.contactlab.it/hub/v1',
    chName: 'ch',
    clabIdName: 'clabId',
    cookieName: '_ch',
    utmCookieName: '_chutm'
  });

  teardown();
});

test('globals() should return global objects with custom values', () => {
  const teardown = WIN_MOCK({
    href: 'http://test.com/some/path',
    ContactHubAPI: 'https://some.api/hub/v1',
    ContactHubClabId: 'custom_id',
    ContactHubCookie: '__cookie',
    ContactHubObject: 'chub',
    ContactHubUtmCookie: '__utm'
  });

  expect(globals()).toEqual({
    apiURL: 'https://some.api/hub/v1',
    chName: 'chub',
    clabIdName: 'custom_id',
    cookieName: '__cookie',
    utmCookieName: '__utm'
  });

  teardown();
});
