# SDK Quick Start

Get from zero to a working MOI interaction in five minutes.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 20 or higher |
| npm | bundled with Node 20 |
| Coco toolchain | only if editing `.coco` sources |

Verify Node:

```bash
node --version   # must be v20+
```

---

## 1 — Install Dependencies

Each session has its own `package.json`. Always install from the session root:

```bash
cd session-1   # or session-2, session-3
npm install
```

The SDK package used across all sessions: **`js-moi-sdk@0.7.0-rc15`**

---

## 2 — Create a Wallet on Devnet

1. Visit <https://voyage.moi.technology>
2. Create a new wallet (or import an existing mnemonic)
3. Use the faucet to fund the wallet with devnet tokens
4. Copy the 12-word mnemonic

> **Never share or commit your mnemonic.**

---

## 3 — Configure `.env`

```bash
cp .env.example .env
```

Edit `.env`:

```dotenv
MOI_MNEMONIC=word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12
MOI_DERIVATION_PATH=m/44'/6174'/7020'/0/0
```

`LOGIC_ID` and `ASSET_ID` are filled in as you progress through the demos.

---

## 4 — Wire Up Provider + Wallet (Code Pattern)

Every script in the webinar sessions follows this exact pattern:

```js
import 'dotenv/config'
import { VoyageProvider, Wallet } from 'js-moi-sdk'

const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(
  process.env.MOI_MNEMONIC,
  "m/44'/6174'/7020'/0/0"   // or read from MOI_DERIVATION_PATH
)
wallet.connect(provider)
```

---

## 5 — Deploy Logic

```js
import { LogicFactory } from 'js-moi-sdk'
import manifest from '../flipper/flipper.json' with { type: 'json' }

const factory = new LogicFactory(manifest, wallet)
const ix = await factory.deploy('Init').send()
const { logic_id, error } = await ix.result()

if (error) throw new Error(error)
console.log('Logic ID:', logic_id)
```

Save the printed `logic_id` into `.env` as `LOGIC_ID=0x...`.

---

## 6 — Invoke Logic

```js
import { getLogicDriver } from 'js-moi-sdk'

const driver = await getLogicDriver(process.env.LOGIC_ID, wallet)

// State-mutating endpoint (costs gas)
const ix = await driver.routines.Flip().send()
await ix.result()

// Read-only endpoint (free)
const res = await driver.routines.Mode().call()
const { output } = await res.result()
console.log('value:', output?.value)
```

---

## Key Patterns

| Operation | Method | Gas cost |
|-----------|--------|----------|
| Deploy logic | `.deploy('Init').send()` | Yes |
| Mutate state | `.routines.Fn().send()` | Yes |
| Query state | `.routines.Fn().call()` | No |
| Create asset | `MAS0AssetLogic.create(...).send()` | Yes |
| Mint tokens | `asset.mint(addr, amount).send()` | Yes |

---

## See Also

- [Wallet setup](../sdk/wallet.md)
- [VoyageProvider](../sdk/voyage-provider.md)
- [LogicFactory](../sdk/logic-factory.md)
- [getLogicDriver](../sdk/logic-driver.md)
