# ContextFlipper — Per-Actor Isolated State

## What Is ContextFlipper?

ContextFlipper is the actor-context variant of [Flipper](flipper.md). It replaces `state logic` (shared) with `state actor` (per-caller isolated). Each caller has their own independent `Bool` on-chain — one caller's `Flip()` never affects another caller's value.

---

## Source File

`context-flipper/context_flipper.coco`

```coco
coco ContextFlipper

state actor:
    value Bool

endpoint enlist Init():
    mutate true -> ContextFlipper.Sender.value

endpoint dynamic Flip():
    mutate value <- ContextFlipper.Sender.value:
        value = !value

endpoint static Mode() -> (value Bool):
    observe value <- ContextFlipper.Sender.value:
        value = value
```

---

## Endpoints

| Endpoint | Type | Effect |
|----------|------|--------|
| `Init()` | `enlist` | Enrols the caller; sets their `value` to `true` |
| `Flip()` | `dynamic` | Toggles **only the caller's** boolean |
| `Mode()` | `static` | Returns **only the caller's** current boolean |

---

## Key Difference from Flipper

| | Flipper | ContextFlipper |
|-|---------|---------------|
| State keyword | `state logic` | `state actor` |
| Init keyword | `endpoint deploy` | `endpoint enlist` |
| State path | `Flipper.Logic.values` | `ContextFlipper.Sender.value` |
| State scope | Shared (all callers see same map) | Isolated (each caller has own value) |
| Parallelism | Serialised on the shared map | Parallel (actors don't conflict) |

---

## Actor State Path Convention

In Coco, per-actor state is accessed via `<ContractName>.Sender.<field>`:

```coco
mutate value <- ContextFlipper.Sender.value:
    value = !value
```

`Sender` resolves to the calling account's actor state slot. No other caller can read or write it.

---

## Pre-compiled Manifest

Pre-compiled manifest checked into the repo:

```
context-flipper/context_flipper.json
```

Recompile if you edit the source:

```bash
cd context-flipper
coco compile
coco manifest convert context_flipper.yaml -f json -o context_flipper.json
```

---

## Enlist vs Deploy

- `endpoint deploy Init()` — called **once** at contract creation (Flipper)
- `endpoint enlist Init()` — called **per actor** to enrol (ContextFlipper)

When deploying ContextFlipper with `LogicFactory`, the `deploy('Init')` call deploys the logic. Each new actor then calls `enlist('Init')` to initialise their own state slot before calling `Flip()`.

---

## Use Case

ContextFlipper demonstrates:

- **Per-actor isolation** — multiple callers can use the same deployed logic without interfering with each other
- **Parallel execution** — actor state slots are independent, enabling concurrent processing
- **Actor context pattern** — the `ContextFlipper.Sender.value` path shows how per-caller on-chain storage works

---

## See Also

- [Flipper](flipper.md) — shared-state variant
- [State Models](../concepts/state-models.md) — `state logic` vs `state actor` deep-dive
- [Deployment](deployment.md)
