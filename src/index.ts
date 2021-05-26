import {cookie} from './cookie';
import {global} from './global';
import {location} from './location';
import {logger} from './logger';
import {main} from './main';
import {runner} from './runner';

main({
  window,
  cookie,
  ...global(window),
  ...location(window),
  ...runner({logger})
});
