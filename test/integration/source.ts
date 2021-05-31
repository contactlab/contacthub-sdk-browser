import {polyfill} from 'es6-promise';
import FM from 'fetch-mock';
import {cookie} from '../../src/cookie';
import {document} from '../../src/doc';
import {http} from '../../src/http';
import {location} from '../../src/location';
import {main} from '../../src/main';
import {program} from '../../src/program';

polyfill();

const sb = FM.sandbox();

sb.config.overwriteRoutes = true;

(window as any).fetchMock = sb;

main({
  document: document(),
  cookie: cookie(),
  http: http(sb),
  location: location(),
  program: program()
});
