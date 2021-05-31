import {expect} from 'chai';
import Cookies from 'js-cookie';
import {CH} from './_helpers';

describe('When sdk.js is loaded', () => {
  it('should processes the queue', () => {
    expect(Cookies.getJSON(CH).token).to.equal('ABC123_QUEUED');
  });

  it('should not touch the window.Promise object', () => {
    // _asap only exists in es6-promise, not in native Promise
    expect(window.Promise && (window.Promise as any)._asap).to.equal(undefined);
  });
});
