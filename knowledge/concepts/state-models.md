# State Models in Coco

Coco offers two distinct paradigms for managing state on-chain: **State Logic** (Shared State) and **State Actor** (Isolated State). Understanding the difference is critical for designing MOI smart contracts.

---

## State Logic (Shared State)

In the `state logic` model, the contract maintains a single, shared data structure. All callers read from and write to this same structure.

**Key Characteristics:**
- **Keyword:** `state logic`
- **Initialization:** Uses `endpoint deploy Init()` (called once when the contract is deployed).
- **State Path:** Accessed via `<ContractName>.Logic.<field>`.
- **Concurrency:** Interactions that mutate shared state are serialized.

**Example (Flipper):**
```coco
state logic:
    values Map[Identifier]Bool

endpoint dynamic Flip():
    mutate values <- Flipper.Logic.values:
        values[Sender] = !values[Sender]
```
Here, a single map holds the boolean for every user. If Alice and Bob both call `Flip()`, they modify the same map.

---

## State Actor (Isolated State)

In the `state actor` model, the contract defines a template of state. Each caller (actor) gets their own, completely isolated instance of that state on-chain.

**Key Characteristics:**
- **Keyword:** `state actor`
- **Initialization:** Uses `endpoint enlist Init()` (called by each actor to enroll themselves in the contract).
- **State Path:** Accessed via `<ContractName>.Sender.<field>`.
- **Concurrency:** Because actor states are isolated, multiple actors can execute the logic in parallel without conflicting.

**Example (ContextFlipper):**
```coco
state actor:
    value Bool

endpoint dynamic Flip():
    mutate value <- ContextFlipper.Sender.value:
        value = !value
```
Here, there is no map. The state is just a single `Bool`. The `Sender` keyword ensures that Alice's call to `Flip()` only accesses Alice's isolated boolean, and Bob's call accesses Bob's isolated boolean.

---

## Comparison Summary

| Feature | State Logic | State Actor |
|---------|-------------|-------------|
| **Data Scope** | Global to the contract instance | Local to the specific caller |
| **Initialization** | `endpoint deploy` (Once) | `endpoint enlist` (Per-actor) |
| **Path Convention** | `Contract.Logic.var` | `Contract.Sender.var` |
| **Execution** | Serialized | Parallelizable |
| **Use Case** | Shared registries, liquidity pools, token balances | User preferences, isolated user state, independent agents |

---

## See Also
- [Coco Language](coco-language.md)
- [Flipper](../session-1/flipper.md) (Demonstrates State Logic)
- [ContextFlipper](../session-1/context-flipper.md) (Demonstrates State Actor)
