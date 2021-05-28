/* global describe, it, beforeEach, afterEach */

import {expect} from 'chai';
import cookies from 'js-cookie';
import {CustomerData} from '../../src/customer';
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

    H._ch('customer', CUSTOMER);

    await H.whenDone();

    const [create] = H._fetchMock.calls();
    const [, opts] = create;
    const body = opts?.body as unknown as string;

    expect(JSON.parse(body).consents).to.eql(CUSTOMER.consents);
  });

  it('can be updated', async () => {
    H._fetchMock.mock(
      `begin:${H.API}/workspaces/${H.WSID}/customers/${H.CID}`,
      200
    );

    cookies.set(H.CH, {...cookies.getJSON(H.CH), customerId: H.CID});

    H._ch('customer', CUSTOMER);

    await H.whenDone();

    H._ch('customer', {
      ...CUSTOMER,
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

// --- Helpers
const CUSTOMER: CustomerData = {
  externalId: 'foo.bar',
  base: {
    firstName: 'foo',
    lastName: 'bar',
    dob: '1980-03-17',
    contacts: {
      email: 'foo.bar@example.com'
    }
  },
  consents: {
    disclaimer: {
      date: '2018-04-28:16:01Z',
      version: 'v1.0'
    },
    marketing: {
      automatic: {
        sms: {
          status: true,
          limitation: true
        }
      }
    }
  }
};
