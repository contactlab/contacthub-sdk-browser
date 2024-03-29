![Node CI](https://github.com/contactlab/contacthub-sdk-browser/workflows/Node%20CI/badge.svg?branch=master) [![GitHub release](https://img.shields.io/github/release/contactlab/contacthub-sdk-browser.svg)](https://github.com/contactlab/contacthub-sdk-browser/releases)

# @contactlab/sdk-browser

Browser SDK for the Contactlab Customer Hub API.

The easiest way to send pageviews, events and customer information from your website to the [Customer Hub API](http://developer.contactlab.com/hub-swagger/).

## How to use

Insert this snippet in your website (preferably in the `<HEAD>` section):

```html
<script>
  window.ch = function() {(ch.q = ch.q || []).push(arguments);};
  ch('config', { /* see below */ });
  ch('customer', { /* see below */ });
  ch('event', { /* see below */ });
</script>
<script async src="https://cdn.jsdelivr.net/npm/@contactlab/sdk-browser@2/dist/sdk.min.js"></script>
```

Compressed and uncompressed copies of Customer Hub SDK files are available.
The uncompressed file is best used during development or debugging; the compressed file saves bandwidth and improves performance in production.

Use CDNs can offer a performance benefit by hosting Customer Hub SDK on servers spread across the globe.
This also offers an advantage that if the visitor to your webpage has already downloaded a copy of Customer Hub SDK from the same CDN, it won't have to be re-downloaded.

To load a hosted library, copy and paste the HTML snippet for that library (shown below) in your web page.

**Warning! The SDK is published in [UMD](https://github.com/umdjs/umd) format: if you use non-standard ways to load scripts in page (like [RequireJS](https://requirejs.org/)), please refer to the corresponding documentation.**

#### ES6 version minified

```html
<script async src="https://cdn.jsdelivr.net/npm/@contactlab/sdk-browser@2/dist/sdk.min.js"></script>
```

#### ES6 version uncompressed

```html
<script async src="https://cdn.jsdelivr.net/npm/@contactlab/sdk-browser@2/dist/sdk.js"></script>
```

#### ES5 version minified

```html
<script async src="https://cdn.jsdelivr.net/npm/@contactlab/sdk-browser@2/dist/sdk.legacy.min.js"></script>
```

#### ES5 version uncompressed

```html
<script async src="https://cdn.jsdelivr.net/npm/@contactlab/sdk-browser@2/dist/sdk.legacy.js"></script>
```

To load a specific version, replace `2` with the version number.

We recommend that you load libraries from the CDN via HTTPS, even if your own website only uses HTTP.

### The config API

**Returns a `Promise<void>`**

```js
ch('config', {
  workspaceId: 'w_id', // required, found in the Customer Hub admin area
  nodeId: 'node_id', // required, found in the Customer Hub admin area
  token: 'UYTF546FUTF636JH', // required, found in the Customer Hub admin area
  target: 'ENTRY', // optional, can be "ENTRY" or "AGGREGATE", defaults to "ENTRY"
  context: 'CTX', // optional, defaults to 'WEB'
  contextInfo: {}, // optional, defaults to an empty object
});
```

The JSON schemas for the `contextInfo` property can be found [here](http://developer.contactlab.com/hub-swagger/).

### The customer API

**Returns a `Promise<void>`**

Include this call only if you have details about the current user (e.g. the user is logged in). All properties are optional.

The JSON schemas for all Customer properties can be found [here](http://developer.contactlab.com/hub-json-schemas/).

```js
ch('customer', {
  externalId: '456',
  base: {
    firstName: 'John',
    lastName: 'Smith',
    contacts: {
      email: 'john.smith@example.com'
    }
  },
  consents: {},
  extended: {},
  extra: '',
  tags: {
    auto: [],
    manual: []
  }
});
```

If you have defined a "matching policy" in your workspace (using the Customer Hub web interface), and the data you're providing matches the data of an existing customer, the existing customer will be updated instead.

If you have defined required properties in your workspace (using the Customer Hub web interface), and they are not present in the javascript object, the call will fail.

#### Resending identical data

It's safe to call this function multiple times with the same data (e.g. in the `HEAD` section of all of your pages) as an encrypted hash of this data is stored in a cookie and won't be resent to the API if no value has changed.

#### Single Page Apps

You can also call this function the moment a user succesfully logs in, if the login action doesn't involve a page refresh.

#### Updating the current user

If a user adds some personal information to his/her profile, you don't need to send his full profile again, as the new data you send will be automatically merged with the data that is already available on the Customer Hub database.

```js
// Add the mobile phone to the existing customer data
ch('customer', {
  base: {
    contacts: {
      mobilePhone: '+393331234567'
    }
  }
});
```

#### Removing properties

Because properties are always merged, if you want to actually _remove_ a property that was previously set on a Customer, you have to explictly assign a `null` value to it, for example:

```js
ch('customer', {
  base: {
    contacts: {
      email: 'something@example.com',
      mobilePhone: null
    }
  }
});
```

If you omit the property, or set it to `undefined`, Customer Hub will assume you want to keep the current value for that property.

#### Logging out

If a user logs out, you might want to stop linking events to his/her session. You can call `ch('customer')` without the second parameter and a new Customer Hub session id will be generated.
All the events from this point will be associated to the new session id and will not be linked to the previous user.

### The event API

**Returns a `Promise<void>`**

```js
ch('event', {
  type: '<eventType>', // a valid event type, e.g. 'viewedPage'
  properties: {} // optional Properties object (eventType dependent)
});
```

Please note we will infer some standard properties automatically (`url`, `title`, `referrer`, `path`).
If you want, you can override those in your custom `properties` object.

Since v1.0.0 of this library, `utm_` tags from Google Analytics are also automatically detected from the query string, stored in the ContactHub cookie and attached automatically to all Customer Hub Events.

## Advanced usage

#### Renaming the global Customer Hub object

This script will register a global variable in your `window` object called `ch`.
This is similar for example to the `ga` global variable used by Google Analytics.
If for any reason you already have a global variable called `ch` in your website, you can ask Customer Hub to use a different name.
Simply add this line _before_ the standard Customer Hub snippet:

```js
window.ContactHubObject = 'chub';
```

You also have to replace all occurrences of `ch` in the snippet:

```html
<script>
  window.chub=function(){(chub.q=chub.q||[]).push(arguments)};
  chub('config', { ... });
  chub('customer', { ... });
  chub('event', { ... });
</script>
<script async src="https://cdn.jsdelivr.net/npm/@contactlab/sdk-browser@2/sdk.min.js"></script>
```

#### Renaming the Customer Hub cookie

In the same way, you can set a custom name for the Customer Hub cookie using:

```js
window.ContactHubCookie = '__chub';
```

#### Using a different API URL

For testing or debugging purposes, you might want to use a different API server:

```js
window.ContactHubAPI = 'https://test-api/hub/v2';
```

#### Customer Hub ID

Every Customer is assigned an id in Customer Hub. In general, you don't have to think about it as the library will take care of it and avoid generating multiple IDs for the same Customer.

If you store Customer Hub ids on your database and you want to make sure that events sent via the library are associated to the same id, you can specify the ID when you use the `ch('customer', {...})` method:

```js
ch('customer', {
  id: 'A_VALID_CONTACTHUB_ID'
  // ... other customer properties
});
```

#### The `clabId` query parameter

You can also send a Customer Hub id using the `clabId` parameter in the query string (`?clabId=A_VALID_CONTACTHUB_ID`). This is transformed by the library in the following call:

```js
ch('customer', {id: clabId});
```

An example use case is if you send a newsletter to your customers and you want to make sure that if they reach your website from a link contained in the email, they are immediately recognised even if they are not logged in.

Please note that if a different user is logged in, the Customer Hub id for the currently logged in user is stored in the Customer Hub cookie. The id contained in the Customer Hub cookie always takes precedence over an id specified using the `clabId` query string parameter.

If needed you can **set a custom name** for the `clabId` query parameter through global configuration:

```js
window.ContactHubClabId = 'custom_id'; // expected query string should be `?custom_id=A_VALID_CONTACTHUB_ID`
```

#### Aggregate nodes (alpha)

:warning: **Warning: this feature is in alpha phase - use it at your own risk** 

The SDK can handle also [aggregate nodes](https://explore.contactlab.com/understanding-nodes-and-trees/?lang=en).

In order to send data to this kind of nodes (instead of standard "entry" ones), you have to set these optional configuration properties:
- `target` to `AGGREGATE`;
- `aggregateNodeId` to the aggregate node's id (found in the Customer Hub admin area);
- `aggregateToken` to the aggregate node's token (found in the Customer Hub admin area).

Please be aware that customer's creation and updating **are bypassed** when `target` is `AGGREGATE`, but reconciliation and id conflict resolution keep executing.

Just as `clabId` also the `target` property can be set using the `target` parameter in the query string (`?target=AGGREGATE`).

## Contributing to this library

### How to build locally

`npm run build` will generate:
- `dist/sdk.js` (ES6 version);
- `dist/sdk.min.js` (ES6 version minified);
- `dist/sdk.legacy.js` (ES5 version);
- `dist/sdk.legacy.min.js` (ES5 version minified)

### How to run tests

`npm test` will run all unit tests (with [`Jest`](https://jestjs.io/)) and all integration tests once using Chrome in headless mode (with [`Karma`](karma-runner.github.io/)).

`BROWSERSTACK_USERNAME=<user> BROWSERSTACK_ACCESS_KEY=<key> npm run test:bs` will run integration tests on real browsers using BrowserStack. The list of browsers is statically defined in `package.json` and `karma.conf.ts`

### How to open the example page in your browser

`npm run example` will start a local HTTP server and open the example page in your local browser. Replace the placeholders in the query string with your authorization token and ids. Remember also to add `http://127.0.0.1:8080` to the allowed URLs for your Source in the Contactlab Customer Hub web interface (under `Settings > Sources > {source name} > Settings`).
