# Flipper — Shared-State Smart Contract

## What Is Flipper?

Flipper is a minimal Coco smart contract that demonstrates **shared mutable state**. It stores a `Map[Identifier]Bool` keyed by caller address. All callers read from and write to the **same** map; there is no isolation between callers.

**Use case:** Demonstrate shared mutable state, interaction signing, and Logic Driver instantiation.

---

## Source File

`flipper/flipper.coco`

```coco
coco Flipper

state logic:
    values Map[Identifier]Bool

endpoint deploy Init():
    mutate values <- Flipper.Logic.values:
        values[Sender] = true

endpoint dynamic Flip():
    mutate values <- Flipper.Logic.values:
        values[Sender] = !values[Sender]

endpoint static Mode() -> (value Bool):
    observe values <- Flipper.Logic.values:
        value = values[Sender]
```

---

## Endpoints

| Endpoint | Type | Effect |
|----------|------|--------|
| `Init()` | `deploy` | Initialises the deployer's entry to `true` |
| `Flip()` | `dynamic` | Toggles the caller's boolean (`!current`) |
| `Mode()` | `static` | Returns the caller's current boolean (read-only) |

---

## State Model

`state logic` means **one shared instance** of `values` exists for the entire contract. Every caller who calls `Flip()` modifies the same map.

- If Alice calls `Flip()`, her entry toggles.
- If Bob calls `Flip()`, his entry toggles independently.
- But both entries live in the same `Flipper.Logic.values` map.

> Compare with [ContextFlipper](context-flipper.md) which uses `state actor` for full isolation.

---

## Pre-compiled Manifest

The compiled JSON manifest is checked into the repo at:

```
flipper/flipper.json
```

You do **not** need the Coco toolchain to deploy Flipper — the manifest is ready to use.

If you edit `flipper.coco`, recompile with:

```bash
cd flipper
coco compile
coco manifest convert flipper.yaml -f json -o flipper.json
```

---

## Running the Demo

```bash
# 1 — Deploy Flipper (prints Logic ID)
node sdk/deploy.js

# 2 — Toggle state
node sdk/flip.js              # reads LOGIC_ID from .env
node sdk/flip.js 0x<id>       # pass as argument

# 3 — Read state
node sdk/mode.js              # reads LOGIC_ID from .env
node sdk/mode.js 0x<id>
```

See [Deployment](deployment.md) for the full workflow including `.env` setup.

---

## Key Files

| File | Purpose |
|------|---------|
| `flipper/flipper.coco` | Coco source |
| `flipper/flipper.json` | Pre-compiled manifest (used at runtime) |
| `flipper/flipper.yaml` | Coco manifest definition |
| `sdk/deploy.js` | Deploy script (LogicFactory) |
| `sdk/flip.js` | Invoke `Flip()` endpoint |
| `sdk/mode.js` | Call `Mode()` endpoint (read-only) |

---

## See Also

- [ContextFlipper](context-flipper.md) — per-actor isolation
- [Deployment](deployment.md) — full deploy workflow
- [SDK patterns](sdk.md) — `send()` vs `call()`
- [Coco Language](../concepts/coco-language.md)
