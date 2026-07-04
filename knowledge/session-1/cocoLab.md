# CocoLab — Interactive Coco REPL

## What Is CocoLab?

CocoLab is an **interactive REPL** for testing Coco logic **without** deploying to the blockchain. It runs the logic in-memory, lets you deploy it locally, and invoke endpoints with test parameters.

**Purpose:** Rapid iteration, learning Coco syntax, debugging logic before on-chain deployment.

---

## When to Use CocoLab

| Scenario | Use CocoLab? |
|----------|-------------|
| Learning Coco syntax | ✅ Yes |
| Debugging endpoint logic | ✅ Yes |
| Testing before deploying | ✅ Yes |
| Production deployment | ❌ No — use `sdk/deploy.js` |
| Testing with real wallet/state | ❌ No — CocoLab is local-only |

---

## Starting CocoLab

Run from inside a Coco project folder (must contain `.coco` and `.yaml` files):

```bash
cd flipper
coco lab init
```

This opens an interactive session where you can:

- Deploy the logic in-memory
- Call endpoints with test inputs
- Inspect state after mutations

---

## Prerequisites

- The Coco toolchain must be installed (`coco version` to verify)
- You must be in a directory with a valid Coco project (`flipper.coco` / `flipper.yaml`)

---

## Typical Session

```
$ coco lab init

CocoLab — Interactive Coco REPL
Deploying Flipper...
> deploy Init
  Deployed. Logic ID (local): lab_0

> invoke Flip
  Interaction OK. Sender value toggled.

> invoke Mode
  Returns: value = true

> invoke Flip
  Interaction OK.

> invoke Mode
  Returns: value = false
```

*(Actual REPL prompts may differ by CocoLab version.)*

---

## Difference from On-Chain Testing

| | CocoLab | On-Chain (deploy.js) |
|--|---------|---------------------|
| State persistence | Local session only | Permanent on devnet |
| Speed | Instant | Waits for finality |
| Cost | Free | Gas required |
| Wallet needed | No | Yes (funded) |
| Realistic test | Partial | Full |

---

## Common Usage

Use CocoLab to:

1. Verify your `Flip → Mode` logic before deploying
2. Test edge cases (e.g., what happens after multiple flips)
3. Experiment with Coco syntax errors in a safe environment

---

## See Also

- [Coco Language](../concepts/coco-language.md) — full syntax reference
- [Flipper](flipper.md) — the contract tested in CocoLab
- [Deployment](deployment.md) — move to on-chain after CocoLab testing
