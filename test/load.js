import { expect } from 'chai';
import cookies from 'js-cookie';

/* global describe, it */

const cookieName = '_ch';
const getCookie = () => cookies.getJSON(cookieName) || {};

describe('When contacthub.js is loaded', () => {

  it('processes the queue', () => {
    expect(getCookie().token).to.equal('ABC123_QUEUED');
  });

});