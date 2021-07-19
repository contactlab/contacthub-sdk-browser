---
title: cookie.ts
nav_order: 2
parent: Modules
---

## cookie overview

Service to handle cookies.

Added in v2.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [capabilities](#capabilities)
  - [CookieSvc (interface)](#cookiesvc-interface)
- [instances](#instances)
  - [cookie](#cookie)
- [model](#model)
  - [Cookie (interface)](#cookie-interface)
  - [HubCookie (interface)](#hubcookie-interface)
  - [UTMCookie (interface)](#utmcookie-interface)
- [utils](#utils)
  - [CookieGet (interface)](#cookieget-interface)
  - [CookieSet (interface)](#cookieset-interface)

---

# capabilities

## CookieSvc (interface)

**Signature**

```ts
export interface CookieSvc {
  cookie: Cookie;
}
```

Added in v2.0.0

# instances

## cookie

Live instance of `Cookie` service.

**Signature**

```ts
export declare const cookie: () => Cookie;
```

Added in v2.0.0

# model

## Cookie (interface)

Defines the `Cookie` service capabilities.

**Signature**

```ts
export interface Cookie {
  /**
   * Gets the Hub cookie.
   */
  getHub: CookieGet<HubCookie>;
  /**
   * Sets the Hub cookie.
   */
  setHub: CookieSet<HubCookie>;
  /**
   * Gets the UTM cookie.
   */
  getUTM: CookieGet<UTMCookie>;
  /**
   * Sets the UTM cookie.
   */
  setUTM: CookieSet<UTMCookie>;
}
```

Added in v2.0.0

## HubCookie (interface)

Defines the shape of SDK's cookie value.

**Signature**

```ts
export interface HubCookie {
  token: string;
  workspaceId: string;
  nodeId: string;
  debug: boolean;
  context: string;
  contextInfo: Record<string, unknown>;
  sid: string;
  customerId?: string;
  hash?: string;
}
```

Added in v2.0.0

## UTMCookie (interface)

Defines the shape of the UTM cookie value.

**Signature**

```ts
export interface UTMCookie {
  utm_source?: string;
  utm_medium?: string;
  utm_term?: string;
  utm_content?: string;
  utm_campaign?: string;
}
```

Added in v2.0.0

# utils

## CookieGet (interface)

**Signature**

```ts
export interface CookieGet<A> {
  (fallback?: A): Effect<A>;
}
```

Added in v2.0.0

## CookieSet (interface)

**Signature**

```ts
export interface CookieSet<A> {
  (value: A, options?: Cookies.CookieAttributes): Effect;
}
```

Added in v2.0.0
