---
title: uuid.ts
nav_order: 10
parent: Modules
---

## uuid overview

Service to handle a UUID generation.

Added in v2.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [capabilities](#capabilities)
  - [UuisSvc (interface)](#uuissvc-interface)
- [instances](#instances)
  - [uuid](#uuid)
- [model](#model)
  - [Uuid (interface)](#uuid-interface)

---

# capabilities

## UuisSvc (interface)

**Signature**

```ts
export interface UuisSvc {
  uuid: Uuid;
}
```

Added in v2.0.0

# instances

## uuid

Live instance of `Uuid` service.

**Signature**

```ts
export declare const uuid: () => Uuid;
```

Added in v2.0.0

# model

## Uuid (interface)

Defines the `Uuid` service capabilities.

**Signature**

```ts
export interface Uuid {
  v4: IO<string>;
}
```

Added in v2.0.0
