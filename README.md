[![Build Status](https://drone.our.buildo.io/api/badges/buildo/contacthub/status.svg)](https://drone.our.buildo.io/buildo/contacthub)

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
<script async src='https://www.contactlab.com/contacthub.js'></script>
```

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

You can also call this function asynchronously when a user logs in or add new
personal information.

```js
ch('customer', {
  externalId: '456', // optional
  customer: {
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
  }
});
```

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


## Advanced: renaming the global ContactHub object

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


### Advanced: renaming the ContactHub cookie

In the same way, you can set a custom name for the ContactHub cookie using:

```js
window.ContactHubCookie = '__chub';
```

### Advanced: using a different API URL

For testing or debugging purposes, you might want to use a different API server:

```js
window.ContactHubAPI = 'https://test-api/hub/v2';
```


## How to build locally

`npm run build` will generate `dist/contactlab.js` and `dist/contactlab.min.js`.


## How to run tests

`npm test` will run all tests once using PhantomJS

`npm test-watch` will automatically re-run tests using PhantomJS on every change

`BROWSERSTACK_USER=<user> BROWSERSTACK_KEY=<key> npm test-bs` will run tests
on real browsers using BrowserStack. The list of browsers is statically defined
in `package.json` and `karma.conf.js`
