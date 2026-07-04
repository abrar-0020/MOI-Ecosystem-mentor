# General FAQ

Frequently asked questions about the MOI platform, devnet, and general setup.

---

### What is MOI?

MOI is a blockchain platform with native smart contracts (Coco language) and native assets (MAS0). It targets simplified developer experience and on-chain agents.

### Do I need the Coco toolchain to run Session 1, 2, or 3?

No. Pre-compiled `.json` manifests are checked in. You only need the Coco toolchain if you want to edit `.coco` sources and recompile them.

### What is VoyageProvider?

`VoyageProvider` is the RPC endpoint for MOI devnet. All SDK calls connect through it to broadcast transactions.

### How do I get a funded wallet?

Visit <https://voyage.moi.technology>, create a new wallet, and use the faucet. You'll receive a 12-word mnemonic and devnet MOI tokens.

### I'm getting "account not found", what do I do?

This means your derived wallet address doesn't match a funded account on devnet.
1. Ensure you funded the wallet using the faucet.
2. If funded, check your derivation path. Try adding `MOI_DERIVATION_PATH=m/44'/6174'/0'/0/0` to your `.env` file.

### How do I verify a transaction on Voyage?

Copy the interaction hash printed by your script, navigate to <https://voyage.moi.technology>, and paste it into the search bar. Confirm the status is `finalized`.

### I'm getting "npm ERR!" or "Cannot find module 'js-moi-sdk'"

1. Ensure Node.js 20+ is installed (`node --version`).
2. Ensure you ran `npm install` inside the specific session directory (`session-1`, `session-2`, etc.), not just the root folder.
3. If it persists, run `rm -rf node_modules package-lock.json && npm cache clean --force && npm install`.

### What is the difference between devnet and mainnet?

The webinar demos all run on the MOI public devnet (`VoyageProvider('devnet')`). Tokens on devnet have no real-world value and are obtained via the faucet for testing purposes.
