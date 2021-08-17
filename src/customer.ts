/**
 * @since 2.0.0
 */

import {Either, right, left} from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import {constVoid, pipe} from 'fp-ts/function';
import sha256 from 'jssha/dist/sha256';
import {CookieSvc} from './cookie';
import {HttpSvc} from './http';
import {Effect} from './program';
import {getNodeAndToken} from './target';
import {UuisSvc} from './uuid';

type Nullable<A> = A | null;

/**
 * Defines capabilities and services required by the `customer` method in order to work.
 *
 * @category capabilities
 * @since 2.0.0
 */
export interface CustomerEnv extends HttpSvc, CookieSvc, UuisSvc {}

/**
 * Defines the `customer` method signature.
 *
 * @category model
 * @since 2.0.0
 */
export interface Customer {
  (options?: CustomerData): Effect;
}

/**
 * Defines the `customer` method options.
 *
 * @category model
 * @since 2.0.0
 */
export interface CustomerData {
  id?: Nullable<string>;
  externalId?: Nullable<string>;
  base?: Nullable<CustomerBase>;
  extended?: Nullable<Record<string, unknown>>;
  consents?: Nullable<CustomerConsents>;
  extra?: Nullable<string>;
  tags?: Nullable<CustomerTags>;
}

interface CustomerBase {
  pictureUrl?: Nullable<string>;
  title?: Nullable<string>;
  prefix?: Nullable<string>;
  firstName?: Nullable<string>;
  lastName?: Nullable<string>;
  middleName?: Nullable<string>;
  gender?: Nullable<string>;
  dob?: Nullable<string>;
  locale?: Nullable<string>;
  timezone?: Nullable<string>;
  contacts?: Nullable<CustomerContacts>;
  address?: Nullable<CustomerAddress>;
  credential?: Nullable<CustomerCredential>;
  educations?: Nullable<CustomerEducation[]>;
  likes?: Nullable<CustomerLike[]>;
  socialProfile?: Nullable<CustomerSocial>;
  jobs?: Nullable<CustomerJob[]>;
  subscriptions?: Nullable<CustomerSubscription[]>;
}

interface CustomerConsents {
  disclaimer?: Nullable<{
    date?: Nullable<string>;
    version?: Nullable<string>;
  }>;
  marketing?: Nullable<{
    traditional?: Nullable<{
      telephonic?: Nullable<ConsentStatus>;
      papery?: Nullable<ConsentStatus>;
    }>;
    automatic?: Nullable<{
      sms?: Nullable<ConsentStatus>;
      email?: Nullable<ConsentStatus>;
      push?: Nullable<ConsentStatus>;
      im?: Nullable<ConsentStatus>;
      telephonic?: Nullable<ConsentStatus>;
    }>;
  }>;
  profiling?: Nullable<{
    classic?: Nullable<ConsentStatus>;
    online?: Nullable<ConsentStatus>;
  }>;
  softSpam?: Nullable<{
    email?: Nullable<ConsentStatus>;
    papery?: Nullable<ConsentStatus>;
  }>;
  thirdPartyTransfer?: Nullable<{
    profiling?: Nullable<ConsentStatus>;
    marketing?: Nullable<ConsentStatus>;
  }>;
}

interface ConsentStatus {
  status?: Nullable<boolean>;
  limitation?: Nullable<boolean>;
  objection?: Nullable<boolean>;
}

interface CustomerTags {
  auto?: string[];
  manual?: string[];
}

interface CustomerContacts {
  email?: Nullable<string>;
  fax?: Nullable<string>;
  mobilePhone?: Nullable<string>;
  phone?: Nullable<string>;
  otherContacts?: Nullable<string>;
  mobileDevices?: Nullable<string>;
}

interface CustomerAddress {
  street?: Nullable<string>;
  city?: Nullable<string>;
  country?: Nullable<string>;
  province?: Nullable<string>;
  zip?: Nullable<string>;
  geo?: Nullable<CustomerGeo>;
}

interface CustomerGeo {
  lat: string;
  lon: string;
}

interface CustomerCredential {
  username?: Nullable<string>;
  password?: Nullable<string>;
}

interface CustomerEducation {
  id: string;
  schoolType?: Nullable<string>;
  schoolName?: Nullable<string>;
  schoolConcentration?: Nullable<string>;
  startYear?: Nullable<number>;
  endYear?: Nullable<number>;
  isCurrent?: Nullable<boolean>;
}

interface CustomerLike {
  id: string;
  category?: Nullable<string>;
  name?: Nullable<string>;
  createdTime?: Nullable<string>;
}

interface CustomerSocial {
  facebook?: Nullable<string>;
  google?: Nullable<string>;
  instagram?: Nullable<string>;
  linkedin?: Nullable<string>;
  qzone?: Nullable<string>;
  twitter?: Nullable<string>;
}

interface CustomerJob {
  id: string;
  companyIndustry?: Nullable<string>;
  companyName?: Nullable<string>;
  jobTitle?: Nullable<string>;
  startDate?: Nullable<string>;
  endDate?: Nullable<string>;
  isCurrent?: Nullable<boolean>;
}

interface CustomerSubscription {
  id: string;
  name?: Nullable<string>;
  type?: Nullable<string>;
  kind?: Nullable<string>;
  subscribed?: Nullable<boolean>;
  startDate?: Nullable<string>;
  endDate?: Nullable<string>;
  subscriberId?: Nullable<string>;
  registeredAt?: Nullable<string>;
  updatedAt?: Nullable<string>;
  preferences: Array<{
    key?: Nullable<string>;
    value?: Nullable<string>;
  }>;
}

