# Example: Deploying & Interacting with Flipper

This example shows the end-to-end process of deploying a shared-state logic (Flipper), mutating its state, and querying the result.

---

## 1. Deploy Logic (`deploy.js`)

Deploys the pre-compiled `flipper.json` manifest.

```js
import 'dotenv/config'
import { VoyageProvider, Wallet, LogicFactory } from 'js-moi-sdk'
import manifest from '../flipper/flipper.json' with { type: 'json' }

// 1. Setup Provider & Wallet
const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(
    process.env.MOI_MNEMONIC, 
    "m/44'/6174'/7020'/0/0"
)
wallet.connect(provider)

// 2. Create Factory & Deploy
const factory = new LogicFactory(manifest, wallet)
const ix = await factory.deploy('Init').send()

// 3. Await Finality
const { logic_id, error } = await ix.result()
if (error) throw new Error(error)

console.log('Logic ID:', logic_id)
```

*Action: Copy the printed `Logic ID` and paste it into `.env` as `LOGIC_ID=0x...`*

---

## 2. Mutate State (`flip.js`)

Invokes the `endpoint dynamic Flip()` which toggles the caller's boolean.

```js
import 'dotenv/config'
import { VoyageProvider, Wallet, getLogicDriver } from 'js-moi-sdk'

// 1. Setup Provider & Wallet
const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, "m/44'/6174'/7020'/0/0")
wallet.connect(provider)

// 2. Read Logic ID
const logicId = process.env.LOGIC_ID

// 3. Instantiate Driver & Send Interaction
const driver = await getLogicDriver(logicId, wallet)
const ix = await driver.routines.Flip().send() // .send() mutates state

// 4. Await Finality
const { error } = await ix.result()
if (error) throw new Error(error)

console.log('State flipped successfully.')
```

---

## 3. Query State (`mode.js`)

Invokes the `endpoint static Mode()` which reads the caller's current boolean without mutating state.

```js
import 'dotenv/config'
import { VoyageProvider, Wallet, getLogicDriver } from 'js-moi-sdk'

// 1. Setup Provider & Wallet
const provider = new VoyageProvider('devnet')
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, "m/44'/6174'/7020'/0/0")
wallet.connect(provider)

// 2. Read Logic ID
const logicId = process.env.LOGIC_ID

// 3. Instantiate Driver & Call Endpoint
const driver = await getLogicDriver(logicId, wallet)
const response = await driver.routines.Mode().call() // .call() is read-only

// 4. Resolve Response
const { output, error } = await response.result()
if (error) throw new Error(error)

console.log('Current value:', output?.value)
```
