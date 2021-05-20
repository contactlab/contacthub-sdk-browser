import {Promise} from 'es6-promise';
import cookies from 'js-cookie';
import sha256 from 'jssha/src/sha256';
import uuid from 'uuid';
import xr from 'xr';

// import type {
//   ContactHubFunction,
//   ContactHubCookie,
//   ContactHubUtmCookie,
//   Auth,
//   ConfigOptions,
//   EventOptions,
//   CustomerData,
//   CustomerId
// } from '../lib/types';

xr.configure({
  promise: fn => new Promise(fn)
});

// const varName: string = window.ContactHubObject || 'ch';
const varName = window.ContactHubObject || 'ch';
// const cookieName: string = window.ContactHubCookie || '_ch';
const cookieName = window.ContactHubCookie || '_ch';
// const utmCookieName: string = window.ContactHubUtmCookie || '_chutm';
const utmCookieName = window.ContactHubUtmCookie || '_chutm';
// const apiUrl: string =
const apiUrl = window.ContactHubAPI || 'https://api.contactlab.it/hub/v1';

// const log = (debug: boolean, error: any): void => {
const log = (debug, error) => {
  if (!debug || !window.console) {
    return;
  }

  const msg =
    typeof error.status !== 'undefined' && typeof error.response !== 'undefined'
      ? error.response
      : error;
  return window.console.error('[DEBUG] @contactlab/sdk-browser', msg); // eslint-disable-line no-console
};

const getQueryParam = name => {
  const match = RegExp(`[?&]${name}=([^&]*)`).exec(window.location.href);
  const val = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  return val || undefined;
};

// const newSessionId = (): string => uuid.v4();
const newSessionId = () => uuid.v4();

// const getCookie = (): ContactHubCookie => {
const getCookie = () => {
  // const cookie: ?ContactHubCookie = cookies.getJSON(cookieName);
  const cookie = cookies.getJSON(cookieName);

  if (!cookie) {
    throw new Error('Missing required ContactHub configuration.');
  }

  if (!(cookie.workspaceId && cookie.nodeId && cookie.token)) {
    throw new Error('Missing required ContactHub configuration.');
  }

  return cookie;
};

// const getUtmCookie = (): ?ContactHubUtmCookie => {
const getUtmCookie = () => {
  // const utmCookie: ?ContactHubUtmCookie = cookies.getJSON(utmCookieName);
  const utmCookie = cookies.getJSON(utmCookieName);

  return utmCookie;
};

// const inferProperties = (type: string, customProperties?: Object): Object => {
const inferProperties = (type, customProperties) => {
  if (type === 'viewedPage') {
    const inferredProperties = {
      title: document.title,
      url: window.location.href,
      path: window.location.pathname,
      referer: document.referrer
    };

    return Object.assign(inferredProperties, customProperties);
  } else {
    return Object.assign({}, customProperties);
  }
};

// const event = (options: EventOptions): void => {
const event = options => {
  const {
    workspaceId,
    nodeId,
    token,
    context,
    contextInfo,
    sid,
    customerId,
    debug
  } = getCookie();
  const utm = getUtmCookie();
  const {type, properties: customProperties} = options;

  if (!type) {
    const error = 'Missing required event type';
    log(debug, error);
    throw new Error(error);
  }

  const properties = inferProperties(type, customProperties);

  const tracking = utm && utm.utm_source ? {ga: utm} : undefined;

  const bringBackProperties = customerId
    ? undefined
    : {
        type: 'SESSION_ID',
        value: sid,
        nodeId
      };

  xr({
    method: 'POST',
    url: `${apiUrl}/workspaces/${workspaceId}/events`,
    data: {
      type,
      context,
      contextInfo,
      properties,
      tracking,
      customerId,
      bringBackProperties
    },
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }).catch(e => log(getCookie().debug, e));
};

