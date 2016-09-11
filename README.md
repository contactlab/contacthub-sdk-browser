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


## How to build locally

`npm run build` will generate `dist/contactlab.js` and `dist/contactlab.min.js`.


## How to run tests

`npm test` to run once

or

`npm test-watch` to automatically re-run tests on every change
