# LogicFactory Reference

The `LogicFactory` class from `js-moi-sdk` is used to deploy a new instance of a compiled Coco smart contract to the MOI network.

---

## Import

```js
import { LogicFactory } from 'js-moi-sdk'
```

---

## Instantiation

To create a `LogicFactory`, you need the compiled JSON manifest of your Coco logic and a connected `Wallet`.

```js
import manifest from '../flipper/flipper.json' with { type: 'json' }

const factory = new LogicFactory(manifest, wallet)
```

---

## Deploying

Call `.deploy()` with the name of your initialization endpoint (e.g., `'Init'`). Then call `.send()` to broadcast the interaction.

```js
const ix = await factory.deploy('Init').send()
```

If your `'Init'` endpoint takes parameters, pass them after the endpoint name:

```js
// Assuming: endpoint deploy Init(initial_value U64)
const ix = await factory.deploy('Init', 42).send()
```

---

## Awaiting Finality and Getting Logic ID

To get the resulting `logic_id`, wait for the interaction to finalize using `.result()`.

```js
const { logic_id, error } = await ix.result()

if (error) {
    throw new Error(`Deploy failed: ${error}`)
}

console.log('Deployed Logic ID:', logic_id)
console.log('Interaction Hash:', ix.hash)
```

Save the `logic_id` string (e.g., `0xabc...`) as it is required to interact with the deployed contract later.

---

## See Also
- [getLogicDriver](logic-driver.md)
- [Deployment Guide](../session-1/deployment.md)