// const createCustomer = ({
//   workspaceId,
//   nodeId,
//   token,
//   externalId,
//   base,
//   extended,
//   consents,
//   extra,
//   tags
// }: {|
//   ...Auth,
//   ...CustomerData
// |}): Promise<string> =>
const createCustomer = ({
  workspaceId,
  nodeId,
  token,
  externalId,
  base,
  extended,
  consents,
  extra,
  tags
}) =>
  xr({
    method: 'POST',
    url: `${apiUrl}/workspaces/${workspaceId}/customers`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    data: {
      nodeId,
      externalId,
      base,
      extended,
      consents,
      extra,
      tags
    }
  }).then(response => response.data.id);

// const updateCustomer = ({
//   customerId,
//   workspaceId,
//   token,
//   externalId,
//   base,
//   extended,
//   consents,
//   extra,
//   tags
// }: {|
//   ...Auth,
//   ...CustomerData,
//   ...CustomerId
// |}): Promise<string> =>
const updateCustomer = ({
  customerId,
  workspaceId,
  token,
  externalId,
  base,
  extended,
  consents,
  extra,
  tags
}) =>
  xr({
    method: 'PATCH',
    url: `${apiUrl}/workspaces/${workspaceId}/customers/${customerId}`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    data: {
      externalId,
      base,
      extended,
      consents,
      extra,
      tags
    }
  }).then(() => customerId);

// const reconcileCustomer = ({
//   customerId,
//   workspaceId,
//   token
// }: {|
//   ...Auth,
//   ...CustomerId
// |}): Promise<string> =>
const reconcileCustomer = ({customerId, workspaceId, token}) =>
  xr({
    method: 'POST',
    url: `${apiUrl}/workspaces/${workspaceId}/customers/${customerId}/sessions`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    data: {
      value: getCookie().sid
    }
  }).then(() => customerId);

// const computeHash = (data: CustomerData): string => {
const computeHash = data => {
  // eslint-disable-next-line new-cap
  const shaObj = new sha256('SHA-256', 'TEXT');
  shaObj.update(JSON.stringify(data));
  return shaObj.getHash('HEX');
};

const resetCookie = () => {
  cookies.set(
    cookieName,
    Object.assign(getCookie(), {
      sid: newSessionId(),
      customerId: undefined,
      hash: undefined
    })
  );
};

// const customer = (options: CustomerData): void => {
const customer = options => {
  if (!options) {
    // an empty object is a request for a session reset
    resetCookie();

    return;
  }

  const {workspaceId, nodeId, token, customerId, hash} = getCookie();
  const {id, externalId, base, extended, consents, extra, tags} = options;
  const newHash = computeHash({
    base,
    extended,
    consents,
    extra,
    tags,
    externalId
  });

  // const update = (customerId: string): Promise<string> => {
  const update = cid => {
    if (externalId || base || extended || consents || extra || tags) {
      return updateCustomer({
        customerId: cid,
        workspaceId,
        nodeId,
        token,
        externalId,
        base,
        extended,
        consents,
        extra,
        tags
      });
    } else {
      return Promise.resolve(cid);
    }
  };

  // const create = (): Promise<string> =>
  const create = () =>
    createCustomer({
      workspaceId,
      nodeId,
      token,
      externalId,
      base,
      extended,
      consents,
      extra,
      tags
    });

  // const merge = (err: Object): Promise<string> => {
  const merge = err => {
    if (err.status === 409) {
      const res = JSON.parse(err.response);
      const cid = res.data.customer.id;
      return updateCustomer({
        customerId: cid,
        workspaceId,
        nodeId,
        token,
        externalId,
        base,
        extended,
        consents,
        extra,
        tags
      });
    } else {
      return Promise.reject(err);
    }
  };

  // const reconcile = (customerId: string): Promise<string> =>
  const reconcile = cid =>
    reconcileCustomer({
      customerId: cid,
      workspaceId,
      token,
      nodeId
    });

  // const store = (customerId: string): string => {
  const store = cid => {
    cookies.set(
      cookieName,
      Object.assign(getCookie(), {
        customerId: cid,
        hash: newHash
      })
    );
    return cid;
  };

  // const resolveIdConflict = (id: string, cookieId: string): Promise<string> => {
  const resolveIdConflict = (cid, cookieId) => {
    if (cid === cookieId) {
      return Promise.resolve(cid);
    } else {
      if (externalId || base || extended || consents || extra || tags) {
        resetCookie();
        return reconcile(cid);
      } else {
        return Promise.reject(
          'The provided id conflicts with the id stored in the cookie'
        );
      }
    }
  };

  if (hash === newHash) {
    return;
  }

  if (id && customerId) {
    resolveIdConflict(id, customerId)
      .then(update)
      .then(store)
      .catch(e => log(getCookie().debug, e));
  } else if (id) {
    reconcile(id)
      .then(update)
      .then(store)
      .catch(e => log(getCookie().debug, e));
  } else if (customerId) {
    update(customerId)
      .then(store)
      .catch(e => log(getCookie().debug, e));
  } else {
    create()
      .catch(merge)
      .then(store)
      .then(reconcile)
      .catch(e => log(getCookie().debug, e));
  }
};

