import {document} from '../src/doc';
import {WIN_MOCK} from './_helpers';

test('document.title() should return current document title', () => {
  const teardown = WIN_MOCK({href: '', title: 'Current title'});

  expect(document().title()).toBe('Current title');

  teardown();
});

test('document.referrer() should return current document referrer', () => {
  const teardown = WIN_MOCK({href: '', referrer: 'Current referrer'});

  expect(document().referrer()).toBe('Current referrer');

  teardown();
});
