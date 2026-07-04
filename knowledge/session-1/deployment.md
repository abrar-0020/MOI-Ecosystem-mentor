# Deploying Coco Logic to MOI Devnet

## Overview

Deploying a Coco logic (smart contract) involves three steps:

1. Compile `.coco` source → JSON manifest (or use pre-compiled manifest)
2. Run `node sdk/deploy.js` — broadcasts the deploy interaction
3. Save the returned **Logic ID** to `.env`

---

## Step 1 — Environment Setup

```bash
cd session-1
npm install
cp .env.example .env
```

Edit `.env`:

```dotenv
MOI_MNEMONIC=word1 word2 ... word12
MOI_DERIVATION_PATH=m/44'/6174'/7020'/0/0
# LOGIC_ID is filled in after deploy
```

The wallet must be **funded** on devnet before deploying. Visit <https://voyage.moi.technology> for the faucet.

---

## Step 2 — (Optional) Recompile Coco Source

Pre-compiled manifests are checked in — skip this unless you edited `.coco` source:

```bash
cd flipper
coco compile
coco manifest convert flipper.yaml -f json -o flipper.json
cd ..
```

---

## Step 3 — Deploy

```bash
node sdk/deploy.js
```

Expected output:

```
Interaction hash: 0xabc123...
Logic ID       : 0xdef456...
```

---

## `sdk/deploy.js` — Full Source

```js
import 'dotenv/config'
import { VoyageProvider, Wallet, LogicFactory } from 'js-moi-sdk'
import manifest from '../flipper/flipper.json' with { type: 'json' }

const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, "m/44'/6174'/7020'/0/0")
wallet.connect(provider)

const factory = new LogicFactory(manifest, wallet)
const ix = await factory.deploy('Init').send()
const { logic_id, error } = await ix.result()

if (error) throw new Error(error)

console.log('Interaction hash:', ix.hash)
console.log('Logic ID       :', logic_id)
```

---

## Step 4 — Save Logic ID

Paste the printed Logic ID into `.env`:

```dotenv
LOGIC_ID=0xdef456...
```

---

## Step 5 — Verify on Voyage Explorer

1. Copy the **Interaction hash** from the deploy output
2. Open <https://voyage.moi.technology>
3. Paste the hash into the search bar
4. Confirm:
   - Status: **finalized**
   - `logic_id` field matches what was printed

---

## Step 6 — Invoke Endpoints

```bash
# State mutation (requires signature, costs gas)
node sdk/flip.js

# State query (free, no signature)
node sdk/mode.js
```

Both scripts read `LOGIC_ID` from `.env`, or you can pass it as `argv[2]`:

```bash
node sdk/flip.js 0xdef456...
node sdk/mode.js 0xdef456...
```

---

## Full Workflow Summary

```
npm install
cp .env.example .env          → fill MOI_MNEMONIC
node sdk/deploy.js            → prints Logic ID
# paste Logic ID into .env
node sdk/flip.js              → Flip() interaction
node sdk/mode.js              → Mode() read
```

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Wallet not funded | `account not found` | Use faucet at voyage.moi.technology |
| Wrong derivation path | `account not found` | Try `m/44'/6174'/0'/0/0` |
| `LOGIC_ID` not set | Script exits with error | Paste from deploy output into `.env` |
| Edited `.coco` but not recompiled | Old behaviour persists | Run `coco compile && coco manifest convert ...` |

---

## See Also

- [Flipper contract](flipper.md)
- [SDK patterns](sdk.md)
- [Troubleshooting](troubleshooting.md)
- [LogicFactory reference](../sdk/logic-factory.md)
