import {expect} from 'chai';
import * as C from '../_helpers';
import * as H from './_helpers';

describe('When sdk.js is loaded', () => {
  it('should processes the queue', () => {
    expect(C.getCookieJSON(H.CH).token).to.equal('ABC123_QUEUED');
  });

  it('should not touch the window.Promise object', () => {
    // _asap only exists in es6-promise, not in native Promise
    expect(window.Promise && (window.Promise as any)._asap).to.equal(undefined);
  });
});
