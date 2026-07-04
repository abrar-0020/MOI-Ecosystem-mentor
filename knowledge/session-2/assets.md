# Native Assets — Overview

## Asset Architecture

MOI supports two categories of native assets:

| Category | Description | SDK class |
|----------|-------------|-----------|
| MAS0 | Standard fungible asset, no custom logic | `MAS0AssetLogic` |
| Custom | Coco-backed asset with custom endpoints | `AssetFactory` |

Both produce an **Asset ID** upon creation.

---

## Asset Lifecycle

```
1. Create  → Asset ID assigned on-chain
2. Mint    → Tokens issued to a beneficiary
3. Transfer → Tokens move between addresses
               (custom assets may apply fee-on-transfer)
4. Burn    → (optional) Reduce supply
```

---

## Asset IDs

- Format: `0x<hex>` (similar to an address)
- Unique per asset
- Assigned by devnet at creation time
- Used to instantiate asset driver: `new MAS0AssetLogic(assetId, wallet)`
- Searchable on Voyage explorer
- Save to `.env`:

```dotenv
ASSET_ID=0x<asset-id>
```

---

## Treasury Model

The **treasury** is an address that collects fees from asset transfers. It applies to custom assets (like TaxToken), not MAS0.

- Set **at deploy time** via the `Init` parameter
- Cannot be changed after deployment (no setter endpoint)
- Receives fees automatically on every `Transfer()` call
- Typically the deployer's address in demo scenarios

To change the treasury, deploy a new instance of the custom asset logic.

---

## Environment Variables (Session 2)

```dotenv
MOI_MNEMONIC=<your twelve word mnemonic>
MOI_DERIVATION_PATH=m/44'/6174'/7020'/0/0  # optional
# After running scripts, optionally save:
ASSET_ID=0x<mas0-asset-id>
TAX_ASSET_ID=0x<taxtoken-asset-id>
```

---

## Workflow Comparison

### MAS0 (Standard)

```bash
node sdk/asset.js
# → Creates asset (symbol, supply, manager)
# → Mints tokens to manager address
# → Prints Asset ID
```

### TaxToken (Custom)

```bash
# (Optional) recompile if source was edited:
cd coco && coco compile && coco manifest convert taxtoken.yaml -f json -o taxtoken.json && cd ..

node sdk/tax-deploy.js
# → Deploys Coco manifest with treasury + bps params
# → Creates asset on-chain
# → Prints Asset ID
```

---

## Script Reference

| Script | Purpose | Output |
|--------|---------|--------|
| `sdk/asset.js` | Create + mint MAS0 asset | Asset ID, mint tx hash |
| `sdk/tax-deploy.js` | Deploy TaxToken logic with treasury | Asset ID, deploy tx hash |

---

## Verification

After running either script:

1. Copy the **interaction hash** from output
2. Open <https://voyage.moi.technology>
3. Paste hash into search
4. Confirm finalization
5. Search wallet address to see asset balance

Note: The Voyage explorer may take 1–2 minutes to index new assets.

---

## See Also

- [MAS0](mas0.md) — create and mint MAS0
- [TaxToken](taxtoken.md) — fee-on-transfer design
- [MAS0AssetLogic SDK reference](../sdk/mas0-asset-logic.md)
- [AssetFactory SDK reference](../sdk/asset-factory.md)
- [Session 2 Troubleshooting](troubleshooting.md)
