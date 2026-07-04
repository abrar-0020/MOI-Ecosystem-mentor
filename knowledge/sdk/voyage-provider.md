# VoyageProvider Reference

The `VoyageProvider` class from `js-moi-sdk` connects your application to the MOI network's RPC endpoints.

---

## Import

```js
import { VoyageProvider } from 'js-moi-sdk'
```

---

## Instantiation

Create a new instance pointing to the desired network. For all webinar examples, we use the MOI public developer network, `devnet`.

```js
const provider = new VoyageProvider('devnet')
```

---

## Usage with Wallets

A provider alone can query network state, but to broadcast transactions (interactions), you must bind a `Wallet` to the provider.

```js
const wallet = await Wallet.fromMnemonic(mnemonic, derivationPath)

// Bind the wallet to the devnet provider
wallet.connect(provider)
```

> **Important:** Forgetting to call `wallet.connect(provider)` is a common mistake that will prevent the wallet from broadcasting `.send()` interactions.

---

## Network Endpoints

Behind the scenes, `VoyageProvider('devnet')` points to:
`https://voyage.moi.technology`

---

## See Also
- [Wallet](wallet.md)
- [SDK Quick Start](../overview/sdk-quick-start.md)
