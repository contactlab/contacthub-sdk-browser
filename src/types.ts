// export type Auth = {|
//   token: string,
//   workspaceId: string,
//   nodeId: string
// |};

// export type ContactHubCookie = Auth & {|
//   debug: boolean,
//   context: string,
//   contextInfo: Object,
//   sid: string,
//   customerId?: string,
//   hash?: string
// |};

// export type CustomerId = {|
//   customerId: string
// |};

type Nullable<A> = A | null;

export interface SDKFunction {
  q?: unknown[];

  (method: 'config', options: ConfigOptions): void;
  (method: 'event', options: EventOptions): void;
  (method: 'customer', options?: CustomerData): void;
}

export interface ConfigOptions {
  token: string;
  workspaceId: string;
  nodeId: string;
  context?: string;
  contextInfo?: unknown;
  debug?: boolean;
}

export interface EventOptions {
  type: string;
  properties?: unknown;
}

export interface CustomerData {
  id?: Nullable<string>;
  base?: Nullable<CustomerBase>;
  extended?: Nullable<unknown>;
  consents?: Nullable<CustomerConsents>;
  extra?: Nullable<string>;
  tags?: Nullable<CustomerTags>;
  externalId?: Nullable<string>;
}

export interface CustomerBase {
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

export interface CustomerConsents {
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

export interface ConsentStatus {
  status?: Nullable<boolean>;
  limitation?: Nullable<boolean>;
  objection?: Nullable<boolean>;
}

export interface CustomerTags {
  auto?: string[];
  manual?: string[];
}

export interface CustomerContacts {
  email?: Nullable<string>;
  fax?: Nullable<string>;
  mobilePhone?: Nullable<string>;
  phone?: Nullable<string>;
  otherContacts?: Nullable<string>;
  mobileDevices?: Nullable<string>;
}

export interface CustomerAddress {
  street?: Nullable<string>;
  city?: Nullable<string>;
  country?: Nullable<string>;
  province?: Nullable<string>;
  zip?: Nullable<string>;
  geo?: Nullable<CustomerGeo>;
}

export interface CustomerGeo {
  lat: string;
  lon: string;
}

export interface CustomerCredential {
  username?: Nullable<string>;
  password?: Nullable<string>;
}

export interface CustomerEducation {
  id: string;
  schoolType?: Nullable<string>;
  schoolName?: Nullable<string>;
  schoolConcentration?: Nullable<string>;
  startYear?: Nullable<number>;
  endYear?: Nullable<number>;
  isCurrent?: Nullable<boolean>;
}

export interface CustomerLike {
  id: string;
  category?: Nullable<string>;
  name?: Nullable<string>;
  createdTime?: Nullable<string>;
}

export interface CustomerSocial {
  facebook?: Nullable<string>;
  google?: Nullable<string>;
  instagram?: Nullable<string>;
  linkedin?: Nullable<string>;
  qzone?: Nullable<string>;
  twitter?: Nullable<string>;
}

export interface CustomerJob {
  id: string;
  companyIndustry?: Nullable<string>;
  companyName?: Nullable<string>;
  jobTitle?: Nullable<string>;
  startDate?: Nullable<string>;
  endDate?: Nullable<string>;
  isCurrent?: Nullable<boolean>;
}

export interface CustomerSubscription {
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

export interface UtmCookie {
  utm_source: string;
  utm_medium: Nullable<string>;
  utm_term: Nullable<string>;
  utm_content: Nullable<string>;
  utm_campaign: Nullable<string>;
}
