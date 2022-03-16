---
title: globals.ts
nav_order: 6
parent: Modules
---

## globals overview

Service to handle global configurations.

Added in v2.2.0

---

<h2 class="text-delta">Table of contents</h2>

- [capabilities](#capabilities)
  - [GlobalsSvc (interface)](#globalssvc-interface)
- [instances](#instances)
  - [globals](#globals)
- [model](#model)
  - [Globals (type alias)](#globals-type-alias)

---

# capabilities

## GlobalsSvc (interface)

**Signature**

```ts
export interface GlobalsSvc {
  globals: Globals;
}
```

Added in v2.2.0

# instances

## globals

Live instance of `Globals` service.

**Signature**

```ts
export declare const globals: Globals;
```

Added in v2.2.0

# model

## Globals (type alias)

Defines the `Globals` service capabilities.

**Signature**

```ts
export type Globals = IO<{
  chName: string;
  apiURL: string;
  cookieName: string;
  utmCookieName: string;
  clabIdName: string;
}>;
```

Added in v2.2.0
