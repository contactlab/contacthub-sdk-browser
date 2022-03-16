import {fetch} from 'cross-fetch';
import {polyfill} from 'es6-promise';
import {cookie} from './cookie';
import {document} from './doc';
import {globals} from './globals';
import {http} from './http';
import {location} from './location';
import {main} from './main';
import {program} from './program';
import {uuid} from './uuid';

polyfill();

main({
  globals,
  document: document(),
  cookie: cookie({globals}),
  http: http({globals, fetch}),
  location: location(),
  program: program(),
  uuid: uuid()
});
