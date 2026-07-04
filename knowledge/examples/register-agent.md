# Example: Register an Agent

This example demonstrates how an agent card is uploaded to a mock uploader service and then registered on the on-chain MOI Agent Registry.

---

## Code (`register.mjs`)

```javascript
import 'dotenv/config'
import { VoyageProvider, Wallet } from 'js-moi-sdk'
import { AgentRegistry } from '@moi-foundation/js-moi-agent-registry'

async function registerAgent() {
    // 1. Setup Provider & Wallet
    const provider = new VoyageProvider('devnet')
    const wallet = await Wallet.fromMnemonic(
        process.env.MOI_MNEMONIC,
        process.env.MOI_DERIVATION_PATH || "m/44'/6174'/7020'/0/0"
    )
    wallet.connect(provider)
    
    const ownerAddress = (await wallet.getIdentifier()).toString()

    // 2. Define Agent Card
    const agentCard = {
        name: process.env.AGENT_NAME || "OpenClaw Agent",
        description: "An OpenClaw agent operating on MOI",
        version: "1.0.0",
        url: process.env.AGENT_URL || "http://localhost:3940",
        capabilities: ["chat", "moi-registry"],
        skills: ["moi-agent-dating"]
    }

    // 3. Upload Card to Uploader Service
    const uploaderUrl = process.env.UPLOADER_URL || "http://localhost:7777"
    console.log(`Uploading agent card to ${uploaderUrl}...`)
    
    const uploadRes = await fetch(uploaderUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentCard)
    })
    
    if (!uploadRes.ok) {
        throw new Error(`Upload failed: ${uploadRes.statusText}`)
    }
    
    const { uri: cardUri } = await uploadRes.json()

    // 4. Register on MOI Network
    console.log(`Registering agent on-chain...`)
    const registry = new AgentRegistry(wallet)
    
    const protocolInfo = {
        protocol: 'a2a',
        version: '1.0.0'
    }
    const cardData = { uri: cardUri }

    const ix = await registry.createAgent(protocolInfo, cardData).send()
    const result = await ix.result()

    console.log('--- Registration Successful ---')
    console.log('Agent ID:', result.agent_id)
    console.log('Owner Address:', ownerAddress)
}

registerAgent().catch(console.error)
```

---

## Prerequisites

Before running this script, the uploader service must be running locally:

```bash
node uploader.mjs &
```
