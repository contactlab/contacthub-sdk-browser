import { expect } from 'chai';
import sinon from 'sinon';
import cookies from 'js-cookie';

const apiUrl = 'https://api.contactlab.it/hub/v1/';
const cookieName = '_ch';

const getCookie = () => cookies.getJSON(cookieName) || {};

/* global describe, it, beforeEach */

describe('contacthub.js', () => {
  it('creates the window.ch function', () => {
    expect(window.ch).to.be.a('function');
  });

  describe('Config API', () => {
    beforeEach(() => {
      window.ch('config', {
        workspaceId: 'w_id',
        nodeId: 'node_id',
        token: 'ABC123'
      });
    });

    it('sets a cookie', () => {
      expect(cookies.get(cookieName)).to.be.ok;
    });

    it('generates a UUIDv4 sessionId', () => {
      expect(getCookie().sid).to.match(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
    });
  });

  describe('Event API', () => {
    // const xhr = sinon.useFakeXMLHttpRequest();
    // const requests = [];
    //
    // xhr.onCreate = (xhr) => {
    //   requests.push(xhr);
    // };

    const server = sinon.fakeServer.create();
    server.respondImmediately = true;
    server.respondWith('POST', `${apiUrl}workspaces/1/events`, (req) => {
      req.respond(200, {}, '');
    });

    it('sends the event to the API', (done) => {
      window.ch('event', 'viewed_page').then(() => {
        // console.log('WUT', res);
        done();
      }).catch((err) => {
        // console.log('FAIL');
        done(err);
      });
    });
  });
});
