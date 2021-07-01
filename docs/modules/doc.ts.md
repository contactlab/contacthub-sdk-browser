---
title: doc.ts
nav_order: 4
parent: Modules
---

## doc overview

Service to handle page's `Document` data.

Added in v2.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [capabilities](#capabilities)
  - [DocumentSvc (interface)](#documentsvc-interface)
- [instances](#instances)
  - [document](#document)
- [model](#model)
  - [Document (interface)](#document-interface)

---

# capabilities

## DocumentSvc (interface)

**Signature**

```ts
export interface DocumentSvc {
  document: Document;
}
```

Added in v2.0.0

# instances

## document

Live instance of `Document` service.

**Signature**

```ts
export declare const document: () => Document;
```

Added in v2.0.0

# model

## Document (interface)

Defines the `Document` service capabilities.

**Signature**

```ts
export interface Document {
  title: IO<string>;
  referrer: IO<string>;
}
```

Added in v2.0.0
