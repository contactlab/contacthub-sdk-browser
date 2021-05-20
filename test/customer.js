/* global describe, it, beforeEach, afterEach */

import {expect} from 'chai';
import cookies from 'js-cookie';
import sinon from 'sinon';

// import type {ContactHubFunction} from '../lib/types';

const apiUrl = 'https://api.contactlab.it/hub/v1';
const cookieName = '_ch';
const varName = 'ch';
const config = {
  workspaceId: 'workspace_id',
  nodeId: 'node_id',
  token: 'ABC123'
};

const mario = {
  externalId: 'mario.rossi',
  base: {
    firstName: 'mario',
    lastName: 'rossi',
    dob: '1980-03-17',
    contacts: {
      email: 'mario.rossi@example.com'
    }
  }
};

// const _ch: ContactHubFunction = window[varName];
const _ch = window[varName];

const getCookie = () => cookies.getJSON(cookieName) || {};

const setConfig = d => {
  const debug = d || false;
  _ch('config', Object.assign({}, config, {debug}));
};

let spyError;
let requests = [];
let xhr;

// Mocked Ajax calls return immediately but need a short setTimeout to avoid
// race conditions. 0 ms works fine on all browsers except IE 10 which requires
// at least 2 ms.
// TODO: find a more elegant way to mock Ajax calls
const whenDone = f => {
  setTimeout(() => f(), 2);
};

const debugMsg = msg =>
  spyError.calledWith('[DEBUG] @contactlab/sdk-browser', msg);

