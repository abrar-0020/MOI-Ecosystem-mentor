# TaxToken — Fee-on-Transfer Asset

## What Is TaxToken?

TaxToken is a **custom Coco asset logic** that automatically collects a percentage of every transfer as a fee and routes it to a configured **treasury address**. It demonstrates:

- Writing custom asset logic in Cocolang
- Fee calculation using basis points (bps)
- Atomic dual-transfer (treasury + beneficiary in one call)
- Stateful treasury and fee configuration at deploy time

---

## Fee-on-Transfer Mechanism

When `Transfer(beneficiary, amount)` is called:

1. `tax = (amount × tax_bps) / 10000`
2. `net = amount − tax`
3. Two asset transfers happen atomically:
   - Treasury receives `tax`
   - Beneficiary receives `net`

**Example with 5% fee (500 bps):**

```
Transfer(bob, 1000)
  → treasury receives  50   (5%)
  → bob receives      950   (95%)
```

---

## Basis Points

Fees are configured in **basis points** (bps), not percentages:

| Percentage | Basis Points |
|-----------|--------------|
| 1% | 100 |
| 5% | 500 |
| 10% | 1000 |
| 100% | 10000 |

> **Common mistake:** Passing `5` (percent) instead of `500` (bps). The fee will be 0.05% instead of 5%.

---

## Coco Source (Conceptual)

The TaxToken logic in Coco includes:

- `state logic` with `treasury_addr`, `tax_bps`, and `total_supply` fields
- `endpoint deploy Init(treasury_addr Identifier, bps U64, initial_supply U64)` — sets up the treasury and fee rate at deploy time
- `endpoint dynamic Transfer(beneficiary Identifier, amount U64)` — computes and executes the dual transfer

---

## Deploying TaxToken

```js
import 'dotenv/config'
import { VoyageProvider, Wallet, AssetFactory } from 'js-moi-sdk'
import manifest from '../coco/taxtoken.json' with { type: 'json' }

const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, "m/44'/6174'/7020'/0/0")
wallet.connect(provider)

const address = (await wallet.getIdentifier()).toString()
const identifier = await wallet.getIdentifier()

const TAX_BPS = 500          // 5%
const INITIAL_SUPPLY = 1_000_000

const ix = await AssetFactory.create(
  wallet,
  'TaxToken',
  INITIAL_SUPPLY,
  address,                    // manager
  true,                       // enableEvents
  manifest,                   // TaxToken compiled manifest
  'Init',
  identifier.toBytes(),       // treasury_addr parameter
  TAX_BPS,                    // bps parameter
  INITIAL_SUPPLY,             // initial_supply parameter
).send()

const [{ asset_id }] = await ix.result()
console.log('TaxToken Asset ID:', asset_id)
```

---

## Running the TaxToken Demo

```bash
cd session-2
npm install
cp .env.example .env
# Fill MOI_MNEMONIC

# (Optional) Recompile if you edited taxtoken.coco
cd coco
coco compile
coco manifest convert taxtoken.yaml -f json -o taxtoken.json
cd ..

node sdk/tax-deploy.js
```

---

## Treasury Design

- The treasury address is **baked in at deploy time** (passed as `Init` parameter)
- There is **no endpoint to change the treasury** after deployment
- The deployer's address is typically used as the treasury in the demo
- To use a different treasury, deploy a new TaxToken instance

---

## Key Files

| File | Purpose |
|------|---------|
| `coco/taxtoken.coco` | TaxToken Coco source |
| `coco/taxtoken.json` | Pre-compiled manifest |
| `coco/taxtoken.yaml` | Coco manifest definition |
| `sdk/tax-deploy.js` | Deploy script using `AssetFactory` |

---

## Common Mistakes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Passing `5` instead of `500` for bps | Fee is 0.05% not 5% | Use basis points (500 for 5%) |
| Editing `.coco` without recompiling | Old behaviour | Run `coco compile && coco manifest convert ...` |
| Hardcoding treasury in source | Not reusable | Pass as `Init` parameter |
| Not calling `.send()` on deploy | No on-chain effect | Always await `.send()` then `.result()` |

---

## See Also

- [MAS0 — standard asset](mas0.md)
- [Assets overview](assets.md)
- [AssetFactory SDK reference](../sdk/asset-factory.md)
- [Session 2 Troubleshooting](troubleshooting.md)
