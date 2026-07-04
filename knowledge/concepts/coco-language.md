# Coco Language Basics

Cocolang is the native smart contract language for the MOI blockchain. It compiles to JSON manifests that are deployed on-chain.

---

## Basic Structure

A Coco contract is defined using the `coco` keyword, followed by the contract name. It typically contains state declarations and endpoints.

```coco
coco Flipper

state logic:
    values Map[Identifier]Bool

endpoint deploy Init():
    // initialization logic

endpoint dynamic Flip():
    // mutating logic

endpoint static Mode() -> (value Bool):
    // read-only logic
```

---

## State Declarations

Coco supports two main state models:

| Keyword | Scope | Usage |
|---------|-------|-------|
| `state logic` | Shared state | All callers interact with the same data structure on-chain. |
| `state actor` | Isolated state | Each caller (actor) gets their own independent state slot. |

For a deep dive, see [State Models](state-models.md).

---

## Endpoints

Endpoints are functions exposed by the contract.

| Type | Purpose | Modifies State? | Gas Cost |
|------|---------|-----------------|----------|
| `deploy` | Called once upon contract creation (initializes `state logic`). | Yes | Yes |
| `enlist` | Called once per actor to enroll them (initializes `state actor`). | Yes | Yes |
| `dynamic` | General-purpose endpoint that mutates state. | Yes | Yes |
| `static` | Read-only endpoint for querying state. | No | No (Free) |

---

## Mutate vs Observe

Inside an endpoint, you interact with state using `mutate` or `observe` blocks.

### `mutate`
Used to modify state variables.

```coco
mutate values <- Flipper.Logic.values:
    values[Sender] = !values[Sender]
```
- `values` on the left is the local variable name.
- `Flipper.Logic.values` is the path to the state being accessed.
- Inside the block, you can read and write to `values`.

### `observe`
Used to read state variables without modifying them.

```coco
observe values <- Flipper.Logic.values:
    value = values[Sender]
```

---

## Sender

The `Sender` keyword refers to the `Identifier` (address) of the account invoking the endpoint. It is used to key maps in shared state, or to access actor-specific state in actor contexts (e.g., `ContextFlipper.Sender.value`).

---

## Compiling Coco

Coco source (`.coco`) must be compiled to a JSON manifest before deployment. The webinar repositories include pre-compiled manifests, so you only need to recompile if you edit the source.

```bash
coco compile
coco manifest convert contract.yaml -f json -o contract.json
```

---

## See Also
- [State Models](state-models.md)
- [Flipper](../session-1/flipper.md)
- [ContextFlipper](../session-1/context-flipper.md)
