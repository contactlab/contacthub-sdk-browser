[![Build Status](https://travis-ci.org/contactlab/contacthub-sdk-browser.svg?branch=master)](https://travis-ci.org/contactlab/contacthub-sdk-browser)
![Version 0.4.1 beta](https://img.shields.io/badge/version-0.4.1%20beta-0072bc.svg)

# Contacthub.js

Official JS tracking code for
[Contactlab](http://developer.contactlab.com/documentation/). The easiest way to
send pageviews, events and customer information from your website to the
[Contacthub API](http://developer.contactlab.com/documentation/).


## How to use

Insert this snippet in your website (preferably in the `<HEAD>` section):

```html
<script>
window.ch=function(){(ch.q=ch.q||[]).push(arguments)};
ch('config', {/* see below */});
ch('customer', {/* see below */});
ch('event', {/* see below */});
</script>
<script async src='https://assets.contactlab.it/contacthub/sdk-browser/latest/contacthub.min.js'></script>
```

Compressed and uncompressed copies of Contacthub Analytics JS files are available. The uncompressed file is best used during development or debugging; the compressed file saves bandwidth and improves performance in production.
Use CDNs can offer a performance benefit by hosting Contacthub Analytics JS on servers spread across the globe. This also offers an advantage that if the visitor to your webpage has already downloaded a copy of Contacthub Analytics JS from the same CDN, it won't have to be re-downloaded. 

To load a hosted library, copy and paste the HTML snippet for that library (shown below) in your web page.

#### Latest version minified 
```html
<script async src="https://assets.contactlab.it/contacthub/sdk-browser/latest/contacthub.min.js"></script> 
```

#### Latest version uncompressed 
```html
<script async src="https://assets.contactlab.it/contacthub/sdk-browser/latest/contacthub.js"></script> 
```

#### Specific version minified 
```html
<script async src="https://assets.contactlab.it/contacthub/sdk-browser/{version}/contacthub.min.js"></script> 
```

#### Specific version uncompressed 
```html
<script async src="https://assets.contactlab.it/contacthub/sdk-browser/{version}/contacthub.js"></script> 
```

We recommend that you load libraries from the CDN via HTTPS, even if your own website only uses HTTP


### The config API

```js
ch('config', {
  workspaceId: 'w_id', // required, found in the ContactHub admin area
  nodeId: 'node_id', // required, found in the ContactHub admin area
  token: 'UYTF546FUTF636JH', // required, found in the ContactHub admin area
  context: 'CTX' // optional, defaults to 'WEB'
});
```

### The customer API

Include this call only if you have details about the current user (e.g. the user
is logged in).

```js
ch('customer', {
  externalId: '456', // optional
  base: {
    firstName: 'Mario',
    lastName: 'Rossi',
    contacts: {
      email: 'mario.rossi@example.com'
    }
  },
  extended: {}, // optional
  extra: '', // optional
  tags: { //optional
    auto: [],
    manual: []
  }
});
```

If you have defined a matching policy in the ContactHub web interface, and the
data you're providing matches the data of an existing customer, the existing
customer will be updated instead.

#### Resending identical data

It's safe to call this function multiple times with the same data (e.g. in the
HEAD section of all of your pages) as an encrypted hash of this data is stored
in a cookie and won't be resent to the API if no value has changed.

#### Single Page Apps

You can also call this function the moment a user succesfully logs in, if the
login action doesn't involve a page refresh.

#### Updating the current user

If a user adds some personal information to his/her profile, you don't need to
send his full profile again, as the new data you send will be automatically
merged with the data that is already available on the ContactHub database.

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

#### Logging out

If a user logs out, you might want to stop linking events to his/her session.
You can call `ch('customer')` without the second parameter and a new ContactHub
session id will be generated. All the events from this point will be associated
to the new session id and will not be linked to the previous user.

### The event API

```js
ch('event', {
  type: '<eventType>', // a valid event type, e.g. 'viewedPage'
  properties: {} // optional Properties object (eventType dependent)
});
```

Please note we will infer some standard properties automically (url, title,
referrer, path). If you want, you can override those in your custom `properties`
object.


## Advanced usage

#### Renaming the global ContactHub object

This script will register a global variable in your `window` object called `ch`.
This is similar for example to the `ga` global variable used by Google
Analytics. If for any reason you already have a global variable called `ch` in
your website, you can ask ContactHub to use a different name. Simply add this
line _before_ the standard ContactHub snippet:

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
<script async src='https://www.contactlab.com/contacthub.js'></script>
```


#### Renaming the ContactHub cookie

In the same way, you can set a custom name for the ContactHub cookie using:

```js
window.ContactHubCookie = '__chub';
```

#### Using a different API URL

For testing or debugging purposes, you might want to use a different API server:

```js
window.ContactHubAPI = 'https://test-api/hub/v2';
```

## Contributing to this library

### How to build locally

`npm run build` will generate `dist/contactlab.js` and `dist/contactlab.min.js`.


### How to run tests

`npm test` will run all tests once using PhantomJS

`npm test-watch` will automatically re-run tests using PhantomJS on every change

`BROWSERSTACK_USER=<user> BROWSERSTACK_KEY=<key> npm test-bs` will run tests
on real browsers using BrowserStack. The list of browsers is statically defined
in `package.json` and `karma.conf.js`

### How to open the example page in your browser

`npm run example` will start a local HTTP server and open the example page in
your local browser. Replace the placeholders in the query string with your
authorization token and ids. Remember also to add `http://127.0.0.1.xip.io` to
the allowed URLs for your Source in the ContactHub web interface (under
Settings, Sources, {source name}, Settings).

