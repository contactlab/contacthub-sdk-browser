import xr from 'xr';
import uuid from 'uuid';
import cookies from 'js-cookie';
import { Promise } from 'es6-promise';

xr.configure({
  promise: fn => new Promise(fn)
});

const apiUrl = 'https://api.contactlab.it/hub/v1/';
const cookieName = '_ch';

const event = () => {
  return xr.post(`${apiUrl}workspaces/1/events`);
};

const ContactHub = (method, ...options) => {

  const _ch = cookies.getJSON(cookieName) || {};

  if (method === 'config') {
    if (!_ch.sid) _ch.sid = uuid.v4();

    cookies.set(cookieName, _ch);
  }

  if (method === 'event') {
    return event(options);
  }

};

window.ch = ContactHub;
