// @flow

export type Auth = {
  token: string,
  workspaceId: string,
  nodeId: string
};

export type GoogleAnalytics = {|
  utm_source: string,
  utm_medium: ?string,
  utm_term: ?string,
  utm_content: ?string,
  utm_campaign: ?string
|};

export type ContactHubCookie = Auth & {
  context: string,
  sid: string,
  customerId?: string,
  hash?: string,
  ga?: GoogleAnalytics
};

export type ConfigOptions = {
  token: string,
  workspaceId: string,
  nodeId: string,
  context?: string
};

export type EventOptions = {
  type: string,
  properties?: Object
};

export type CustomerId = {
  customerId: string
};

export type CustomerTags = {
  auto?: Array<string>,
  manual?: Array<string>
};

export type CustomerContacts = {
  email?: string,
  fax?: string,
  mobilePhone?: string,
  phone?: string,
  otherContacts?: string,
  mobileDevices?: string
};

export type CustomerGeo = {
  lat: string,
  lon: string
};

export type CustomerAddress = {
  street?: string,
  city?: string,
  country?: string,
  province?: string,
  zip?: string,
  geo?: CustomerGeo
};

export type CustomerCredential = {
  username?: string,
  password?: string
};

export type CustomerSocial = {
  facebook?: string,
  google?: string,
  instagram?: string,
  linkedin?: string,
  qzone?: string,
  twitter?: string
};

export type CustomerBase = {
  pictureUrl?: string,
  title?: string,
  prefix?: string,
  firstName?: string,
  lastName?: string,
  middleName?: string,
  gender?: string,
  dob?: string,
  locale?: string,
  timezone?: string,
  contacts?: CustomerContacts,
  address?: CustomerAddress,
  credential: CustomerCredential,
  educations?: string,
  likes?: Number,
  socialProfile: CustomerSocial,
  jobs?: string,
  subscriptions?: string
};

export type CustomerData = {
  base?: CustomerBase,
  extended?: Object,
  extra?: string,
  tags?: CustomerTags,
  externalId?: string
};


type Config = (method: 'config', options: ConfigOptions) => void;
type Customer = (method: 'customer', options: CustomerData) => void;
type Event = (method: 'event', options: EventOptions) => void;

export type ContactHubFunction = Config & Customer & Event;
