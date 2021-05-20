import {expect} from 'chai';
import cookies from 'js-cookie';

/* global describe, it */

const cookieName = '_ch';
const getCookie = () => cookies.getJSON(cookieName) || {};

describe('When sdk.js is loaded', () => {
  it('processes the queue', () => {
    expect(getCookie().token).to.equal('ABC123_QUEUED');
  });

  it('does not touch the window.Promise object', () => {
    // _asap only exists in es6-promise, not in native Promise
    // eslint-disable-next-line no-unused-expressions
    expect(window.Promise && window.Promise._asap).to.be.undefined;
  });
});
