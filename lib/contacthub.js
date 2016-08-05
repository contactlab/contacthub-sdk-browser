import xr from 'xr';
import uuid from 'uuid';
import cookies from 'js-cookie';
import { Promise } from 'es6-promise';

xr.configure({
  promise: fn => new Promise(fn)
});

const apiUrl = 'https://api.contactlab.it/hub/v1/';
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

const event = () => {
  const { workspaceId, nodeId, token } = getCookie();

  if (!(workspaceId && nodeId && token)) {
    throw new Error('Missing required configuration.');
  }

  xr.post(`${apiUrl}workspaces/${workspaceId}/events`);
};

const ContactHub = (method, options) => {
  if (method === 'config') {
    return config(options);
  }

  if (method === 'event') {
    return event(options);
  }
};

window[varName] = window[varName] || ContactHub;
