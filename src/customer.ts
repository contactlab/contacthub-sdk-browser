import {Err, patch, post} from '@contactlab/appy';
import {withBody} from '@contactlab/appy/combinators/body';
import {Decoder, withDecoder} from '@contactlab/appy/combinators/decoder';
import {withHeaders} from '@contactlab/appy/combinators/headers';
import * as E from 'fp-ts/Either';
import {stringify} from 'fp-ts/Json';
import * as RTE from 'fp-ts/ReaderTaskEither';
import * as TE from 'fp-ts/TaskEither';
import {constant, constVoid, pipe} from 'fp-ts/function';
import sha256 from 'jssha/dist/sha256';
import {v4 as uuidv4} from 'uuid';
import * as C from './cookie';
import {Global} from './global';
import {Runner} from './runner';

type Nullable<A> = A | null;

export interface CustomerEnv extends C.CookieSvc, Global, Runner {}

export interface Customer {
  (options?: CustomerData): void;
}

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

export const customer =
  (Env: CustomerEnv): Customer =>
  options => {
    const op = !options ? resetCookie : prepareOperation(options);

    return Env.runAsync(op(Env));
  };

const prepareOperation =
  (data: CustomerData): Eff<CustomerEnv, void> =>
  Env =>
    pipe(
      TE.Do,
      TE.apS('ctx', readCookie(Env)),
      TE.apS('hash', pipe(computeHash(data), TE.fromEither)),
      TE.chain(({ctx, hash}) => {
        if (ctx.hash === hash) {
          return TE.right(undefined);
        }

        const result = operation(data.id, ctx.customerId);

        return result({...Env, data, hash});
      }),
      TE.map(constVoid)
    );

const operation = (cid?: string | null, cookieId?: string): Operation => {
  if (cid && cookieId) {
    return pipe(
      resolveIdConflict(cid, cookieId),
      RTE.chain(updateCustomer),
      RTE.chain(store)
    );
  }

  if (cid) {
    return pipe(
      reconcileCustomer(cid),
      RTE.chain(updateCustomer),
      RTE.chain(store)
    );
  }

  if (cookieId) {
    return pipe(updateCustomer(cookieId), RTE.chain(store));
  }

  return pipe(createCustomer, RTE.chain(store), RTE.chain(reconcileCustomer));
};

// --- Helpers
interface Eff<R, A> extends RTE.ReaderTaskEither<R, Error, A> {}

interface OperationEnv extends CustomerEnv {
  data: CustomerData;
  hash: string;
}

interface Operation extends Eff<OperationEnv, string> {}

// TODO: could we do better?
const computeHash = (data: CustomerData): E.Either<Error, string> => {
  const {externalId, base, extended, consents, extra, tags} = data; // brrr....

  return pipe(
    stringify({externalId, base, extended, consents, extra, tags}),
    E.bimap(
      () => new Error('Customer data cannot be stringified'),
      d => {
        // eslint-disable-next-line new-cap
        const shaObj = new sha256('SHA-256', 'TEXT');
        shaObj.update(d);
        return shaObj.getHash('HEX');
      }
    )
  );
};

const readCookie = pipe(
  RTE.ask<CustomerEnv>(),
  RTE.chain(Env =>
    RTE.fromIOEither(Env.cookie.get(Env.cookieName(), C.CHDecoder))
  )
);

const writeCookie = <A>(x: A): Eff<CustomerEnv, void> =>
  pipe(
    RTE.ask<CustomerEnv>(),
    RTE.chain(Env => RTE.fromIOEither(Env.cookie.set(Env.cookieName(), x)))
  );

const resetCookie: Eff<CustomerEnv, void> = pipe(
  readCookie,
  RTE.chain(ctx =>
    writeCookie({
      ...ctx,
      sid: uuidv4(),
      customerId: undefined,
      hash: undefined
    })
  )
);

const createCustomer: Operation = Env =>
  pipe(
    readCookie(Env),
    TE.chain(({token, workspaceId, nodeId}) => {
      const endpoint = `${Env.apiUrl()}/workspaces/${workspaceId}/customers`;
      const req = pipe(
        post,
        withHeaders(stdHeaders(token)),
        withBody({...Env.data, nodeId}),
        withDecoder(CustomerDecoder),
        RTE.bimap(toError, resp => resp.data.id)
      );

      return req(endpoint);
    })
  );

const updateCustomer =
  (cid: string): Operation =>
  Env =>
    pipe(
      readCookie(Env),
      TE.chain(({token, workspaceId}) => {
        if (!shouldUpdate(Env.data)) {
          return TE.right(cid);
        }

        const endpoint = `${Env.apiUrl()}/workspaces/${workspaceId}/customers/${cid}`;
        const req = pipe(
          patch,
          withHeaders(stdHeaders(token)),
          withBody(Env.data),
          RTE.bimap(toError, constant(cid))
        );

        return req(endpoint);
      })
    );

const reconcileCustomer =
  (cid: string): Operation =>
  Env =>
    pipe(
      readCookie(Env),
      TE.chain(({workspaceId, token, sid}) => {
        const endpoint = `${Env.apiUrl()}/workspaces/${workspaceId}/customers/${cid}/sessions`;
        const req = pipe(
          post,
          withHeaders(stdHeaders(token)),
          withBody({value: sid}),
          RTE.bimap(toError, constant(cid))
        );

        return req(endpoint);
      })
    );

const resolveIdConflict = (cid: string, cookieId: string): Operation =>
  pipe(
    RTE.ask<OperationEnv>(),
    RTE.chain(({data}) => {
      if (cid === cookieId) {
        return RTE.right(cid);
      }

      // FIXME: tell me why...
      if (!shouldUpdate(data)) {
        return RTE.left(
          new Error(
            'The provided id conflicts with the id stored in the cookie'
          )
        );
      }

      return pipe(
        resetCookie,
        RTE.chain(() => reconcileCustomer(cid))
      );
    })
  );

const store =
  (customerId: string): Operation =>
  Env =>
    pipe(
      readCookie(Env),
      TE.chain(ctx => writeCookie({...ctx, customerId, hash: Env.hash})(Env)),
      TE.map(constant(customerId))
    );

const CustomerDecoder: Decoder<{id: string}> = u => {
  const o = u as {id: string};

  return typeof o.id === 'string'
    ? E.right(o)
    : E.left(new Error('Customer id has to be a string'));
};

const toError = (e: Err): Error => e.error;

const stdHeaders = (token: string): Record<string, string> => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
});

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
