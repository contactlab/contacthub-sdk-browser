---
title: location.ts
nav_order: 7
parent: Modules
---

## location overview

Service to handle page's `Location`.

Added in v2.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [capabilities](#capabilities)
  - [LocationSvc (interface)](#locationsvc-interface)
- [instances](#instances)
  - [location](#location)
- [model](#model)
  - [Location (interface)](#location-interface)

---

# capabilities

## LocationSvc (interface)

**Signature**

```ts
export interface LocationSvc {
  location: Location;
}
```

Added in v2.0.0

# instances

## location

Live instance of `Location` service.

**Signature**

```ts
export declare const location: () => Location;
```

Added in v2.0.0

# model

## Location (interface)

Defines the `Location` service capabilities.

**Signature**

```ts
export interface Location {
  /**
   * Gets Location data of provided Window.
   */
  data: IO<Window['location']>;

  /**
   * Reads query parameter value from url.
   */
  qp: (name: string) => string | undefined;
}
```

Added in v2.0.0
