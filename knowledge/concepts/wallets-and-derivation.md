# Wallets & Derivation

Identity on the MOI network revolves around HD (Hierarchical Deterministic) wallets derived from a seed phrase.

---

## The Mnemonic (Seed Phrase)

Your core identity is a 12-word BIP39 mnemonic.

```dotenv
MOI_MNEMONIC=word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12
```

> **CRITICAL SECURITY WARNING:** Never commit your mnemonic to source control. Always load it from a `.env` file or secure configuration store.

---

## Derivation Paths

From a single mnemonic, you can derive multiple distinct wallets (and therefore MOI addresses) by changing the **BIP44 derivation path**.

There are two primary derivation paths commonly encountered in the MOI ecosystem:

| Path | Usage |
|------|-------|
| `m/44'/6174'/7020'/0/0` | The path used by the Voyage web faucet. If you created and funded your wallet on <https://voyage.moi.technology>, your funds are on this path. |
| `m/44'/6174'/0'/0/0` | The default path used by some older SDK tools or alternative wallets. |

### Why This Matters

If you fund a wallet on Voyage, the devnet tokens are assigned to the address derived using the `7020'` path.

If your script derives the wallet using the `0'` path instead, the derived address will be completely different. Since that alternate address hasn't been funded, you will encounter an **`account not found`** error when trying to deploy logic or send transactions.

---

## Configuring the Derivation Path

You can pass the derivation path as the second argument to `Wallet.fromMnemonic`:

```js
const wallet = await Wallet.fromMnemonic(
    process.env.MOI_MNEMONIC,
    "m/44'/6174'/7020'/0/0"
)
```

Alternatively, you can parameterize it using your `.env` file so it's easy to switch if needed:

```dotenv
# .env
MOI_MNEMONIC=...
MOI_DERIVATION_PATH=m/44'/6174'/7020'/0/0
```

```js
// In your script
const path = process.env.MOI_DERIVATION_PATH || "m/44'/6174'/7020'/0/0"
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, path)
```

---

## See Also
- [Wallet SDK Reference](../sdk/wallet.md)
- [Common Errors](../troubleshooting/common-errors.md)