const allowedConfigOptions = [
  'token',
  'workspaceId',
  'nodeId',
  'context',
  'contextInfo',
  'debug'
];

// const config = (options: ConfigOptions): void => {
const config = options => {
  if (!(options.workspaceId && options.nodeId && options.token)) {
    const err = 'Invalid ContactHub configuration';

    log(options.debug || false, err);

    throw new Error(err);
  }

  // get current _ch cookie, if any
  const currentCookie = cookies.getJSON(cookieName) || {};

  // check if the auth token has changed
  const hasTokenChanged = options.token !== currentCookie.token;

  const _ch = hasTokenChanged ? {} : currentCookie;

  // get current _chutm cookie, if any
  const _chutm = cookies.getJSON(utmCookieName) || {};

  // read Google Analytics UTM query params if present
  const utmSource = getQueryParam('utm_source');

  if (utmSource) {
    // Store UTM values in the _chutm cookie, overwriting any previous UTM value.
    _chutm.utm_source = getQueryParam('utm_source');
    _chutm.utm_medium = getQueryParam('utm_medium');
    _chutm.utm_term = getQueryParam('utm_term');
    _chutm.utm_content = getQueryParam('utm_content');
    _chutm.utm_campaign = getQueryParam('utm_campaign');
  }

  // generate sid if not already present
  _ch.sid = _ch.sid || newSessionId();

  // set all valid option params, keeping current value (if any)
  const filteredOptions = Object.keys(options)
    .filter(key => allowedConfigOptions.indexOf(key) !== -1)
    .reduce((obj, key) => {
      obj[key] = options[key];
      return obj;
    }, {});
  Object.assign(_ch, filteredOptions);

  // default values for context and contextInfo
  _ch.context = _ch.context || 'WEB';
  _ch.contextInfo = _ch.contextInfo || {};
  _ch.debug = _ch.debug || false;

  // set updated cookie
  cookies.set(cookieName, _ch, {expires: 365}); // expires in 1 year

  // set updated utm cookie
  cookies.set(utmCookieName, _chutm, {expires: 1 / 48}); // expires in 30 mins

  // support special query param clabId
  const clabId = getQueryParam('clabId');

  if (clabId) {
    customer({id: clabId});
  }
};

// const ContactHub: ContactHubFunction = (method, options) => {
const ContactHub = (method, options) => {
  if (!Array.prototype.map) {
    // No country for old IEs
    return;
  }

  const methods = {config, customer, event};

  if (method in methods) {
    // methods[method].call(undefined, (options: any));
    methods[method].call(undefined, options);
  }
};

// Process queued commands
if (window[varName] && window[varName].q) {
  if (Array.prototype.map) {
    const q = window[varName].q;
    q.map(command => ContactHub(command[0], command[1]));
  }
}

// Replace queue with CH object
window[varName] = ContactHub;
