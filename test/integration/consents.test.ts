import {expect} from 'chai';
import cookies from 'js-cookie';
import * as H from './_helpers';

describe('Consents', () => {
  beforeEach(() => {
    cookies.remove(H.CH);

    H._ch('config', H.CONFIG);
  });

  afterEach(() => {
    H._fetchMock.resetHistory();
  });

  it('can be set', async () => {
    H._fetchMock
      .post(`${H.API}/workspaces/${H.WSID}/customers`, {id: H.CID})
      .post(`${H.API}/workspaces/${H.WSID}/customers/${H.CID}/sessions`, 200);

    H._ch('customer', H.CUSTOMER);

    await H.whenDone();

    const [create] = H._fetchMock.calls();
    const [, opts] = create;
    const body = opts?.body as unknown as string;

    expect(JSON.parse(body).consents).to.eql(H.CUSTOMER.consents);
  });

  it('can be updated', async () => {
    H._fetchMock.mock(
      `begin:${H.API}/workspaces/${H.WSID}/customers/${H.CID}`,
      200
    );

    cookies.set(H.CH, {...cookies.getJSON(H.CH), customerId: H.CID});

    H._ch('customer', H.CUSTOMER);

    await H.whenDone();

    H._ch('customer', {
      ...H.CUSTOMER,
      consents: {
        softSpam: {email: {objection: true}}
      }
    });

    await H.whenDone();

    const body = H._fetchMock.lastOptions()?.body as unknown as string;
    const method = H._fetchMock.lastOptions()?.method;
    const url = H._fetchMock.lastUrl();

    expect(method).to.equal('PATCH');
    expect(url).to.equal(
      `${H.API}/workspaces/${H.CONFIG.workspaceId}/customers/${H.CID}`
    );
    expect(JSON.parse(body).consents).to.eql({
      softSpam: {email: {objection: true}}
    });
  });
});
