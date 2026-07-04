# Session 2 Troubleshooting

Common errors encountered during Session 2 (native assets).

---

## `MOI_MNEMONIC is not set`

**Fix:**

```bash
cp .env.example .env
# Open .env and paste your real 12-word mnemonic
```

---

## `account not found`

**Cause 1:** Wallet not funded on devnet.

**Fix:** Fund at <https://voyage.moi.technology> using the faucet.

**Cause 2:** Derivation path mismatch.

**Fix:** Add to `.env`:

```dotenv
MOI_DERIVATION_PATH=m/44'/6174'/0'/0/0
```

---

## TaxToken Deploy Fails After Editing `.coco`

**Cause:** The old pre-compiled manifest (`taxtoken.json`) is still being used.

**Fix:**

```bash
cd coco
coco compile
coco manifest convert taxtoken.yaml -f json -o taxtoken.json
cd ..
node sdk/tax-deploy.js
```

---

## Asset Created But Zero Balance

**Cause:** `MAS0AssetLogic.create()` creates the asset definition but does **not** issue tokens. You must call `.mint()` separately.

**Fix:** After `create()`, call:

```js
const asset = new MAS0AssetLogic(asset_id, wallet)
await asset.mint(address, mintAmount).send()
```

The `sdk/asset.js` script does both in sequence. If you split them, ensure you mint.

---

## `balanceOf` Returns `undefined`

**Cause:** Using `.send()` instead of `.call()` on the read-only `balanceOf` operation.

**Fix:**

```js
const response = await asset.balanceOf(address).call()  // .call() not .send()
```

---

## Asset Not Visible on Voyage Explorer

**Cause:** Indexing delay (Voyage can lag 1–2 minutes behind on-chain state).

**Fix:**

1. Wait 1–2 minutes
2. Search by the **Asset ID** directly (not just wallet address)
3. Confirm the creation interaction is finalized

---

## Wrong Fee Amount (TaxToken)

**Cause:** Fee was specified as a percentage (e.g., `5`) instead of basis points (`500`).

**Fix:** Use basis points:

| Intended fee | Correct bps value |
|-------------|-------------------|
| 1% | 100 |
| 5% | 500 |
| 10% | 1000 |

---

## Summary Table

| Symptom | Cause | Fix |
|---------|-------|-----|
| `MOI_MNEMONIC is not set` | Missing `.env` | `cp .env.example .env` |
| `account not found` | Not funded or wrong path | Fund wallet; try alternate path |
| TaxToken deploy fails | Stale manifest | Recompile: `coco compile && coco manifest convert ...` |
| Zero balance after create | Mint not called | Call `asset.mint()` after creation |
| `balanceOf` is undefined | Used `.send()` instead of `.call()` | Switch to `.call()` |
| Asset not on explorer | Indexing lag | Wait and search by Asset ID |
| Wrong fee % | Used percent not bps | Multiply by 100 for bps |

---

## See Also

- [MAS0](mas0.md)
- [TaxToken](taxtoken.md)
- [Assets overview](assets.md)
- [Common Errors (all sessions)](../troubleshooting/common-errors.md)
