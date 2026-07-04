# Session 2 CLI Commands

Reference for all command-line operations used in Session 2 (Native Assets).

---

## Setup Environment

Install dependencies and set up the `.env` file.

```bash
cd session-2
npm install
cp .env.example .env
# Remember to edit .env and set your MOI_MNEMONIC
```

## Standard Assets (MAS0)

Create a MAS0 asset and mint tokens to the manager address.

```bash
node sdk/asset.js
```
*(Outputs the Asset ID. You can optionally save this to `.env` as `ASSET_ID=0x...`)*

## Custom Assets (TaxToken)

**Optional: Compile Custom Logic**
Only necessary if you modified the `taxtoken.coco` source file.
```bash
cd coco
coco compile
coco manifest convert taxtoken.yaml -f json -o taxtoken.json
cd ..
```

**Deploy TaxToken:**
Deploys the custom logic as an asset and prints the new Asset ID.
```bash
node sdk/tax-deploy.js
```
*(Outputs the TaxToken Asset ID. You can optionally save this to `.env` as `TAX_ASSET_ID=0x...`)*

---

## Verifying Output

After running either script, copy the printed **Interaction hash** and search for it on the Voyage explorer (<https://voyage.moi.technology>) to confirm it was finalized successfully.
