import xr from 'xr';
import uuid from 'uuid';
import sha256 from 'jssha/src/sha256';
import cookies from 'js-cookie';
import { Promise } from 'es6-promise';

xr.configure({
  promise: fn => new Promise(fn)
});

const apiUrl = 'https://api.contactlab.it/hub/v1';
const cookieName = '_ch';
const varName = 'ch';

const getCookie = () => cookies.getJSON(cookieName) || {};

const optionKeys = ['token', 'workspaceId', 'nodeId', 'context'];
const config = (options = {}) => {
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

const event = (type, options = {}) => {
  const { workspaceId, nodeId, token, context, sid, customerId } = getCookie();

  if (!(workspaceId && nodeId && token)) {
    throw new Error('Missing required ContactHub configuration.');
  }

  if (!event) {
    throw new Error('Missing required event type');
  }

  const properties = options;

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

const findByExternalId = ({ workspaceId, nodeId, token, externalId }) => {
  if (!externalId) return Promise.reject();

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
}) => {
  return xr({
    method: 'POST',
    url: `${apiUrl}/workspaces/${workspaceId}/customers`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    data: {
      enabled: true,
      nodeId,
      externalId,
      base,
      extended,
      extra,
      tags
    }
  });
};

const updateCustomer = ({
  customerId, workspaceId, nodeId, token, externalId, base, extended, extra, tags
}) => {
  return xr({
    method: 'PATCH',
    url: `${apiUrl}/workspaces/${workspaceId}/customers/${customerId}`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    data: {
      enabled: true,
      nodeId,
      externalId,
      base,
      extended,
      extra,
      tags
    }
  });
};

const reconcileCustomer = ({ customerId, workspaceId, token }) => {
  const { sid } = getCookie();
  return xr({
    method: 'POST',
    url: `${apiUrl}/workspaces/${workspaceId}/customers/${customerId}/sessions`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    data: {
      value: sid
    }
  });
};

const createOrUpdateCustomer = ({
  workspaceId, nodeId, token, externalId, base, extended, extra, tags
}) => {
  return findByExternalId({ workspaceId, nodeId, token, externalId })
    .then((customerId) => updateCustomer({
      customerId, workspaceId, nodeId, token, externalId, base, extended, extra, tags
    }))
    .catch(() => createCustomer({
      workspaceId, nodeId, token, externalId, base, extended, extra, tags
    }));
};

const computeHash = (data) => {
  const shaObj = new sha256('SHA-256', 'TEXT');
  shaObj.update(JSON.stringify(data));
  return shaObj.getHash('HEX');
};

const customer = (options = {}) => {
  const { workspaceId, nodeId, token, customerId, hash } = getCookie();

  if (!(workspaceId && nodeId && token)) {
    throw new Error('Missing required ContactHub configuration.');
  }

  const { externalId, base, extended, extra, tags } = options;

  if (hash === computeHash({ base, extended, extra, tags })) return;

  if (customerId) {

    updateCustomer({
      customerId, workspaceId, nodeId, token, externalId, base, extended, extra, tags
    }).then(() => {
      const hash = computeHash({ base, extended, extra, tags });
      cookies.set(cookieName, Object.assign(getCookie(), { hash }));
    });

  } else {

    createOrUpdateCustomer({
      workspaceId, nodeId, token, externalId, base, extended, extra, tags
    }).then((response) => {
      const customerId = response.data.id;
      const hash = computeHash({ base, extended, extra, tags });
      cookies.set(cookieName, Object.assign(getCookie(), { customerId, hash }));
      reconcileCustomer({ customerId, workspaceId, token });
    });

  }
};

const ContactHub = (method, ...options) => {
  if (typeof JSON === 'undefined') {
    // No country for old IEs
    return;
  }

  const methods = { config, customer, event };

  if (method in methods) {
    methods[method].apply(undefined, options);
  }
};

// Process queued commands
if (window[varName] && window[varName].q) {
  for (let i = 0, q = window[varName].q; i < q.length; i = i + 1) {
    ContactHub(...q[i]);
  }
}

// Replace queue with CH object
window[varName] = ContactHub;

