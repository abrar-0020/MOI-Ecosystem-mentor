# getLogicDriver Reference

The `getLogicDriver` function from `js-moi-sdk` generates an interface to interact with an already-deployed Coco logic contract.

---

## Import

```js
import { getLogicDriver } from 'js-moi-sdk'
```

---

## Instantiation

You need the `logic_id` of the deployed contract and a connected `Wallet`.

```js
const logicId = process.env.LOGIC_ID
const driver = await getLogicDriver(logicId, wallet)
```

---

## Invoking Endpoints

The endpoints defined in your Coco source (e.g., `Flip`, `Mode`) are automatically exposed on the `driver.routines` object.

### Mutating State (`.send()`)

For `endpoint dynamic` or `endpoint enlist` functions, use `.send()` to broadcast a transaction.

```js
// Call Flip() which takes no arguments
const ix = await driver.routines.Flip().send()

// Wait for finality
const { error } = await ix.result()

if (error) throw new Error(error)
console.log('State mutated. Hash:', ix.hash)
```

If the endpoint takes arguments, pass them in the routine call:
```js
// Assuming: endpoint dynamic SetValue(val U64)
await driver.routines.SetValue(100).send()
```

### Querying State (`.call()`)

For `endpoint static` functions, use `.call()` to query the local RPC node. This is free and does not require a signature.

```js
// Call Mode()
const response = await driver.routines.Mode().call()

// Resolves immediately
const { output, error } = await response.result()

if (error) throw new Error(error)

// output is an object containing the returned values named in Coco
// e.g. endpoint static Mode() -> (value Bool)
console.log('Current value:', output?.value)
```

---

## See Also
- [LogicFactory](logic-factory.md)
- [SDK Patterns](../session-1/sdk.md)
- [Interactions](../concepts/interactions.md)