/**
 * SDK's customer method: creates, updates, reconcile and stores provided customer's data.
 *
 * @category methods
 * @since 2.0.0
 */
export const customer =
  (E: CustomerEnv): Customer =>
  options => {
    const op =
      typeof options === 'undefined' ? resetCookie : prepareEffect(options);

    return op(E);
  };

const prepareEffect =
  (data: CustomerData) =>
  (E: CustomerEnv): Effect =>
    pipe(
      TE.Do,
      TE.apS('ctx', E.cookie.getHub()),
      TE.apS('hash', pipe(computeHash(data), TE.fromEither)),
      TE.chain(({ctx, hash}) => {
        if (ctx.hash === hash) {
          return TE.right(undefined);
        }

        const cid = data.id;
        const cookieId = ctx.customerId;
        const OEnv = {...E, data, hash};
        const create = createCustomer(OEnv);
        const update = updateCustomer(OEnv);
        const reconcile = reconcileCustomer(OEnv);
        const resolve = resolveIdConflict(OEnv);

        if (cid && cookieId) {
          return pipe(
            resolve(cid, cookieId),
            TE.chain(() => update(cid))
          );
        }

        if (cid) {
          return pipe(
            reconcile(cid),
            TE.chain(() => update(cid))
          );
        }

        if (cookieId) {
          return update(cookieId);
        }

        return pipe(create, TE.chain(reconcile));
      })
    );

// --- Helpers
interface EffectEnv extends CustomerEnv {
  data: CustomerData;
  hash: string;
}

// TODO: could we do better?
const computeHash = (data: CustomerData): Either<Error, string> => {
  const {externalId, base, extended, consents, extra, tags} = data; // brrr....

  try {
    const d = JSON.stringify({
      externalId,
      base,
      extended,
      consents,
      extra,
      tags
    });
    // eslint-disable-next-line new-cap
    const shaObj = new sha256('SHA-256', 'TEXT');
    shaObj.update(d);

    return right(shaObj.getHash('HEX'));
  } catch (e) {
    return left(new Error('Customer data cannot be stringified'));
  }
};

const resetCookie = (E: CustomerEnv): Effect =>
  pipe(
    E.cookie.getHub(),
    TE.chain(ctx =>
      E.cookie.setHub({
        ...ctx,
        sid: E.uuid.v4(),
        customerId: undefined,
        hash: undefined
      })
    )
  );

const createCustomer = (E: EffectEnv): Effect<string> =>
  pipe(
    E.cookie.getHub(),
    TE.bindTo('ch'),
    TE.bind('nt', ({ch}) => getNodeAndToken(ch)),
    TE.chain(({ch, nt}) =>
      E.http.post(
        `/workspaces/${ch.workspaceId}/customers`,
        {...E.data, nodeId: nt.nodeId},
        nt.token
      )
    ),
    TE.chain(u => {
      const o = u as {id: string};

      return typeof o.id === 'string'
        ? TE.right(o.id)
        : TE.left(new Error('Customer id has to be a string'));
    }),
    TE.chainFirst(storeCustomer(E))
  );

const updateCustomer =
  (E: EffectEnv) =>
  (cid: string): Effect =>
    pipe(
      E.cookie.getHub(),
      TE.bindTo('ch'),
      TE.bind('nt', ({ch}) => getNodeAndToken(ch)),
      TE.chain(({ch, nt}) => {
        if (!shouldUpdate(E.data)) {
          return TE.right(undefined);
        }

        return E.http.patch(
          `/workspaces/${ch.workspaceId}/customers/${cid}`,
          E.data,
          nt.token
        );
      }),
      TE.chain(() => storeCustomer(E)(cid))
    );

const reconcileCustomer =
  (E: EffectEnv) =>
  (cid: string): Effect =>
    pipe(
      E.cookie.getHub(),
      TE.bindTo('ch'),
      TE.bind('nt', ({ch}) =>
        pipe(
          getNodeAndToken(ch),
          // keep executing reconciliation even if getting AGGREGATE node and token fails
          TE.alt(() => TE.right({nodeId: ch.nodeId, token: ch.token}))
        )
      ),
      TE.chain(({ch, nt}) =>
        E.http.post(
          `/workspaces/${ch.workspaceId}/customers/${cid}/sessions`,
          {value: ch.sid},
          nt.token
        )
      ),
      TE.map(constVoid)
    );

const resolveIdConflict =
  (E: EffectEnv) =>
  (cid: string, cookieId: string): Effect => {
    if (cid === cookieId) {
      return TE.right(undefined);
    }

    // FIXME: tell me why...
    if (!shouldUpdate(E.data)) {
      return TE.left(
        new Error('The provided id conflicts with the id stored in the cookie')
      );
    }

    return pipe(
      resetCookie(E),
      TE.chain(() => reconcileCustomer(E)(cid))
    );
  };

const storeCustomer =
  (E: EffectEnv) =>
  (customerId: string): Effect =>
    pipe(
      E.cookie.getHub(),
      TE.chain(ctx => E.cookie.setHub({...ctx, customerId, hash: E.hash}))
    );

// FIXME: do we REALLY need this???
const shouldUpdate = (data: CustomerData): boolean => {
  if (
    data.externalId ||
    data.base ||
    data.extended ||
    data.consents ||
    data.extra ||
    data.tags
  ) {
    return true;
  } else {
    return false;
  }
};