describe('Customer API:', () => {
  beforeEach(() => {
    spyError = sinon.stub(console, 'error').callsFake(() => undefined);
    cookies.remove(cookieName);
    requests = [];
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = xhr => {
      requests.push(xhr);
    };
  });

  afterEach(done => {
    spyError.restore();
    whenDone(() => done());
  });

  it('checks if required config is set', () => {
    expect(() => {
      _ch('customer', mario);
    }).to.throw(Error);

    expect(requests.length).to.equal(0);
  });

  describe('when a customerId is not provided', () => {
    describe('and no customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
        _ch('customer', mario);
      });

      it('creates a new customer', done => {
        whenDone(() => {
          expect(requests.length).to.equal(1);
          const req = requests[0];
          expect(req.method).to.equal('POST');
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            nodeId: config.nodeId,
            externalId: mario.externalId,
            base: mario.base
          });
          expect(req.requestHeaders.Authorization).to.equal(
            `Bearer ${config.token}`
          );
          done();
        });
      });

      it('handles 409 conflicts and updates the existing customer', done => {
        whenDone(() => {
          requests[0].respond(
            409,
            {},
            JSON.stringify({
              data: {
                customer: {
                  id: 'existing-cid'
                }
              }
            })
          );
          whenDone(() => {
            expect(requests.length).to.equal(2);
            const req = requests[1];
            expect(req.method).to.equal('PATCH');
            expect(req.url).to.equal(
              `${apiUrl}/workspaces/${config.workspaceId}/customers/existing-cid`
            );
            expect(JSON.parse(req.requestBody)).to.eql({
              externalId: mario.externalId,
              base: mario.base
            });
            done();
          });
        });
      });

      it('stores the customerId for future calls', done => {
        whenDone(() => {
          requests[0].respond(200, {}, JSON.stringify({id: 'new-cid'}));
          whenDone(() => {
            expect(getCookie().customerId).to.equal('new-cid');
            done();
          });
        });
      });

      it('stores a hash of the customer data for future calls', done => {
        whenDone(() => {
          requests[0].respond(200, {}, JSON.stringify({id: 'new-cid'}));
          whenDone(() => {
            expect(getCookie().hash).not.to.be.undefined;
            done();
          });
        });
      });

      it('reconciles the sessionId with the customerId', done => {
        const sid = getCookie().sid;
        whenDone(() => {
          requests[0].respond(200, {}, JSON.stringify({id: 'new-cid'}));
          whenDone(() => {
            expect(requests.length).to.equal(2);
            const req = requests[1];
            expect(req.url).to.equal(
              `${apiUrl}/workspaces/${config.workspaceId}/customers/new-cid/sessions`
            );
            expect(JSON.parse(req.requestBody)).to.eql({
              value: sid
            });
            done();
          });
        });
      });
    });

    describe('and a customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
        cookies.set(
          cookieName,
          Object.assign(getCookie(), {
            customerId: 'my-cid'
          })
        );
        _ch('customer', mario);
      });

      it('updates the customer', () => {
        expect(requests.length).to.equal(1);
        const req = requests[0];
        expect(req.method).to.equal('PATCH');
        expect(req.url).to.equal(
          `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid`
        );
        expect(JSON.parse(req.requestBody)).to.eql({
          externalId: mario.externalId,
          base: mario.base
        });
      });

      it('does not update the customer if the same data is sent', done => {
        requests[0].respond(200);
        whenDone(() => {
          _ch('customer', mario);
          expect(requests.length).to.equal(1);
          done();
        });
      });

      it('does update the customer if updated data is sent', done => {
        requests[0].respond(200);
        whenDone(() => {
          if (mario.base) {
            mario.base.lastName = 'Rossini';
          }
          _ch('customer', mario);
          expect(requests.length).to.equal(2);
          done();
        });
      });

      it('does update the customer if only the externalId has changed', done => {
        requests[0].respond(200);
        whenDone(() => {
          mario.externalId = 'supermario';
          _ch('customer', mario);
          expect(requests.length).to.equal(2);
          done();
        });
      });
    });
  });

  describe('when a customerId is provided but no customer data', () => {
    describe('and the same customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
        cookies.set(
          cookieName,
          Object.assign(getCookie(), {
            customerId: 'my-cid'
          })
        );
        _ch('customer', {id: 'my-cid'});
      });

      it('does not make any API call', () => {
        expect(requests.length).to.equal(0);
      });
    });

    describe('and a different customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
        cookies.set(
          cookieName,
          Object.assign(getCookie(), {
            customerId: 'different-cid'
          })
        );
        _ch('customer', {id: 'my-cid'});
      });

      it('does not make any API call', () => {
        expect(requests.length).to.equal(0);
      });
    });

    describe('and no customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
      });

      it('does not reset the sessionId', () => {
        const {sid} = getCookie();
        _ch('customer', {id: 'my-cid'});

        expect(getCookie().sid).to.eql(sid);
      });

      it('reconciles the sessionId with the customerId', done => {
        const {sid} = getCookie();
        _ch('customer', {id: 'my-cid'});

        whenDone(() => {
          expect(requests.length).to.equal(1);
          const req = requests[0];
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid/sessions`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            value: sid
          });
          done();
        });
      });

      it('does not make additional API requests', () => {
        _ch('customer', {id: 'my-cid'});

        expect(requests.length).to.equal(1);
      });
    });
  });

  describe('when a customerId is provided along with some customer data', () => {
    describe('and the same customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
        cookies.set(
          cookieName,
          Object.assign(getCookie(), {
            customerId: 'my-cid'
          })
        );
        _ch('customer', Object.assign({}, mario, {id: 'my-cid'}));
      });

      it('updates the customer', done => {
        whenDone(() => {
          expect(requests.length).to.equal(1);
          const req = requests[0];
          expect(req.method).to.equal('PATCH');
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            externalId: mario.externalId,
            base: mario.base
          });
          done();
        });
      });
    });

    describe('and a different customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
        cookies.set(
          cookieName,
          Object.assign(getCookie(), {
            customerId: 'different-cid'
          })
        );
      });

      it('resets the sessionId', () => {
        const {sid} = getCookie();
        _ch('customer', Object.assign({}, mario, {id: 'my-cid'}));

        expect(getCookie().sid).not.to.eql(sid);
      });

      it('reconciles the new sessionId with the customerId', done => {
        _ch('customer', Object.assign({}, mario, {id: 'my-cid'}));
        const {sid: newSid} = getCookie();

        whenDone(() => {
          expect(requests.length).to.equal(1);
          const req = requests[0];
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid/sessions`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            value: newSid
          });
          done();
        });
      });

      it('updates the customer', done => {
        _ch('customer', Object.assign({}, mario, {id: 'my-cid'}));

        requests[0].respond(200);
        whenDone(() => {
          expect(requests.length).to.equal(2);
          const req = requests[1];
          expect(req.method).to.equal('PATCH');
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            externalId: mario.externalId,
            base: mario.base
          });
          done();
        });
      });
    });

    describe('and no customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
      });

      it('does not reset the sessionId', () => {
        const {sid} = getCookie();
        _ch('customer', Object.assign({}, mario, {id: 'my-cid'}));

        expect(getCookie().sid).to.eql(sid);
      });

      it('reconciles the sessionId with the customerId', done => {
        const {sid} = getCookie();
        _ch('customer', Object.assign({}, mario, {id: 'my-cid'}));

        whenDone(() => {
          expect(requests.length).to.equal(1);
          const req = requests[0];
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid/sessions`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            value: sid
          });
          done();
        });
      });

      it('updates the customer', done => {
        _ch('customer', Object.assign({}, mario, {id: 'my-cid'}));

        requests[0].respond(200);
        whenDone(() => {
          expect(requests.length).to.equal(2);
          const req = requests[1];
          expect(req.method).to.equal('PATCH');
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            externalId: mario.externalId,
            base: mario.base
          });
          done();
        });
      });
    });
  });

  describe('when no object is provided', () => {
    beforeEach(() => {
      setConfig();

      cookies.set(
        cookieName,
        Object.assign(getCookie(), {
          customerId: 'old-customer-id',
          sid: 'old-session-id'
        })
      );

      _ch('customer');
    });

    it('removes user data from cookie', () => {
      expect(getCookie().customerId).to.be.undefined;
    });

    it('generates a new sessionId', () => {
      expect(getCookie().sid).to.match(
        /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
      );
    });
  });

  // --- Rejections
  describe('when id and customerId are provided it should logs catched promise rejection', () => {
    beforeEach(() => {
      setConfig(true);
      cookies.set(
        cookieName,
        Object.assign(getCookie(), {
          customerId: 'TEST'
        })
      );
    });

    it('when id != customerId and no other customer data provided', done => {
      _ch('customer', {id: 'NO_TEST'});

      whenDone(() => {
        expect(
          debugMsg('The provided id conflicts with the id stored in the cookie')
        ).to.be.true;
        done();
      });
    });

    it('when sessions api respond with error', done => {
      _ch('customer', {id: 'NO_TEST', externalId: 'ANOTHER_ID'});

      requests[0].respond(500, {}, 'KO');

      whenDone(() => {
        expect(debugMsg('KO')).to.be.true;
        done();
      });
    });

    it('when customers api respond with error', done => {
      _ch('customer', {id: 'TEST', externalId: 'ANOTHER_ID'});

      whenDone(() => {
        requests[0].respond(500, {}, 'KO');

        whenDone(() => {
          expect(debugMsg('KO')).to.be.true;
          done();
        });
      });
    });
  });

  describe('when customerId is NOT provided it should logs catched promise rejection', () => {
    beforeEach(() => {
      setConfig(true);
    });

    it('when sessions api respond with error', done => {
      _ch('customer', {id: 'TEST'});

      requests[0].respond(500, {}, 'KO');

      whenDone(() => {
        expect(debugMsg('KO')).to.be.true;
        done();
      });
    });

    it('when customers api respond with error', done => {
      _ch('customer', {id: 'TEST'});

      whenDone(() => {
        requests[0].respond(500, {}, 'KO');

        whenDone(() => {
          expect(debugMsg('KO')).to.be.true;
          done();
        });
      });
    });
  });

  describe('when customerId is provided and id is not provided it should logs catched promise rejection', () => {
    beforeEach(() => {
      setConfig(true);
      cookies.set(
        cookieName,
        Object.assign(getCookie(), {
          customerId: 'TEST'
        })
      );
    });

    it('when customers api respond with error', done => {
      _ch('customer', {externalId: 'ANOTHER_ID'});

      requests[0].respond(500, {}, 'KO');

      whenDone(() => {
        whenDone(() => {
          expect(debugMsg('KO')).to.be.true;
          done();
        });
      });
    });
  });

  describe('when customerId and id are not provided it should logs catched promise rejection', () => {
    beforeEach(() => {
      setConfig(true);
    });

    it('when customers api respond with error', done => {
      _ch('customer', {});

      requests[0].respond(500, {}, 'KO');

      whenDone(() => {
        whenDone(() => {
          expect(debugMsg('KO')).to.be.true;
          done();
        });
      });
    });

    it('when customer api respond with error (on merge)', done => {
      _ch('customer', {});

      whenDone(() => {
        requests[0].respond(500, {}, 'KO');

        whenDone(() => {
          expect(debugMsg('KO')).to.be.true;
          done();
        });
      });
    });

    it('when sessions api respond with error', done => {
      _ch('customer', {});

      whenDone(() => {
        whenDone(() => {
          requests[0].respond(500, {}, 'KO');

          whenDone(() => {
            expect(debugMsg('KO')).to.be.true;
            done();
          });
        });
      });
    });
  });
});
