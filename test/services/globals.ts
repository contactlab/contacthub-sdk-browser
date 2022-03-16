import {Globals} from '../../src/globals';

export const GLOBALS_DEFAULTS: Globals = () => ({
  apiURL: 'https://api.contactlab.it/hub/v1',
  chName: 'ch',
  clabIdName: 'clabId',
  cookieName: '_ch',
  utmCookieName: '_chutm'
});

export const GLOBALS_CUSTOM: Globals = () => ({
  apiURL: 'http://api.endpoint/v2',
  chName: 'chub',
  clabIdName: 'custom_id',
  cookieName: '_cookie',
  utmCookieName: '_utm'
});
