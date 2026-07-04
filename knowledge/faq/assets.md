# Native Assets FAQ

Frequently asked questions about native assets, MAS0, and custom tokens on MOI.

---

### What is MAS0?

MAS0 is MOI's standard for fungible assets. It is equivalent to ERC-20 but built natively into the blockchain. It requires no custom logic — just a symbol, total supply, manager address, and enableEvents flag.

### How do I create a native asset?

Use `MAS0AssetLogic`:
```js
const ix = await MAS0AssetLogic.create(wallet, symbol, supply, manager, enableEvents).send()
```
The result returns an `asset_id`.

### What is an Asset ID?

A unique identifier for a created native asset (format `0x<hex>`), similar to a token contract address on Ethereum. Used to instantiate `MAS0AssetLogic(assetId, wallet)`.

### How do I mint tokens after creating an asset?

Creating the asset does not issue tokens. You must mint them:
```js
const asset = new MAS0AssetLogic(assetId, wallet)
await asset.mint(beneficiary, amount).send()
```

### What is TaxToken?

TaxToken is an example of custom Coco asset logic. It automatically routes a percentage (e.g., 5% = 500 basis points) of every transfer to a designated treasury address.

### How does the fee-on-transfer work in TaxToken?

When `Transfer(beneficiary, amount)` is called, the contract calculates `tax = (amount * tax_bps) / 10000`, then issues two transfers atomically: the treasury gets the `tax`, and the beneficiary gets `amount - tax`.

### Can I change the TaxToken treasury address later?

No. The treasury address is baked into the state at deploy time via the `Init` endpoint parameters. There is no endpoint to modify it. If you need a different treasury, deploy a new TaxToken.

### My fee is wrong! I passed '5' but it's charging 0.05%?

Fees are configured in basis points (bps), not percentages. 1% is 100 bps. For a 5% fee, you must pass `500` as the `bps` parameter.

### Why does `balanceOf` return undefined?

You likely used `.send()` instead of `.call()`. Read-only operations must use `.call()`. Also, if tokens haven't been minted yet, the balance will be 0 (but not undefined).
