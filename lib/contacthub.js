import xr from 'xr';
import uuid from 'uuid';
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
  optionKeys.forEach(k => {
    if (options.hasOwnProperty(k)) {
      _ch[k] = options[k];
    }
  });

  // default context to 'WEB', respecting cookie and options
  if (!_ch.hasOwnProperty('context')) {
    _ch.context = 'WEB';
  }

  // set updated cookie
  cookies.set(cookieName, _ch);
};

const event = (type, options = {}) => {
  const { workspaceId, nodeId, token, context, sid } = getCookie();

  if (!(workspaceId && nodeId && token)) {
    throw new Error('Missing required ContactHub configuration.');
  }

  if (!event) {
    throw new Error('Missing required event type');
  }

  const properties = options;

  xr({
    method: 'POST',
    url: `${apiUrl}/workspaces/${workspaceId}/events`,
    data: {
      type,
      context,
      properties,
      bringBackProperties: {
        type: 'SESSION_ID',
        value: sid,
        nodeId
      }
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
    url: `${apiUrl}/workspaces/${workspaceId}/customers?nodeId=${nodeId}&externalId=${externalId}`,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
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

const updateCustomer = () => {
};

const createOrUpdateCustomer = ({
  workspaceId, nodeId, token, externalId, base, extended, extra, tags
}) => {
  return findByExternalId({ workspaceId, nodeId, token, externalId })
    .then((response) => updateCustomer(response.data.id))
    .catch(() => createCustomer({
      workspaceId, nodeId, token, externalId, base, extended, extra, tags
    }));
};

const customer = (options = {}) => {
  const { workspaceId, nodeId, token, customerId } = getCookie();

  if (!(workspaceId && nodeId && token)) {
    throw new Error('Missing required ContactHub configuration.');
  }

  const { externalId, base, extended, extra, tags } = options;

  if (customerId) {
    updateCustomer();
  } else {
    createOrUpdateCustomer({
      workspaceId, nodeId, token, externalId, base, extended, extra, tags
    }).then((response) => {
      const customerId = response.data.id;
      cookies.set(cookieName, Object.assign(getCookie(), { customerId }));
    });
  }
};

const ContactHub = (method, ...options) => {
  if (method === 'config') {

    return config(options[0]);

  } else if (method === 'event') {

    return event(options[0], options[1]);

  } else if (method === 'customer') {

    return customer(options[0], options[1]);

  }
};

window[varName] = window[varName] || ContactHub;
