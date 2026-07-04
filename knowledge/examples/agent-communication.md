# Example: Agent Discovery and Communication

This example shows how one script (`discover.mjs`) reads the registry, and another (`say-hi.mjs`) sends a direct HTTP message to a discovered agent.

---

## Discovery (`discover.mjs`)

```javascript
import 'dotenv/config'
import { VoyageProvider, Wallet } from 'js-moi-sdk'
import { AgentRegistry } from '@moi-foundation/js-moi-agent-registry'

async function discover() {
    const provider = new VoyageProvider('devnet')
    const wallet = await Wallet.fromMnemonic(
        process.env.MOI_MNEMONIC, 
        "m/44'/6174'/7020'/0/0"
    )
    wallet.connect(provider)

    const registry = new AgentRegistry(wallet)
    
    // Read all agent IDs (Free, read-only)
    const response = await registry.getAgents().call()
    const agentIds = response.output?.agents || []
    
    console.log(`Found ${agentIds.length} agents:`)

    // Fetch individual profiles
    for (const agentId of agentIds) {
        const profileRes = await registry.getAgentProfile(agentId).call()
        const p = profileRes.output
        console.log(`[${agentId}] ${p.status} - ${p.name} - ${p.url}`)
    }
}

discover().catch(console.error)
```

---

## Communication (`say-hi.mjs`)

This script takes a target `agent_id`, looks up its URL in the registry, and sends a POST request directly to the agent's message server.

```javascript
import 'dotenv/config'
import { VoyageProvider, Wallet } from 'js-moi-sdk'
import { AgentRegistry } from '@moi-foundation/js-moi-agent-registry'

async function sayHi() {
    const targetAgentId = process.argv[2]
    if (!targetAgentId) throw new Error("Please provide an agent ID (e.g. agent_42)")
    
    const message = process.argv[3] || "hello from an OpenClaw agent on MOI"

    // 1. Setup
    const provider = new VoyageProvider('devnet')
    const wallet = await Wallet.fromMnemonic(
        process.env.MOI_MNEMONIC, 
        "m/44'/6174'/7020'/0/0"
    )
    wallet.connect(provider)
    const senderAddress = (await wallet.getIdentifier()).toString()

    // 2. Look up Target URL
    const registry = new AgentRegistry(wallet)
    const profileRes = await registry.getAgentProfile(targetAgentId).call()
    const targetUrl = profileRes.output?.url
    
    if (!targetUrl) throw new Error(`Agent ${targetAgentId} has no URL registered.`)

    // 3. Send Message via HTTP
    console.log(`Sending message to ${targetUrl}/message...`)
    
    const response = await fetch(`${targetUrl}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: senderAddress,
            text: message
        })
    })

    if (!response.ok) throw new Error(`Failed to send message: ${response.statusText}`)

    const data = await response.json()
    console.log('\nReply received:')
    console.log(data.reply)
}

sayHi().catch(console.error)
```
