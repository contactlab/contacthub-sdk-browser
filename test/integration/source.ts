import {polyfill} from 'es6-promise';
import FM from 'fetch-mock';
import {cookie} from '../../src/cookie';
import {document} from '../../src/doc';
import {globals} from '../../src/globals';
import {http} from '../../src/http';
import {location} from '../../src/location';
import {main} from '../../src/main';
import {program} from '../../src/program';
import {uuid} from '../../src/uuid';

polyfill();

const sb = FM.sandbox();

sb.config.overwriteRoutes = true;

(window as any).fetchMock = sb;

main({
  globals,
  document: document(),
  cookie: cookie({globals}),
  http: http({fetch: sb as any, globals}),
  location: location(),
  program: program(),
  uuid: uuid()
});
