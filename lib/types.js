// @flow

export type Auth = {|
  token: string,
  workspaceId: string,
  nodeId: string
|};

export type GoogleAnalytics = {|
  utm_source: string,
  utm_medium: ?string,
  utm_term: ?string,
  utm_content: ?string,
  utm_campaign: ?string
|};

export type ContactHubCookie = Auth & {|
  context: string,
  contextInfo: Object,
  sid: string,
  customerId?: string,
  hash?: string,
  ga?: GoogleAnalytics
|};

export type ConfigOptions = {|
  token: string,
  workspaceId: string,
  nodeId: string,
  context?: string,
  contextInfo?: Object
|};

export type EventOptions = {|
  type: string,
  properties?: Object
|};

export type CustomerId = {|
  customerId: string
|};

export type CustomerTags = {|
  auto?: Array<string>,
  manual?: Array<string>
|};

export type CustomerContacts = {|
  email?: ?string,
  fax?: ?string,
  mobilePhone?: ?string,
  phone?: ?string,
  otherContacts?: ?string,
  mobileDevices?: ?string
|};

export type CustomerGeo = {|
  lat: string,
  lon: string
|};

export type CustomerAddress = {|
  street?: ?string,
  city?: ?string,
  country?: ?string,
  province?: ?string,
  zip?: ?string,
  geo?: ?CustomerGeo
|};

export type CustomerCredential = {|
  username?: ?string,
  password?: ?string
|};

export type CustomerSocial = {|
  facebook?: ?string,
  google?: ?string,
  instagram?: ?string,
  linkedin?: ?string,
  qzone?: ?string,
  twitter?: ?string
|};

export type CustomerEducation = {|
  id: string,
  schoolType?: ?string,
  schoolName?: ?string,
  schoolConcentration?: ?string,
  startYear?: ?number,
  endYear?: ?number,
  isCurrent?: ?boolean
|};

export type CustomerLike = {|
  id: string,
  category?: ?string,
  name?: ?string,
  createdTime?: ?string
|};

export type CustomerJob = {|
  id: string,
  companyIndustry?: ?string,
  companyName?: ?string,
  jobTitle?: ?string,
  startDate?: ?string,
  endDate?: ?string,
  isCurrent?: ?boolean
|};

export type CustomerSubscription = {|
  id: string,
  name?: ?string,
  type?: ?string,
  kind?: ?string,
  kind?: ?string,
  subscribed?: ?boolean,
  startDate?: ?string,
  endDate?: ?string,
  subscriberId?: ?string,
  registeredAt?: ?string,
  updatedAt?: ?string,
  preferences: Array<{|
    key?: ?string,
    value?: ?string
  |}>
|};

export type CustomerBase = {|
  pictureUrl?: ?string,
  title?: ?string,
  prefix?: ?string,
  firstName?: ?string,
  lastName?: ?string,
  middleName?: ?string,
  gender?: ?string,
  dob?: ?string,
  locale?: ?string,
  timezone?: ?string,
  contacts?: ?CustomerContacts,
  address?: ?CustomerAddress,
  credential?: ?CustomerCredential,
  educations?: ?Array<CustomerEducation>,
  likes?: ?Array<CustomerLike>,
  socialProfile?: ?CustomerSocial,
  jobs?: ?Array<CustomerJob>,
  subscriptions?: ?Array<CustomerSubscription>
|};

export type ConsentStatus = {|
  status?: ?boolean,
  limitation?: ?boolean,
  objection?: ?boolean
|};

export type CustomerConsents = {|
  disclaimer?: ?{
    date?: ?string,
    version?: ?string
  },
  marketing?: ?{
    traditional?: ?{
      telephonic?: ?ConsentStatus,
      papery?: ?ConsentStatus
    },
    automatic?: ?{
      sms?: ?ConsentStatus,
      email?: ?ConsentStatus,
      push?: ?ConsentStatus,
      im?: ?ConsentStatus,
      telephonic?: ?ConsentStatus
    }
  },
  profiling?: ?{
    classic?: ?ConsentStatus,
    online?: ?ConsentStatus
  },
  softSpam?: ?{
    email?: ?ConsentStatus,
    papery?: ?ConsentStatus
  },
  thirdPartyTransfer?: ?{
    profiling?: ?ConsentStatus,
    marketing?: ?ConsentStatus
  }
|};

export type CustomerData = {|
  id?: ?string,
  base?: ?CustomerBase,
  extended?: ?Object,
  consents?: ?CustomerConsents,
  extra?: ?string,
  tags?: ?CustomerTags,
  externalId?: ?string
|};

type Config = (method: 'config', options: ConfigOptions) => void;
type Customer = (method: 'customer', options: CustomerData) => void;
type Event = (method: 'event', options: EventOptions) => void;

export type ContactHubFunction = Config & Customer & Event;
