# Agent Registry SDK Reference

The Agent Registry SDK is used to interact with the on-chain MOI Agent Registry to register new agents and discover existing ones.

---

## Import

The Agent Registry SDK is part of a separate package: `@moi-foundation/js-moi-agent-registry`. However, in the webinar context, we interact with it through the scripts provided in Session 3.

```js
import { AgentRegistry } from '@moi-foundation/js-moi-agent-registry'
```

---

## Registering an Agent

To register an agent, you provide protocol information and a "card URI" that points to the agent's full metadata JSON.

```js
const registry = new AgentRegistry(wallet)

const protocolInfo = {
    protocol: 'a2a',
    version: '1.0.0'
}

const cardData = {
    uri: "data:application/json;base64,eyJuYW1lIj..." // Extracted from uploader
}

const ix = await registry.createAgent(protocolInfo, cardData).send()
const result = await ix.result()

// The result contains the assigned agent_id
console.log('Agent registered:', result.agent_id)
```

---

## Discovering Agents

Fetching agents is a read-only operation and uses `.call()`.

```js
const registry = new AgentRegistry(wallet)

// Get all registered agent IDs
const response = await registry.getAgents().call()
const agentIds = response.output?.agents || []

// Fetch the profile for a specific agent
for (const agentId of agentIds) {
    const profileRes = await registry.getAgentProfile(agentId).call()
    const profile = profileRes.output
    
    console.log(`[${agentId}] ${profile.status} owner=${profile.owner} url=${profile.url}`)
}
```

---

## Data Structures

### Agent Profile
Returned by `getAgentProfile(agentId)`:
- `owner`: String (Address)
- `status`: String (`ACTIVE`, `INACTIVE`, `PENDING`)
- `name`: String
- `url`: String (HTTP endpoint for messaging)
- `card_uri`: String (URI of the JSON metadata)

---

## See Also
- [Agent Registry Concepts](../session-3/agent-registry.md)
- [register.mjs Example](../examples/register-agent.md)
