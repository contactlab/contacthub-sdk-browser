---
title: http.ts
nav_order: 7
parent: Modules
---

## http overview

Service to handle http requests.

Added in v2.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [capabilities](#capabilities)
  - [HttpSvc (interface)](#httpsvc-interface)
- [instances](#instances)
  - [http](#http)
- [model](#model)
  - [Http (interface)](#http-interface)

---

# capabilities

## HttpSvc (interface)

**Signature**

```ts
export interface HttpSvc {
  http: Http;
}
```

Added in v2.0.0

# instances

## http

Live instance of `Http` service.

**Signature**

```ts
export declare const http: (Env: HttpEnv) => Http;
```

Added in v2.0.0

# model

## Http (interface)

Defines the `Http` service capabilities.

**Signature**

```ts
export interface Http {
  post: <A>(path: string, body: A, token: string) => TaskEither<Error, unknown>;

  patch: <A>(
    path: string,
    body: A,
    token: string
  ) => TaskEither<Error, unknown>;
}
```

Added in v2.0.0
