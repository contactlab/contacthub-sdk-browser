/* global describe, it, beforeEach, afterEach */

import {expect} from 'chai';
import cookies from 'js-cookie';
import sinon from 'sinon';
import {ConfigOptions} from '../../src/config';
import {CustomerData} from '../../src/customer';

const apiUrl = 'https://api.contactlab.it/hub/v1';
const cookieName = '_ch';

const config: ConfigOptions = {
  workspaceId: 'workspace_id',
  nodeId: 'node_id',
  token: 'ABC123'
};

const CUSTOMER: CustomerData = {
  externalId: 'foo.bar',
  base: {
    firstName: 'foo',
    lastName: 'bar',
    dob: '1980-03-17',
    contacts: {
      email: 'foo.bar@example.com'
    }
  }
};

const _ch = window.ch;

const getCookie = () => cookies.getJSON(cookieName) || {};

const setConfig = (d?: boolean): void => {
  const debug = d || false;

  _ch('config', {...config, debug});
};

let spyError: sinon.SinonStub<any[], void>;
let requests: sinon.SinonFakeXMLHttpRequest[] = [];
let xhr: sinon.SinonFakeXMLHttpRequestStatic;

// Mocked Ajax calls return immediately but need a short setTimeout to avoid
// race conditions. 0 ms works fine on all browsers except IE 10 which requires
// at least 2 ms.
// TODO: find a more elegant way to mock Ajax calls
const whenDone = (f: () => void): void => {
  setTimeout(() => f(), 2);
};

const debugMsg = (msg: string): boolean =>
  spyError.calledWith('[DEBUG] @contactlab/sdk-browser', msg);

