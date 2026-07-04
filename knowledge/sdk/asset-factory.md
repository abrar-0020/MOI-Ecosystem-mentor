# AssetFactory Reference

The `AssetFactory` class from `js-moi-sdk` is used to deploy **custom** asset logic (e.g., TaxToken) to the MOI network. It combines logic deployment with asset registration.

---

## Import

```js
import { AssetFactory } from 'js-moi-sdk'
```

---

## Deploying Custom Asset Logic

Unlike `LogicFactory`, `AssetFactory` takes additional parameters to register the logic as a valid native asset on the MOI platform.

```js
import manifest from '../coco/taxtoken.json' with { type: 'json' }

const ix = await AssetFactory.create(
    wallet,
    'TaxToken',           // Symbol or Name for the asset
    1_000_000,            // Total supply
    managerAddress,       // Address allowed to mint/burn
    true,                 // enableEvents flag
    manifest,             // Compiled JSON manifest of the Coco logic
    'Init',               // Name of the initialization endpoint
    ...initArgs           // Arguments required by the Init endpoint
).send()

const [{ asset_id }] = await ix.result()
console.log('Custom Asset ID:', asset_id)
```

---

## Example: Deploying TaxToken

TaxToken requires three arguments for its `Init` endpoint: `treasury_addr`, `bps`, and `initial_supply`.

```js
const treasuryAddrBytes = (await wallet.getIdentifier()).toBytes()
const TAX_BPS = 500 // 5%

const ix = await AssetFactory.create(
    wallet,
    'TaxToken',
    1_000_000,
    managerAddress,
    true,
    manifest,
    'Init',
    treasuryAddrBytes, // Arg 1: treasury_addr Identifier
    TAX_BPS,           // Arg 2: bps U64
    1_000_000          // Arg 3: initial_supply U64
).send()
```

---

## Interacting with the Custom Asset

Once deployed, you interact with custom endpoints on the asset (like a custom `Transfer` function) just as you would with any other Coco logic, using `getLogicDriver` with the returned `asset_id` (which functions as a `logic_id`).

---

## See Also
- [TaxToken Guide](../session-2/taxtoken.md)
- [LogicFactory](logic-factory.md)
