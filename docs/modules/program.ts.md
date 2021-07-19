---
title: program.ts
nav_order: 9
parent: Modules
---

## program overview

Service to handle a "program" execution.

Added in v2.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [capabilities](#capabilities)
  - [ProgramSvc (interface)](#programsvc-interface)
- [instances](#instances)
  - [program](#program)
- [model](#model)
  - [Effect (interface)](#effect-interface)
  - [Program (interface)](#program-interface)

---

# capabilities

## ProgramSvc (interface)

**Signature**

```ts
export interface ProgramSvc {
  program: Program;
}
```

Added in v2.0.0

# instances

## program

Live instance of `Program` service.

**Signature**

```ts
export declare const program: () => Program;
```

Added in v2.0.0

# model

## Effect (interface)

Defines an "effect" as an asyncronous operation that can fail (with an `Error`) or succeed with some value (`void` by default).

**Signature**

```ts
export interface Effect<A = void> extends TaskEither<Error, A> {}
```

Added in v2.0.0

## Program (interface)

Defines the `Program` service capabilities.

**Signature**

```ts
export interface Program {
  run: (p: Effect) => Promise<void>;
}
```

Added in v2.0.0
