# Interactions

## What is an Interaction?

On the MOI network, an **Interaction** is a signed transaction sent to the network to mutate on-chain state.

Deploying a logic, calling a `dynamic` endpoint, creating an asset, and minting tokens all generate interactions.

---

## Lifecycle of an Interaction

1. **Creation:** You call a method on the SDK (e.g., `driver.routines.Flip().send()`).
2. **Signing:** The SDK signs the interaction payload using the connected Wallet.
3. **Broadcast:** The SDK sends the signed interaction to the devnet via the `VoyageProvider`.
4. **Hash Return:** The provider immediately returns an **Interaction Hash** (the transaction ID).
5. **Finality:** The network processes the interaction and reaches consensus.
6. **Result:** Polling `.result()` on the interaction object resolves when finality is reached, providing outputs or errors.

---

## Interaction Hash

The interaction hash is the unique identifier for your transaction.

- Format: `0x<hex>`
- You can use this hash on the Voyage explorer (<https://voyage.moi.technology>) to look up the transaction details, including its status, sender, and any produced logs or errors.

---

## `.send()` vs `.call()`

Understanding the difference between `.send()` and `.call()` is crucial.

### `.send()`
- Generates an Interaction.
- Mutates state on-chain.
- Costs gas (devnet tokens).
- Requires the Wallet to cryptographically sign the payload.
- Used for `endpoint dynamic`, `endpoint deploy`, and `endpoint enlist`.

```js
const ix = await driver.routines.Flip().send()
const { error } = await ix.result() // waits for finality
console.log('Interaction Hash:', ix.hash)
```

### `.call()`
- Does **not** generate an Interaction on the network.
- Queries state locally from the connected RPC node.
- Free (no gas).
- Does not require a signature.
- Used for `endpoint static`.

```js
const response = await driver.routines.Mode().call()
const { output, error } = await response.result() // resolves immediately
console.log('Value:', output?.value)
```

---

## Handling Interaction Errors

The `.result()` method returns an object that includes an `error` field if the interaction failed during execution (e.g., a logic panic or insufficient funds).

```js
const { error } = await ix.result()
if (error) {
    console.error("Interaction failed:", error)
}
```
If `error` is undefined, the interaction executed successfully.

---

## See Also
- [SDK Patterns](../session-1/sdk.md)
- [VoyageProvider](../sdk/voyage-provider.md)
