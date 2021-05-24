/* global describe, it */

import {expect} from 'chai';
import cookies from 'js-cookie';

const getCookie = (): any => cookies.getJSON('_ch') || {};

describe('When sdk.js is loaded', () => {
  it('processes the queue', () => {
    expect(getCookie().token).to.equal('ABC123_QUEUED');
  });

  it('does not touch the window.Promise object', () => {
    // _asap only exists in es6-promise, not in native Promise
    expect(window.Promise && (window.Promise as any)._asap).to.equal(undefined);
  });
});
