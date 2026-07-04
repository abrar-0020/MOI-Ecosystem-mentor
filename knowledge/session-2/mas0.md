# MAS0 — Standard Fungible Asset

## What Is MAS0?

MAS0 is MOI's native standard for fungible assets — equivalent to ERC-20 but built into the blockchain layer. Unlike ERC-20, **no custom logic is required**. You specify a symbol, supply, and manager address, and the SDK handles everything else.

---

## Creating an MAS0 Asset

```js
import 'dotenv/config'
import { VoyageProvider, Wallet, MAS0AssetLogic } from 'js-moi-sdk'

const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, "m/44'/6174'/7020'/0/0")
wallet.connect(provider)

const address = (await wallet.getIdentifier()).toString()

const ix = await MAS0AssetLogic.create(
  wallet,
  'WEBINAR',    // symbol
  1_000_000,    // total supply
  address,      // manager address (can mint/burn)
  true          // enableEvents
).send()

const [{ asset_id }] = await ix.result()
console.log('Asset ID:', asset_id)
```

### `MAS0AssetLogic.create()` Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `wallet` | `Wallet` | Signing wallet (will be the manager unless overridden) |
| `symbol` | `string` | Token ticker (e.g., `'WEBINAR'`) |
| `totalSupply` | `number` | Maximum total supply |
| `manager` | `string` | Address that can mint/burn tokens |
| `enableEvents` | `boolean` | Emit on-chain events for transfers |

---

## Minting Tokens

After creation, the manager mints tokens to a beneficiary:

```js
const asset = new MAS0AssetLogic(asset_id, wallet)
const mintAmount = 100_000

const mintIx = await asset.mint(address, mintAmount).send()
await mintIx.result()

console.log(`Minted ${mintAmount} to ${address}`)
```

> **Important:** Creating an asset does **not** automatically issue tokens. You must call `.mint()` separately.

---

## Running the Session 2 Asset Demo

```bash
cd session-2
npm install
cp .env.example .env
# Fill in MOI_MNEMONIC

node sdk/asset.js
```

Expected output:

```
Asset ID: 0x<hex>
Minted 100000 to 0x<wallet-address>
```

---

## Asset ID

- Format: `0x<hex>` (similar to an address)
- Printed by `node sdk/asset.js`
- Used to instantiate `new MAS0AssetLogic(assetId, wallet)`
- Searchable on <https://voyage.moi.technology>
- Save to `.env` if you need it for further scripts:

```dotenv
ASSET_ID=0x<asset-id>
```

---

## Verifying on Voyage

1. Copy the **interaction hash** from `sdk/asset.js` output
2. Paste into <https://voyage.moi.technology>
3. Confirm finalization
4. Search your wallet address to see the asset balance

---

## MAS0 vs Custom Asset Logic

| | MAS0 | Custom (e.g., TaxToken) |
|--|------|------------------------|
| Custom logic required | No | Yes (Coco source) |
| Fee-on-transfer | No | Yes (custom endpoint) |
| Deploy complexity | One SDK call | Compile + deploy manifest |
| Use case | Standard token | Fee, vesting, restricted |

---

## See Also

- [TaxToken](taxtoken.md) — fee-on-transfer custom asset
- [Assets overview](assets.md) — Asset IDs, treasury, workflow
- [MAS0AssetLogic SDK reference](../sdk/mas0-asset-logic.md)
- [Session 2 Troubleshooting](troubleshooting.md)
