# Coco & Logic FAQ

Frequently asked questions about the Coco language, logic deployment, and execution.

---

### What's the difference between Flipper and ContextFlipper?

`Flipper` uses `state logic` (shared state), meaning all callers interact with the same map of data on-chain.
`ContextFlipper` uses `state actor` (per-caller isolated state), meaning each caller gets their own independent state slot. This allows parallel execution.

### How do I deploy logic to MOI?

Use `LogicFactory`:
```js
const factory = new LogicFactory(manifest, wallet)
const ix = await factory.deploy('Init').send()
```
The `.deploy()` method takes the name of the initialization endpoint as a parameter.

### How do I invoke a deployed logic?

Use `getLogicDriver`:
```js
const driver = await getLogicDriver(logicId, wallet)
// Mutate state
await driver.routines.EndpointName().send()
// Query state
await driver.routines.EndpointName().call()
```

### What's the difference between `.send()` and `.call()`?

- `.send()` broadcasts a signed interaction. It mutates state, costs gas, requires a signature, and returns an interaction hash. Use it for `dynamic` endpoints.
- `.call()` queries on-chain state without a signature. It's read-only, free, and returns the query result immediately. Use it for `static` endpoints.

### Where do I save the Logic ID?

Paste it into your `.env` file as `LOGIC_ID=0x...` so subsequent scripts (flip, mode) can reuse it without re-deploying.

### I'm getting "logic not found". What happened?

You might have copied the interaction hash instead of the Logic ID, or the deploy interaction failed. Verify the interaction hash on Voyage, confirm it's finalized, and copy the exact `logic_id` from the explorer or script output.

### Why do changes to my `.coco` source not take effect?

The SDK scripts use the pre-compiled `.json` manifests. If you edit the `.coco` source, you must recompile it before running the deploy script again:
```bash
coco compile && coco manifest convert flipper.yaml -f json -o flipper.json
```

### What is CocoLab?

CocoLab is an interactive REPL for testing Coco logic without on-chain deployment. It's used for rapid iteration and learning Coco syntax. Run `coco lab init` in a Coco project folder to start it.
