import {fetch} from 'cross-fetch';
import {polyfill} from 'es6-promise';
import {cookie} from './cookie';
import {document} from './doc';
import {http} from './http';
import {location} from './location';
import {main} from './main';
import {program} from './program';

polyfill();

main({
  document: document(),
  cookie: cookie(),
  http: http(fetch),
  location: location(),
  program: program()
});
