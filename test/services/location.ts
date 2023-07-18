import {Location} from '../../src/location';

export const LOCATION = (
  url: string = 'http://test.com/some/path'
): Location => {
  const {href, pathname} = new URL(url);

  return {
    data: () => ({href, pathname} as Window['location']),

    qp: name => {
      const match = new RegExp(`[?&]${name}=([^&]*)`).exec(href);
      const val = match && decodeURIComponent(match[1].replace(/\+/g, ' '));

      return val ?? undefined;
    }
  };
};
