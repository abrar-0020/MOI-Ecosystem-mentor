# Core Concepts

Quick reference for every key term used across the MOI webinar sessions.

---

## Wallet

A cryptographic identity derived from a 12-word BIP39 mnemonic and a BIP44 derivation path.

```js
const wallet = await Wallet.fromMnemonic(process.env.MOI_MNEMONIC, "m/44'/6174'/7020'/0/0")
wallet.connect(provider)
```

- The mnemonic **must never** be committed to source control.
- Two common derivation paths exist — see [Wallets & Derivation](../concepts/wallets-and-derivation.md).

---

## VoyageProvider

The RPC provider that connects the SDK to MOI devnet.

```js
const provider = new VoyageProvider('devnet')
```

All interactions (deploys, invocations, asset creation) flow through this provider.

---

## Logic (Smart Contract)

A Coco-compiled smart contract deployed to MOI. Each deployment returns a **Logic ID**.

- Written in the Coco language (`.coco` extension)
- Compiled to a JSON manifest (`.json`)
- Deployed via `LogicFactory`
- Invoked via `getLogicDriver`

---

## Logic ID

A unique on-chain identifier for a deployed Coco contract.

- Format: `0x<hex>`
- Printed by `node sdk/deploy.js`
- Stored in `.env` as `LOGIC_ID=0x...`
- Used to create a `LogicDriver` for subsequent calls

---

## Interaction

A signed transaction sent to MOI devnet. Every state-mutating operation (deploy, flip, mint, register) produces one.

- Returns an **interaction hash** immediately after broadcast
- Confirmed on-chain asynchronously (poll with `.result()`)
- Verifiable at <https://voyage.moi.technology>

---

## Interaction Hash

The transaction ID returned by `.send()`. Use it to track confirmation status on the Voyage explorer.

---

## Asset

A native on-chain fungible token. MOI supports:

| Standard | Description |
|----------|-------------|
| MAS0 | Standard fungible asset (no custom logic needed) |
| Custom | Coco-based asset logic (e.g., TaxToken) |

An asset is created once and assigned an **Asset ID**.

---

## Asset ID

Unique identifier for a native asset. Format: `0x<hex>`. Used to instantiate `MAS0AssetLogic(assetId, wallet)`.

---

## Agent Registry

An on-chain contract storing agent metadata: owner, name, URL, status, capabilities, and a card URI.

- Agents register via `AgentRegistry.createAgent()`
- Discovery is read-only (no gas cost)
- Each agent receives an **Agent ID** (`agent_<number>`)

---

## Agent ID

Identifier assigned by the registry upon successful registration. Format: `agent_<number>` (e.g., `agent_42`).

---

## State Logic vs State Actor

| Concept | Scope | Keyword |
|---------|-------|---------|
| `state logic` | Shared — all callers read/write the same state | `endpoint deploy` |
| `state actor` | Per-caller isolated — each account has its own state | `endpoint enlist` |

See [State Models](../concepts/state-models.md) for details.

---

## Mnemonic

A 12-word BIP39 seed phrase used to derive a wallet.

- Store in `.env` as `MOI_MNEMONIC`
- Never commit to git

---

## Derivation Path

BIP44 path for key generation from a mnemonic.

| Path | Used by |
|------|---------|
| `m/44'/6174'/7020'/0/0` | Voyage faucet wallet (default for webinar demos) |
| `m/44'/6174'/0'/0/0` | SDK default |

---

## OpenClaw

An AI-agent framework where an LLM-powered chat can invoke registered **skills** (Node.js scripts). Used in Session 3.

---

## See Also

- [What Is MOI?](what-is-moi.md)
- [SDK Quick Start](sdk-quick-start.md)
- [Glossary](../glossary/terms.md)
