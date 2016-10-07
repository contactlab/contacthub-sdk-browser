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
  ExternalId,
  CustomerId
} from '../lib/types';

xr.configure({
  promise: fn => new Promise(fn)
});

const varName = window.ContactHubObject || 'ch';
const cookieName = window.ContactHubCookie || '_ch';
const apiUrl = window.ContactHubAPI || 'https://api.contactlab.it/hub/v1';

const getCookie = (): ContactHubCookie => {
  const cookie = cookies.getJSON(cookieName);

  if (!cookie) {
    throw new Error('Missing required ContactHub configuration.');
  }

  const {
    workspaceId, nodeId, token, context, sid, customerId, hash
  } = cookie;

  if (!(workspaceId && nodeId && token)) {
    throw new Error('Missing required ContactHub configuration.');
  }

  return { workspaceId, nodeId, token, context, sid, customerId, hash };
};

const optionKeys = ['token', 'workspaceId', 'nodeId', 'context'];
const config = (options: ConfigOptions): void => {
  // get current _ch, if any
  const _ch = cookies.getJSON(cookieName) || {};

  // generate sid if not already present
  _ch.sid = _ch.sid || uuid.v4();

  // set all valid option params, keeping current value (if any)
  for (let i = 0; i < optionKeys.length; i = i + 1) {
    const k = optionKeys[i];
    if (options.hasOwnProperty(k)) {
      _ch[k] = options[k];
    }
  }

  // default context to 'WEB', respecting cookie and options
  if (!_ch.hasOwnProperty('context')) {
    _ch.context = 'WEB';
  }

  // set updated cookie
  cookies.set(cookieName, _ch);
};

const inferProperties = (type: string, customProperties?: Object): Object => {
  if (type === 'viewedPage') {
    const inferredProperties = {
      title: document.title,
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer
    };

    return Object.assign(inferredProperties, customProperties);
  } else {
    return Object.assign({}, customProperties);
  }
};

const event = (options: EventOptions): void => {
  const { workspaceId, nodeId, token, context, sid, customerId } = getCookie();
  const { type, properties: customProperties } = options;

  if (!type) {
    throw new Error('Missing required event type');
  }

  const properties = inferProperties(type, customProperties);

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

const findByExternalId = ({
  workspaceId, nodeId, token, externalId
}: Auth & ExternalId): Promise<string> => {
  return xr({
    method: 'GET',
    url: `${apiUrl}/workspaces/${workspaceId}/customers`,
    params: { nodeId, externalId },
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }).then((response) => {
    return Promise.resolve(response.data._embedded.customers[0].id);
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
  return Promise.resolve(response.data.id);
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
  return Promise.resolve(customerId);
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
  return Promise.resolve(customerId);
});

const computeHash = (data: CustomerData): string => {
  const shaObj = new sha256('SHA-256', 'TEXT');
  shaObj.update(JSON.stringify(data));
  return shaObj.getHash('HEX');
};

const customer = (options: CustomerData): void => {
  const { workspaceId, nodeId, token, customerId, hash } = getCookie();
  const { externalId, base, extended, extra, tags } = options;
  const newHash = computeHash({ base, extended, extra, tags });

  const update = (customerId: string): Promise<string> => updateCustomer({
    customerId, workspaceId, nodeId, token, externalId, base, extended, extra, tags
  });

  const create = (): Promise<string> => createCustomer({
    workspaceId, nodeId, token, externalId, base, extended, extra, tags
  });

  const reconcile = customerId => reconcileCustomer({
    customerId, workspaceId, token, nodeId
  });

  const store = (customerId: string): Promise<string> => {
    cookies.set(cookieName, Object.assign(getCookie(), { customerId, hash: newHash }));
    return Promise.resolve(customerId);
  };

  if (hash === newHash) return;

  if (customerId) {

    update(customerId).then(store);

  } else if (externalId) {

    findByExternalId({ workspaceId, nodeId, token, externalId })
      .then(update)
      .catch(create)
      .then(store)
      .then(reconcile);

  } else {

    create().then(store).then(reconcile);

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
  for (let i = 0, q = window[varName].q; i < q.length; i = i + 1) {
    ContactHub(q[i][0], q[i][1]);
  }
}

// Replace queue with CH object
window[varName] = ContactHub;
