# MAS0AssetLogic Reference

The `MAS0AssetLogic` class from `js-moi-sdk` provides methods to create and interact with MAS0 standard native assets.

---

## Import

```js
import { MAS0AssetLogic } from 'js-moi-sdk'
```

---

## Creating a New MAS0 Asset

Use the static `create` method to define a new asset on-chain. This does **not** mint any tokens yet.

```js
const ix = await MAS0AssetLogic.create(
    wallet,
    'SYMBOL',         // e.g. 'WEBINAR'
    1_000_000,        // total supply limit
    managerAddress,   // address allowed to mint/burn (e.g. wallet.getIdentifier().toString())
    true              // enableEvents flag
).send()

const [{ asset_id }] = await ix.result()
console.log('Created Asset ID:', asset_id)
```

---

## Interacting with an Existing Asset

Instantiate the class using an existing `asset_id` and a connected `Wallet`.

```js
const assetId = process.env.ASSET_ID
const asset = new MAS0AssetLogic(assetId, wallet)
```

### Minting Tokens

Only the manager address can mint tokens.

```js
const ix = await asset.mint(beneficiaryAddress, amount).send()
await ix.result()
```

### Checking Balances

Use `.call()` since this is a read-only query.

```js
const res = await asset.balanceOf(addressToCheck).call()
console.log('Balance:', res)
```

### Transferring Tokens

```js
const ix = await asset.transfer(recipientAddress, amount).send()
await ix.result()
```

---

## See Also
- [MAS0 Asset Guide](../session-2/mas0.md)
- [Assets Overview](../session-2/assets.md)
