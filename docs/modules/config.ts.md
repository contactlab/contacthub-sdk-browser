---
title: config.ts
nav_order: 1
parent: Modules
---

## config overview

Added in v2.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [capabilities](#capabilities)
  - [ConfigEnv (interface)](#configenv-interface)
- [methods](#methods)
  - [config](#config)
- [model](#model)
  - [Config (interface)](#config-interface)
  - [ConfigOptions (interface)](#configoptions-interface)

---

# capabilities

## ConfigEnv (interface)

Defines capabilities and services required by the `config` method in order to work.

**Signature**

```ts
export interface ConfigEnv extends HttpSvc, CookieSvc, LocationSvc, UuisSvc {}
```

Added in v2.0.0

# methods

## config

SDK's configuration method: sets provided configuration and persists them in a cookie (with defaults).

It also handles UTM values passed via query parameters and sets current customer if a `clabId` query param is provided.

**Signature**

```ts
export declare const config: (E: ConfigEnv) => Config;
```

Added in v2.0.0

# model

## Config (interface)

Defines the `config` method signature.

**Signature**

```ts
export interface Config {
  (options: ConfigOptions): Effect;
}
```

Added in v2.0.0

## ConfigOptions (interface)

Defines the `config` method options.

**Signature**

```ts
export interface ConfigOptions {
  token: string;
  workspaceId: string;
  nodeId: string;
  target?: 'ENTRY' | 'AGGREGATE';
  context?: string;
  contextInfo?: Record<string, unknown>;
  debug?: boolean;
  aggregateToken?: string;
  aggregateNodeId?: string;
}
```

Added in v2.0.0
