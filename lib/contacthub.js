// @flow
import xr from 'xr';
import uuid from 'uuid';
import sha256 from 'jssha/src/sha256';
import cookies from 'js-cookie';
import { Promise } from 'es6-promise';

type ContactHubFunction = Config & Customer & Event;

type Config = (method: 'config', options: ConfigOptions) => void;
type Customer = (method: 'customer', options: CustomerData) => void;
type Event = (method: 'event', options: EventOptions) => void;

type Auth = {
  token: string,
  workspaceId: string,
  nodeId: string
};

type ContacthubCookie = Auth & {
  sid: string,
  context: string,
  hash?: string,
  customerId?: string
};

type ConfigOptions = {
  token: string,
  workspaceId: string,
  nodeId: string,
  context?: string
};

type EventOptions = {
  type: string,
  properties?: Object
};

type CustomerId = {
  customerId: string
};

type ExternalId = {
  externalId?: string
};

type CustomerTags = {
  auto?: Array<string>,
  manual?: Array<string>
};

type CustomerData = {
  base: CustomerBase,
  extended?: Object,
  extra?: string,
  tags?: CustomerTags,
  externalId?: string
};

type CustomerContacts = {
  email?: string,
  fax?: string,
  mobilePhone?: string,
  phone?: string,
  otherContacts?: string,
  mobileDevices?: string
};

type CustomerAddress = {
  street?: string,
  city?: string,
  country?: string,
  province?: string,
  zip?: string,
  geo?: CustomerGeo
};

type CustomerGeo = {
  lat: string,
  lon: string
};

type CustomerCredential = {
  username?: string,
  password?: string
};

type CustomerSocial = {
  facebook?: string,
  google?: string,
  instagram?: string,
  linkedin?: string,
  qzone?: string,
  twitter?: string
};

type CustomerBase = {
  pictureUrl?: string,
  title?: string,
  prefix?: string,
  firstName?: string,
  lastName?: string,
  middleName?: string,
  gender?: string,
  dob?: string,
  locale?: string,
  timezone?: string,
  contacts?: CustomerContacts,
  address?: CustomerAddress,
  credential: CustomerCredential,
  educations?: string,
  likes?: Number,
  socialProfile: CustomerSocial,
  jobs?: string,
  subscriptions?: string
};

xr.configure({
  promise: fn => new Promise(fn)
});

const apiUrl = 'https://api.contactlab.it/hub/v1';
const cookieName = '_ch';
const varName = 'ch';

const getCookie = (): ContacthubCookie => {
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

const inferProperties = (customProperties?: Object): Object => {
  const inferredProperties = {
    title: document.title,
    url: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer
  };

  return Object.assign(inferredProperties, customProperties);
};

const event = (options: EventOptions): void => {
  const { workspaceId, nodeId, token, context, sid, customerId } = getCookie();
  const { type, properties: customProperties } = options;

  const properties = inferProperties(customProperties);

  if (!type) {
    throw new Error('Missing required event type');
  }

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
    enabled: true,
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
  customerId, workspaceId, nodeId, token, externalId, base, extended, extra, tags
}: Auth & CustomerData & CustomerId): Promise<string> => xr({
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
