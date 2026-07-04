# Wallet SDK Reference

The `Wallet` class from `js-moi-sdk` manages cryptographic identity and interaction signing.

---

## Import

```js
import { Wallet } from 'js-moi-sdk'
```

---

## Instantiating from a Mnemonic

The standard way to initialize a wallet is from a 12-word BIP39 mnemonic and a BIP44 derivation path.

```js
const mnemonic = process.env.MOI_MNEMONIC
const derivationPath = "m/44'/6174'/7020'/0/0"

const wallet = await Wallet.fromMnemonic(mnemonic, derivationPath)
```

See [Wallets & Derivation](../concepts/wallets-and-derivation.md) for details on choosing the correct derivation path.

---

## Connecting to a Provider

To interact with the MOI network, the wallet must be connected to a `VoyageProvider`.

```js
import { VoyageProvider } from 'js-moi-sdk'

const provider = new VoyageProvider('devnet')
wallet.connect(provider)
```

Without calling `.connect()`, attempting to `.send()` an interaction will fail.

---

## Getting the Wallet Address

You can retrieve the wallet's on-chain address (Identifier) to use as parameters (e.g., as the manager address when creating an asset).

```js
// Get the Identifier object
const identifier = await wallet.getIdentifier()

// Get the string representation (0x...)
const addressString = identifier.toString()

// Get the byte representation (useful for passing as Coco endpoint arguments)
const addressBytes = identifier.toBytes()
```

---

## Usage in Logic and Assets

The initialized, connected `wallet` object is passed into factory and driver methods:

- `new LogicFactory(manifest, wallet)`
- `await getLogicDriver(logicId, wallet)`
- `MAS0AssetLogic.create(wallet, ...)`

---

## See Also
- [VoyageProvider](voyage-provider.md)
- [Wallets & Derivation](../concepts/wallets-and-derivation.md)
