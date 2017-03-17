// @flow
import xr from 'xr';
import uuid from 'uuid';
import sha256 from 'jssha/src/sha256';
import cookies from 'js-cookie';
import { Promise } from 'es6-promise';

import type {
  ContactHubFunction,
  ContactHubCookie,
  Auth,
  ConfigOptions,
  EventOptions,
  CustomerData,
  CustomerId
} from '../lib/types';

xr.configure({
  promise: fn => new Promise(fn)
});

const varName: string = window.ContactHubObject || 'ch';
const cookieName: string = window.ContactHubCookie || '_ch';
const apiUrl: string = window.ContactHubAPI || 'https://api.contactlab.it/hub/v1';

function getQueryParam(name) {
  const match = RegExp(`[?&]${name}=([^&]*)`).exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

const newSessionId = (): string => uuid.v4();

const getCookie = (): ContactHubCookie => {
  const cookie: ?ContactHubCookie = cookies.getJSON(cookieName);

  if (!cookie) {
    throw new Error('Missing required ContactHub configuration.');
  }

  if (!(cookie.workspaceId && cookie.nodeId && cookie.token)) {
    throw new Error('Missing required ContactHub configuration.');
  }

  return cookie;
};

const allowedOptions = ['token', 'workspaceId', 'nodeId', 'context'];
const config = (options: ConfigOptions): void => {
  // get current ch cookie, if any
  const _ch = cookies.getJSON(cookieName) || {};

  // read Google Analytics query params if present
  const utm_source = getQueryParam('utm_source');

  if (utm_source) {
    // Store ga values in the ch cookie, overwriting any previous ga value.
    _ch.ga = {
      utm_source,
      utm_medium: getQueryParam('utm_medium') || undefined,
      utm_term: getQueryParam('utm_term') || undefined,
      utm_content: getQueryParam('utm_content') || undefined,
      utm_campaign: getQueryParam('utm_campaign') || undefined
    };
  }

  // generate sid if not already present
  _ch.sid = _ch.sid || newSessionId();

  // set all valid option params, keeping current value (if any)
  const filteredOptions = Object.keys(options)
    .filter(key => allowedOptions.indexOf(key) !== -1)
    .reduce((obj, key) => {
      obj[key] = options[key];
      return obj;
    }, {});
  Object.assign(_ch, filteredOptions);

  // default context to 'WEB', respecting cookie and options
  if (!_ch.hasOwnProperty('context')) {
    _ch.context = 'WEB';
  }

  // set updated cookie
  cookies.set(cookieName, _ch, { expires: 365 });
};

const inferProperties = (type: string, customProperties?: Object): Object => {
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

const event = (options: EventOptions): void => {
  const {
    workspaceId, nodeId, token, context, sid, customerId, ga
  } = getCookie();
  const { type, properties: customProperties } = options;

  if (!type) {
    throw new Error('Missing required event type');
  }

  const properties = inferProperties(type, customProperties);

  const tracking = ga ? { ga } : undefined;

  const bringBackProperties = customerId ? undefined : {
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
  });
};

const createCustomer = ({
  workspaceId, nodeId, token, externalId, base, extended, extra, tags
}: Auth & CustomerData): Promise<string> => xr({
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
    extra,
    tags
  }
}).then((response) => {
  return response.data.id;
});

const updateCustomer = ({
  customerId, workspaceId, token, externalId, base, extended, extra, tags
}: Auth & CustomerData & CustomerId): Promise<string> => xr({
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
    extra,
    tags
  }
}).then(() => {
  return customerId;
});

const reconcileCustomer = ({
  customerId, workspaceId, token
}: Auth & CustomerId): Promise<string> => xr({
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
}).then(() => {
  return customerId;
});

const computeHash = (data: CustomerData): string => {
  const shaObj = new sha256('SHA-256', 'TEXT');
  shaObj.update(JSON.stringify(data));
  return shaObj.getHash('HEX');
};

const customer = (options: CustomerData): void => {
  if (!options) {
    // Remove user data from cookie (e.g. when a customer logs out)
    cookies.set(cookieName, Object.assign(getCookie(), {
      sid: newSessionId(),
      customerId: undefined,
      hash: undefined
    }));

    return;
  }

  const { workspaceId, nodeId, token, customerId, hash } = getCookie();
  const { externalId, base, extended, extra, tags } = options;
  const newHash = computeHash({ base, extended, extra, tags, externalId });

  const update = (customerId: string): Promise<string> => updateCustomer({
    customerId, workspaceId, nodeId, token, externalId, base, extended, extra, tags
  });

  const create = (): Promise<string> => createCustomer({
    workspaceId, nodeId, token, externalId, base, extended, extra, tags
  });

  const merge = (err: Object): Promise<string> => {
    if (err.status === 409) {
      const res = JSON.parse(err.response);
      const customerId = res.data.customer.id;
      return updateCustomer({
        customerId, workspaceId, nodeId, token, externalId, base, extended, extra, tags
      });
    } else {
      return Promise.reject(err);
    }
  };

  const reconcile = (customerId: string): Promise<string> => reconcileCustomer({
    customerId, workspaceId, token, nodeId
  });

  const store = (customerId: string): string => {
    cookies.set(cookieName, Object.assign(getCookie(), { customerId, hash: newHash }));
    return customerId;
  };

  if (hash === newHash) { return; }

  if (customerId) {

    update(customerId).then(store);

  } else {

    create()
      .catch(merge)
      .then(store)
      .then(reconcile);

  }
};

const ContactHub:ContactHubFunction = (method, options) => {
  if (typeof JSON === 'undefined') {
    // No country for old IEs
    return;
  }

  const methods = { config, customer, event };

  if (method in methods) {
    methods[method].call(undefined, (options: any));
  }
};

// Process queued commands
if (window[varName] && window[varName].q) {
  const q = window[varName].q;
  q.map(command => ContactHub(command[0], command[1]));
}

// Replace queue with CH object
window[varName] = ContactHub;
