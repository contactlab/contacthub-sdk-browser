---
title: customer.ts
nav_order: 3
parent: Modules
---

## customer overview

Added in v2.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [capabilities](#capabilities)
  - [CustomerEnv (interface)](#customerenv-interface)
- [methods](#methods)
  - [customer](#customer)
- [model](#model)
  - [Customer (interface)](#customer-interface)
  - [CustomerData (interface)](#customerdata-interface)

---

# capabilities

## CustomerEnv (interface)

Defines capabilities and services required by the `customer` method in order to work.

**Signature**

```ts
export interface CustomerEnv extends HttpSvc, CookieSvc, UuisSvc {}
```

Added in v2.0.0

# methods

## customer

SDK's customer method: creates, updates, reconcile and stores provided customer's data.

**Signature**

```ts
export declare const customer: (E: CustomerEnv) => Customer;
```

Added in v2.0.0

# model

## Customer (interface)

Defines the `customer` method signature.

**Signature**

```ts
export interface Customer {
  (options?: CustomerData): Effect;
}
```

Added in v2.0.0

## CustomerData (interface)

Defines the `customer` method options.

**Signature**

```ts
export interface CustomerData {
  id?: Nullable<string>;
  externalId?: Nullable<string>;
  base?: Nullable<CustomerBase>;
  extended?: Nullable<Record<string, unknown>>;
  consents?: Nullable<CustomerConsents>;
  extra?: Nullable<string>;
  tags?: Nullable<CustomerTags>;
}
```

Added in v2.0.0