describe('Customer API:', () => {
  beforeEach(() => {
    spyError = sinon.stub(console, 'error').callsFake(() => undefined);
    cookies.remove(cookieName);
    requests = [];
    xhr = sinon.useFakeXMLHttpRequest();
    xhr.onCreate = r => {
      requests.push(r);
    };
  });

  afterEach(done => {
    spyError.restore();
    whenDone(() => done());
  });

  it('checks if required config is set', () => {
    expect(() => {
      _ch('customer', CUSTOMER);
    }).to.throw(Error);

    expect(requests.length).to.equal(0);
  });

  describe('when a customerId is not provided', () => {
    describe('and no customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
        _ch('customer', CUSTOMER);
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
            externalId: CUSTOMER.externalId,
            base: CUSTOMER.base
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
            JSON.stringify({data: {customer: {id: 'existing-cid'}}})
          );

          whenDone(() => {
            expect(requests.length).to.equal(2);
            const req = requests[1];
            expect(req.method).to.equal('PATCH');
            expect(req.url).to.equal(
              `${apiUrl}/workspaces/${config.workspaceId}/customers/existing-cid`
            );
            expect(JSON.parse(req.requestBody)).to.eql({
              externalId: CUSTOMER.externalId,
              base: CUSTOMER.base
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
            expect(getCookie().hash).not.to.equal(undefined);

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

        cookies.set(cookieName, {...getCookie(), customerId: 'my-cid'});

        _ch('customer', CUSTOMER);
      });

      it('updates the customer', () => {
        expect(requests.length).to.equal(1);
        const req = requests[0];
        expect(req.method).to.equal('PATCH');
        expect(req.url).to.equal(
          `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid`
        );
        expect(JSON.parse(req.requestBody)).to.eql({
          externalId: CUSTOMER.externalId,
          base: CUSTOMER.base
        });
      });

      it('does not update the customer if the same data is sent', done => {
        requests[0].respond(200, {}, '');

        whenDone(() => {
          _ch('customer', CUSTOMER);

          expect(requests.length).to.equal(1);

          done();
        });
      });

      it('does update the customer if updated data is sent', done => {
        requests[0].respond(200, {}, '');

        whenDone(() => {
          if (CUSTOMER.base) {
            CUSTOMER.base.lastName = 'Baz';
          }

          _ch('customer', CUSTOMER);

          expect(requests.length).to.equal(2);

          done();
        });
      });

      it('does update the customer if only the externalId has changed', done => {
        requests[0].respond(200, {}, '');

        whenDone(() => {
          CUSTOMER.externalId = 'fuz';

          _ch('customer', CUSTOMER);

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
        cookies.set(cookieName, {...getCookie(), customerId: 'my-cid'});

        _ch('customer', {id: 'my-cid'});
      });

      it('does not make any API call', () => {
        expect(requests.length).to.equal(0);
      });
    });

    describe('and a different customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();
        cookies.set(cookieName, {...getCookie(), customerId: 'different-cid'});

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
        cookies.set(cookieName, {...getCookie(), customerId: 'my-cid'});

        _ch('customer', {...CUSTOMER, id: 'my-cid'});
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
            externalId: CUSTOMER.externalId,
            base: CUSTOMER.base
          });

          done();
        });
      });
    });

    describe('and a different customerId is stored in the cookie', () => {
      beforeEach(() => {
        setConfig();

        cookies.set(cookieName, {...getCookie(), customerId: 'different-cid'});
      });

      it('resets the sessionId', () => {
        const {sid} = getCookie();

        _ch('customer', {...CUSTOMER, id: 'my-cid'});

        expect(getCookie().sid).not.to.eql(sid);
      });

      it('reconciles the new sessionId with the customerId', done => {
        _ch('customer', {...CUSTOMER, id: 'my-cid'});

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
        _ch('customer', {...CUSTOMER, id: 'my-cid'});

        requests[0].respond(200, {}, '');

        whenDone(() => {
          expect(requests.length).to.equal(2);
          const req = requests[1];
          expect(req.method).to.equal('PATCH');
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            externalId: CUSTOMER.externalId,
            base: CUSTOMER.base
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

        _ch('customer', {...CUSTOMER, id: 'my-cid'});

        expect(getCookie().sid).to.eql(sid);
      });

      it('reconciles the sessionId with the customerId', done => {
        const {sid} = getCookie();

        _ch('customer', {...CUSTOMER, id: 'my-cid'});

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
        _ch('customer', {...CUSTOMER, id: 'my-cid'});

        requests[0].respond(200, {}, '');

        whenDone(() => {
          expect(requests.length).to.equal(2);
          const req = requests[1];
          expect(req.method).to.equal('PATCH');
          expect(req.url).to.equal(
            `${apiUrl}/workspaces/${config.workspaceId}/customers/my-cid`
          );
          expect(JSON.parse(req.requestBody)).to.eql({
            externalId: CUSTOMER.externalId,
            base: CUSTOMER.base
          });

          done();
        });
      });
    });
  });

  describe('when no object is provided', () => {
    beforeEach(() => {
      setConfig();

      cookies.set(cookieName, {
        ...getCookie(),
        customerId: 'old-customer-id',
        sid: 'old-session-id'
      });

      _ch('customer');
    });

    it('removes user data from cookie', () => {
      expect(getCookie().customerId).to.equal(undefined);
    });

    it('generates a new sessionId', () => {
      const sid =
        /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

      expect(sid.test(getCookie().sid)).to.equal(true);
    });
  });

  // --- Rejections
  describe('when id and customerId are provided it should logs catched promise rejection', () => {
    beforeEach(() => {
      setConfig(true);

      cookies.set(cookieName, {...getCookie(), customerId: 'TEST'});
    });

    it('when id != customerId and no other customer data provided', done => {
      _ch('customer', {id: 'NO_TEST'});

      whenDone(() => {
        expect(
          debugMsg('The provided id conflicts with the id stored in the cookie')
        ).to.equal(true);

        done();
      });
    });

    it('when sessions api respond with error', done => {
      _ch('customer', {id: 'NO_TEST', externalId: 'ANOTHER_ID'});

      requests[0].respond(500, {}, 'KO');

      whenDone(() => {
        expect(debugMsg('KO')).to.equal(true);

        done();
      });
    });

    it('when customers api respond with error', done => {
      _ch('customer', {id: 'TEST', externalId: 'ANOTHER_ID'});

      whenDone(() => {
        requests[0].respond(500, {}, 'KO');

        whenDone(() => {
          expect(debugMsg('KO')).to.equal(true);

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
        expect(debugMsg('KO')).to.equal(true);

        done();
      });
    });

    it('when customers api respond with error', done => {
      _ch('customer', {id: 'TEST'});

      whenDone(() => {
        requests[0].respond(500, {}, 'KO');

        whenDone(() => {
          expect(debugMsg('KO')).to.equal(true);

          done();
        });
      });
    });
  });

  describe('when customerId is provided and id is not provided it should logs catched promise rejection', () => {
    beforeEach(() => {
      setConfig(true);

      cookies.set(cookieName, {...getCookie(), customerId: 'TEST'});
    });

    it('when customers api respond with error', done => {
      _ch('customer', {externalId: 'ANOTHER_ID'});

      requests[0].respond(500, {}, 'KO');

      whenDone(() => {
        whenDone(() => {
          expect(debugMsg('KO')).to.equal(true);

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
          expect(debugMsg('KO')).to.equal(true);

          done();
        });
      });
    });

    it('when customer api respond with error (on merge)', done => {
      _ch('customer', {});

      whenDone(() => {
        requests[0].respond(500, {}, 'KO');

        whenDone(() => {
          expect(debugMsg('KO')).to.equal(true);

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
            expect(debugMsg('KO')).to.equal(true);

            done();
          });
        });
      });
    });
  });
});
