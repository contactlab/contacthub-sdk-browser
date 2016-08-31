# Contacthub.js

Official JS tracking code for
[Contactlab](http://developer.contactlab.com/documentation/). The easiest way to
send pageviews, events and customer information from your website to the
[Contacthub API](http://developer.contactlab.com/documentation/).


## How to use

Insert this snippet in your website:

```html
<script>
window.ch=window.ch||function(){(ch.q=ch.q||[]).push(arguments)};ch.l=+new Date;
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
ch('event',
  '<eventType>', // type
  // optional Properties object (eventType dependent)
  // default is "all the props we can infer automatically":
  properties: {
    path, referrer, title, url
  }
);
```

## How to build locally

`npm run build` will generate `dist/contactlab.js` and `dist/contactlab.min.js`.


## How to run tests

`npm test` to run once

or

`npm test-watch` to automatically re-run tests on every change
