# Example: Create and Mint an MAS0 Asset

This example demonstrates how to create a standard fungible asset (MAS0) and mint the initial supply to the manager's address.

---

## Code (`asset.js`)

```js
import 'dotenv/config'
import { VoyageProvider, Wallet, MAS0AssetLogic } from 'js-moi-sdk'

async function main() {
    // 1. Setup Provider & Wallet
    const provider = new VoyageProvider('devnet')
    const wallet = await Wallet.fromMnemonic(
        process.env.MOI_MNEMONIC, 
        "m/44'/6174'/7020'/0/0"
    )
    wallet.connect(provider)

    // Retrieve the wallet's address string to act as the manager
    const managerAddress = (await wallet.getIdentifier()).toString()

    console.log(`Creating asset with manager: ${managerAddress}`)

    // 2. Create the Asset on-chain
    const createIx = await MAS0AssetLogic.create(
        wallet,
        'WEBINAR',        // Symbol
        1_000_000,        // Max Total Supply
        managerAddress,   // Manager Address
        true              // enableEvents
    ).send()

    const [{ asset_id }, createError] = await createIx.result()
    if (createError) throw new Error(`Asset creation failed: ${createError}`)

    console.log('Asset ID created:', asset_id)

    // 3. Mint Tokens
    // Re-instantiate the asset logic using the new asset_id
    const asset = new MAS0AssetLogic(asset_id, wallet)
    const mintAmount = 100_000
    
    console.log(`Minting ${mintAmount} tokens...`)
    const mintIx = await asset.mint(managerAddress, mintAmount).send()
    
    const { error: mintError } = await mintIx.result()
    if (mintError) throw new Error(`Minting failed: ${mintError}`)

    console.log(`Successfully minted ${mintAmount} WEBINAR to ${managerAddress}`)
    
    // 4. Verify Balance (Optional read-only query)
    const balanceRes = await asset.balanceOf(managerAddress).call()
    console.log('Confirmed Balance:', balanceRes)
}

main().catch(console.error)
```

---

## Workflow Notes

- `MAS0AssetLogic.create()` generates the definition of the asset on the network but issues 0 tokens.
- You must subsequently call `.mint()` to issue tokens to a specific address.
- Only the `managerAddress` (defined during creation) is authorized to call `.mint()`.
