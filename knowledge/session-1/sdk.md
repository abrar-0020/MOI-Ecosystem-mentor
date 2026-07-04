# Session 1 SDK Patterns

## Overview

Session 1 covers the fundamental SDK patterns used across **all** webinar sessions:

- Connecting a wallet to a provider
- Deploying logic with `LogicFactory`
- Invoking logic with `getLogicDriver`
- The difference between `.send()` and `.call()`

---

## Package

```json
{
  "dependencies": {
    "dotenv": "^16",
    "js-moi-sdk": "0.7.0-rc15",
    "yaml": "^2"
  }
}
```

Install:

```bash
npm install
```

---

## Pattern 1 — Wallet + Provider Setup

Every script starts with this block:

```js
import 'dotenv/config'
import { VoyageProvider, Wallet } from 'js-moi-sdk'

const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(
  process.env.MOI_MNEMONIC,
  "m/44'/6174'/7020'/0/0"
)
wallet.connect(provider)
```

**Critical:** `wallet.connect(provider)` must be called before any `.send()` or `.call()`.

---

## Pattern 2 — Deploy Logic (LogicFactory)

```js
import { LogicFactory } from 'js-moi-sdk'
import manifest from '../flipper/flipper.json' with { type: 'json' }

const factory = new LogicFactory(manifest, wallet)
const ix = await factory.deploy('Init').send()
const { logic_id, error } = await ix.result()

if (error) throw new Error(error)
console.log('Logic ID:', logic_id)
```

- `'Init'` is the name of the `endpoint deploy` in the Coco source
- `ix.hash` is the interaction hash (use for Voyage lookup)
- `ix.result()` waits for on-chain confirmation

---

## Pattern 3 — Invoke Dynamic Endpoint (`.send()`)

```js
import { getLogicDriver } from 'js-moi-sdk'

const logicId = process.argv[2] ?? process.env.LOGIC_ID
if (!logicId) throw new Error('Pass logic id as argv[2] or set LOGIC_ID in .env')

const driver = await getLogicDriver(logicId, wallet)
const ix = await driver.routines.Flip().send()
const { error } = await ix.result()

if (error) throw new Error(error)
console.log('Interaction hash:', ix.hash)
```

- `.send()` broadcasts a **signed** interaction (state mutation, costs gas)
- `.result()` waits for finality and returns `{ error, ... }`

---

## Pattern 4 — Invoke Static Endpoint (`.call()`)

```js
const driver = await getLogicDriver(logicId, wallet)
const response = await driver.routines.Mode().call()
const { output, error } = await response.result()

if (error) throw new Error(error)
console.log('value:', output?.value)
```

- `.call()` is **free** — no gas, no signature required
- Use for `endpoint static` endpoints in Coco
- Returns `output` containing the endpoint's return values

---

## `.send()` vs `.call()` Summary

| | `.send()` | `.call()` |
|--|-----------|-----------|
| Endpoint type | `dynamic` (mutating) | `static` (read-only) |
| Gas cost | Yes | No |
| Signature required | Yes | No |
| Returns | interaction hash | query result |
| Coco keyword | `endpoint dynamic` | `endpoint static` |

> **Common mistake:** Using `.call()` on a `dynamic` endpoint or `.send()` on a `static` endpoint. Both will fail or produce unexpected results.

---

## Logic ID — Passing to Scripts

Scripts accept the Logic ID in two ways:

```bash
# Option 1: from .env (LOGIC_ID=0x...)
node sdk/flip.js

# Option 2: as command-line argument
node sdk/flip.js 0x<logic-id>
```

Code pattern:

```js
const logicId = process.argv[2] ?? process.env.LOGIC_ID
if (!logicId) throw new Error('Pass logic id as argv[2] or set LOGIC_ID in .env')
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MOI_MNEMONIC` | Yes | 12-word BIP39 mnemonic |
| `MOI_DERIVATION_PATH` | No | BIP44 path (default: `m/44'/6174'/7020'/0/0`) |
| `LOGIC_ID` | After deploy | Logic ID from `deploy.js` output |

---

## See Also

- [Deployment](deployment.md)
- [Flipper](flipper.md)
- [VoyageProvider reference](../sdk/voyage-provider.md)
- [Wallet reference](../sdk/wallet.md)
- [LogicFactory reference](../sdk/logic-factory.md)
- [LogicDriver reference](../sdk/logic-driver.md)
