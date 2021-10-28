import {expect} from 'chai';
import * as C from '../_helpers';
import * as H from './_helpers';

describe('Customer API:', () => {
  beforeEach(() => {
    C.removeCookie(H.CH);
  });

  afterEach(() => {
    H.spy.resetHistory();

    H._fetchMock.resetHistory();
  });

  describe('when required config is not set', () => {
    it('should log error', async () => {
      expect(() => {
        H._ch('customer', H.CUSTOMER);
      }).not.to.throw();

      await H.whenDone();

      expect(
        H.spy.calledWith(
          '[DEBUG] @contactlab/sdk-browser',
          'Missing "_ch" cookie'
        )
      ).to.equal(true);

      expect(H._fetchMock.called()).to.equal(false);
    });
  });

  describe('when a customerId is not provided', () => {
    it('should create, store and reconcile if `customerId` is not in cookie', async () => {
      H._fetchMock
        .post(`${H.API}/workspaces/${H.WSID}/customers`, {id: H.CID})
        .post(`${H.API}/workspaces/${H.WSID}/customers/${H.CID}/sessions`, 200);

      await H.setConfig();

      H._ch('customer', H.CUSTOMER);

      await H.whenDone();

      expect(H._fetchMock.calls().length).to.equal(2);
      const [create, reconcile] = H._fetchMock.calls();

      // --- create
      const [, createOpts] = create;
      const createBody = createOpts?.body as unknown as string;
      const createHeaders = createOpts?.headers as any;

      expect(JSON.parse(createBody)).to.eql({...H.CUSTOMER, nodeId: H.NID});
      expect(createHeaders.Authorization).to.equal(`Bearer ${H.TOKEN}`);

      // --- from cookie
      const {customerId, hash, sid} = C.getCookieJSON(H.CH);

      // --- store
      expect(customerId).to.equal(H.CID);
      expect(hash).not.to.equal(undefined);

      // --- reconcile
      const [, reconcileOpts] = reconcile;
      const reconcileBody = reconcileOpts?.body as unknown as string;
      expect(JSON.parse(reconcileBody)).to.eql({value: sid});
    });

    it('should update the customer if `customerId` is in cookie', async () => {
      H._fetchMock
        .patch(`${H.API}/workspaces/${H.WSID}/customers/${H.CID}`, 200)
        .post(`${H.API}/workspaces/${H.WSID}/customers/${H.CID}/sessions`, 200);

      await H.setConfig();

      C.setCookieJSON(H.CH, {...C.getCookieJSON(H.CH), customerId: H.CID});

      H._ch('customer', H.CUSTOMER);

      await H.whenDone();

      const method = H._fetchMock.lastOptions()?.method;
      const body = H._fetchMock.lastOptions()?.body as unknown as string;

      expect(method).to.equal('PATCH');

      expect(JSON.parse(body)).to.eql(H.CUSTOMER);

      // --- does not update the customer if the same data is sent
      H._ch('customer', H.CUSTOMER);

      await H.whenDone();

      expect(H._fetchMock.calls().length).to.equal(1);

      // --- does update the customer if updated data is sent
      H._ch('customer', {...H.CUSTOMER, externalId: 'baz'});

      await H.whenDone();

      const body2 = H._fetchMock.lastOptions()?.body as unknown as string;

      expect(JSON.parse(body2)).to.eql({...H.CUSTOMER, externalId: 'baz'});
    });
  });

  describe('when a customerId is provided but no customer data', () => {
    it('should not not make any API call if the same customerId is in cookie', async () => {
      await H.setConfig();

      C.setCookieJSON(H.CH, {...C.getCookieJSON(H.CH), customerId: H.CID});

      H._ch('customer', {id: H.CID});

      await H.whenDone();

      expect(H._fetchMock.called()).not.to.equal(true);
    });

    it('should not make any API call if a different customerId is in cookie', async () => {
      await H.setConfig();

      C.setCookieJSON(H.CH, {
        ...C.getCookieJSON(H.CH),
        customerId: 'different-cid'
      });

      H._ch('customer', {id: H.CID});

      expect(H._fetchMock.called()).to.equal(false);
    });

    it('should reconcile and store if no customerId is in cookie', async () => {
      H._fetchMock.post(
        `${H.API}/workspaces/${H.WSID}/customers/${H.CID}/sessions`,
        200
      );

      await H.setConfig();

      const {sid} = C.getCookieJSON(H.CH);

      H._ch('customer', {id: H.CID});

      await H.whenDone();

      // --- does not reset the sessionId
      expect(C.getCookieJSON(H.CH).sid).to.eql(sid);

      // --- reconciles the sessionId with the customerId
      const body = H._fetchMock.lastOptions()?.body as unknown as string;

      expect(JSON.parse(body)).to.eql({value: sid});

      // --- does not make additional API requests

      expect(H._fetchMock.calls().length).to.equal(1);
    });
  });

  describe('when a customerId is provided along with some customer data', () => {
    it('should update customer if the same customerId is in cookie', async () => {
      H._fetchMock.patch(
        `${H.API}/workspaces/${H.WSID}/customers/${H.CID}`,
        200
      );

      await H.setConfig();

      C.setCookieJSON(H.CH, {...C.getCookieJSON(H.CH), customerId: H.CID});

      H._ch('customer', {...H.CUSTOMER, id: H.CID});

      await H.whenDone();

      expect(H._fetchMock.calls().length).to.equal(1);
      const opts = H._fetchMock.lastOptions();
      const body = opts?.body as unknown as string;
      expect(opts?.method).to.equal('PATCH');
      expect(JSON.parse(body)).to.eql({...H.CUSTOMER, id: H.CID});
    });

    it('should reset, reconcile and update if a different customerId is in cookie', async () => {
      H._fetchMock
        .patch(`${H.API}/workspaces/${H.WSID}/customers/${H.CID}`, 200)
        .post(`${H.API}/workspaces/${H.WSID}/customers/${H.CID}/sessions`, 200);

      await H.setConfig();

      C.setCookieJSON(H.CH, {
        ...C.getCookieJSON(H.CH),
        customerId: 'different-cid'
      });

      const {sid} = C.getCookieJSON(H.CH);

      H._ch('customer', {...H.CUSTOMER, id: H.CID});

      await H.whenDone();

      const newSid = C.getCookieJSON(H.CH).sid;

      const [reconcile, update] = H._fetchMock.calls();

      // --- resets the sessionId
      expect(newSid).not.to.eql(sid);

      // ---- reconciles the new sessionId with the customerId'
      const [, reconcileOpts] = reconcile;
      const reconcileBody = reconcileOpts?.body as unknown as string;

      expect(JSON.parse(reconcileBody)).to.eql({value: newSid});

      // --- updates the customer
      const [, updateOpts] = update;
      const updateBody = updateOpts?.body as unknown as string;

      expect(updateOpts?.method).to.equal('PATCH');
      expect(JSON.parse(updateBody)).to.eql({...H.CUSTOMER, id: H.CID});
    });

    it('should reconcile and update but not reset if no customerId is in cookie', async () => {
      H._fetchMock
        .patch(`${H.API}/workspaces/${H.WSID}/customers/${H.CID}`, 200)
        .post(`${H.API}/workspaces/${H.WSID}/customers/${H.CID}/sessions`, 200);

      await H.setConfig();

      const {sid} = C.getCookieJSON(H.CH);

      H._ch('customer', {...H.CUSTOMER, id: H.CID});

      await H.whenDone();

      const newSid = C.getCookieJSON(H.CH).sid;

      const [reconcile, update] = H._fetchMock.calls();

      // --- does not reset the sessionId
      expect(newSid).to.equal(sid);

      // --- reconciles the sessionId with the customerId
      const [, reconcileOpts] = reconcile;
      const reconcileBody = reconcileOpts?.body as unknown as string;

      expect(JSON.parse(reconcileBody)).to.eql({value: sid});

      // --- updates the customer
      const [, updateOpts] = update;
      const updateBody = updateOpts?.body as unknown as string;

      expect(updateOpts?.method).to.equal('PATCH');
      expect(JSON.parse(updateBody)).to.eql({...H.CUSTOMER, id: H.CID});
    });
  });

  describe('when no object is provided', () => {
    it('should remove user data from cookie and generate new session', async () => {
      await H.setConfig();

      C.setCookieJSON(H.CH, {
        ...C.getCookieJSON(H.CH),
        customerId: 'old-customer-id',
        sid: 'old-session-id'
      });

      H._ch('customer');

      await H.whenDone();

      const {customerId, sid} = C.getCookieJSON(H.CH);

      const sidRgx =
        /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

      expect(customerId).to.equal(undefined);

      expect(sidRgx.test(sid)).to.equal(true);
    });
  });

  // --- Rejections
  describe('when id and customerId are provided', () => {
    const OTHER_CID = 'efgh';

    beforeEach(async () => {
      await H.setConfig();

      C.setCookieJSON(H.CH, {...C.getCookieJSON(H.CH), customerId: H.CID});
    });

    it('should log errors if id != customerId and no other customer data provided', async () => {
      H._ch('customer', {id: OTHER_CID});

      await H.whenDone();

      expect(
        H.spy.calledWith(
          '[DEBUG] @contactlab/sdk-browser',
          'The provided id conflicts with the id stored in the cookie'
        )
      ).to.equal(true);
    });

    it('should log errors if sessions api respond with error', async () => {
      H._fetchMock.post(
        `${H.API}/workspaces/${H.WSID}/customers/${OTHER_CID}/sessions`,
        500
      );

      H._ch('customer', {id: OTHER_CID, externalId: 'ANOTHER_ID'});

      await H.whenDone();

      expect(
        H.spy.calledWith(
          '[DEBUG] @contactlab/sdk-browser',
          'Request responded with status code 500'
        )
      ).to.equal(true);
    });

    it('should log errors if customers api respond with error', async () => {
      H._fetchMock
        .patch(`${H.API}/workspaces/${H.WSID}/customers/${OTHER_CID}`, 500)
        .post(
          `${H.API}/workspaces/${H.WSID}/customers/${OTHER_CID}/sessions`,
          200
        );

      H._ch('customer', {id: OTHER_CID, externalId: 'ANOTHER_ID'});

      await H.whenDone();

      expect(
        H.spy.calledWith(
          '[DEBUG] @contactlab/sdk-browser',
          'Request responded with status code 500'
        )
      ).to.equal(true);
    });
  });

  describe('when customerId is NOT provided', () => {
    const OTHER_CID = 'efgh';

    beforeEach(async () => {
      await H.setConfig();
    });

    it('should log errors if sessions api respond with error', async () => {
      H._fetchMock
        .patch(`${H.API}/workspaces/${H.WSID}/customers/${OTHER_CID}`, 200)
        .post(
          `${H.API}/workspaces/${H.WSID}/customers/${OTHER_CID}/sessions`,
          500
        );

      H._ch('customer', {id: OTHER_CID});

      await H.whenDone();

      expect(
        H.spy.calledWith(
          '[DEBUG] @contactlab/sdk-browser',
          'Request responded with status code 500'
        )
      ).to.equal(true);
    });

    it('should log errors if customers api respond with error', async () => {
      H._fetchMock
        .patch(`${H.API}/workspaces/${H.WSID}/customers/${OTHER_CID}`, 500)
        .post(
          `${H.API}/workspaces/${H.WSID}/customers/${OTHER_CID}/sessions`,
          200
        );

      H._ch('customer', {id: OTHER_CID, externalId: 'ANOTHER_ID'});

      await H.whenDone();

      expect(
        H.spy.calledWith(
          '[DEBUG] @contactlab/sdk-browser',
          'Request responded with status code 500'
        )
      ).to.equal(true);
    });
  });

  describe('when customerId is provided and id is not provided', () => {
    it('should log errors if customers api respond with error', async () => {
      H._fetchMock
        .patch(`${H.API}/workspaces/${H.WSID}/customers/${H.CID}`, 500)
        .post(`${H.API}/workspaces/${H.WSID}/customers/${H.CID}/sessions`, 200);

      await H.setConfig();

      C.setCookieJSON(H.CH, {...C.getCookieJSON(H.CH), customerId: H.CID});

      H._ch('customer', {externalId: 'ANOTHER_ID'});

      await H.whenDone();

      expect(
        H.spy.calledWith(
          '[DEBUG] @contactlab/sdk-browser',
          'Request responded with status code 500'
        )
      ).to.equal(true);
    });
  });

  describe('when customerId and id are not provided', () => {
    beforeEach(async () => {
      await H.setConfig();
    });

    it('should log errors if customers api respond with error', async () => {
      H._fetchMock
        .post(`${H.API}/workspaces/${H.WSID}/customers`, 500)
        .post(`${H.API}/workspaces/${H.WSID}/customers/${H.CID}/sessions`, 200);

      H._ch('customer', {});

      await H.whenDone();

      expect(
        H.spy.calledWith(
          '[DEBUG] @contactlab/sdk-browser',
          'Request responded with status code 500'
        )
      ).to.equal(true);
    });

    it('should log errors if sessions api respond with error', async () => {
      H._fetchMock
        .post(`${H.API}/workspaces/${H.WSID}/customers`, {id: H.CID})
        .post(`${H.API}/workspaces/${H.WSID}/customers/${H.CID}/sessions`, 500);

      H._ch('customer', {});

      await H.whenDone();

      expect(
        H.spy.calledWith(
          '[DEBUG] @contactlab/sdk-browser',
          'Request responded with status code 500'
        )
      ).to.equal(true);
    });
  });
});
