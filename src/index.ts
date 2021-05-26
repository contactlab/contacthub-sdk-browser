import {global} from './global';
import {location} from './location';
import {logger} from './logger';
import {main} from './main';
import {runner} from './runner';
import {sdkCookie} from './sdk-cookie';
import {utmCookie} from './utm-cookie';

const g = global(window);

main({
  ...g,
  ...location(window),
  ...runner(logger(window)),
  ...sdkCookie(g),
  ...utmCookie(g)
});
