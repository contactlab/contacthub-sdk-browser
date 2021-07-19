---
title: main.ts
nav_order: 8
parent: Modules
---

## main overview

Added in v2.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [capabilities](#capabilities)
  - [MainEnv (interface)](#mainenv-interface)
- [methods](#methods)
  - [main](#main)
- [model](#model)
  - [SDK (interface)](#sdk-interface)

---

# capabilities

## MainEnv (interface)

Defines capabilities and services required by the SDK's `main` function.

**Signature**

```ts
export interface MainEnv extends ProgramSvc, ConfigEnv, CustomerEnv, EventEnv {}
```

Added in v2.0.0

# methods

## main

Main function that starts and makes available the SDK features.

**Signature**

```ts
export declare const main: (E: MainEnv) => void;
```

Added in v2.0.0

# model

## SDK (interface)

SDK signature.

**Signature**

```ts
export interface SDK {
  (method: 'config', options: ConfigOptions): Promise<void>;
  (method: 'event', options: EventOptions): Promise<void>;
  (method: 'customer', options?: CustomerData): Promise<void>;
  q?: unknown[];
}
```

Added in v2.0.0
