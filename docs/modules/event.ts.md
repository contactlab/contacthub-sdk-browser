---
title: event.ts
nav_order: 5
parent: Modules
---

## event overview

Added in v2.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [capabilities](#capabilities)
  - [EventEnv (interface)](#eventenv-interface)
- [methods](#methods)
  - [event](#event)
- [model](#model)
  - [Event (interface)](#event-interface)
  - [EventOptions (interface)](#eventoptions-interface)

---

# capabilities

## EventEnv (interface)

Defines capabilities and services required by the `event` method in order to work.

**Signature**

```ts
export interface EventEnv
  extends HttpSvc,
    CookieSvc,
    LocationSvc,
    DocumentSvc {}
```

Added in v2.0.0

# methods

## event

SDK's event method: sends provided event to Customer Hub's API.

**Signature**

```ts
export declare const event: (E: EventEnv) => Event;
```

Added in v2.0.0

# model

## Event (interface)

Defines the `event` method signature.

**Signature**

```ts
export interface Event {
  (options: EventOptions): Effect;
}
```

Added in v2.0.0

## EventOptions (interface)

Defines the `event` method options.

**Signature**

```ts
export interface EventOptions {
  type: string;
  properties?: EventProperties;
}
```

Added in v2.0.0
