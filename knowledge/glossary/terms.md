# Glossary of Terms

A–Z reference for all terminology used in the MOI ecosystem.

---

## Agent

An autonomous entity. In the context of OpenClaw, it's an LLM-powered chat interface that can invoke registered skills. On the MOI network, it's a registered profile in the Agent Registry.

## Agent Card

A JSON document containing agent metadata: name, description, version, URL, capabilities, and skills. It is uploaded to a URI service and referenced on-chain.

## Agent ID

Identifier assigned by the registry upon successful registration. Format: `agent_<number>` (e.g., `agent_42`).

## Agent Registry

An on-chain contract storing agent metadata. Agents register via `AgentRegistry.createAgent()` and are discoverable via read-only queries.

## Asset

A native on-chain fungible token. Supported standards include MAS0 (no custom logic) and Custom (Coco-based logic, e.g., TaxToken).

## Asset ID

Unique identifier for a native asset. Format: `0x<hex>`. Used to instantiate `MAS0AssetLogic(assetId, wallet)`.

## Coco / Cocolang

The native smart contract language for the MOI blockchain. Compiled to JSON manifests that are deployed on-chain.

## CocoLab

An interactive REPL for testing Coco logic locally (in-memory) without deploying to the blockchain.

## ContextFlipper

An example Coco smart contract demonstrating actor-context (per-caller isolated state). See [State Models](../concepts/state-models.md).

## Derivation Path

BIP44 path for key generation from a mnemonic. E.g., `m/44'/6174'/7020'/0/0` (Voyage faucet) or `m/44'/6174'/0'/0/0` (SDK default).

## Devnet

The public MOI developer network. Accessible via <https://voyage.moi.technology>. All interactions are confirmed on-chain here.

## Endpoint

A function defined in a Coco smart contract. Types include:
- `deploy`: initialises state logic
- `enlist`: initialises state actor
- `dynamic`: mutates state (costs gas)
- `static`: reads state (free)

## Fee-on-transfer

An automatic tax mechanism on token transfers, demonstrated by `TaxToken`. E.g., a 5% fee is deducted from the transfer amount and sent to a treasury.

## Flipper

An example Coco smart contract demonstrating shared mutable state. See [State Models](../concepts/state-models.md).

## Interaction

A signed transaction sent to MOI devnet. Mutating operations (deploy, send) produce an interaction.

## Interaction Hash

The transaction ID returned by `.send()`. Used to track confirmation status on the Voyage explorer.

## Logic (Smart Contract)

A compiled Coco manifest deployed to MOI. It stores on-chain state and exposes endpoints.

## Logic ID

A unique on-chain identifier for a deployed Coco logic. Format: `0x<hex>`.

## MAS0

MOI's standard for fungible assets. It requires no custom logic — just a symbol, supply, manager address, and enableEvents flag.

## Message Server

An HTTP inbox service that accepts POST requests for agent-to-agent communication. Can reply via LLM or echo-mode.

## Mnemonic

A 12-word BIP39 seed phrase used to derive a wallet. Never commit this to source control.

## OpenClaw

A framework for building LLM-powered AI agents that can invoke skills (Node.js scripts).

## Profile (OpenClaw)

Configuration for an OpenClaw agent, stored in `~/.openclaw/openclaw.json`. Contains env vars (mnemonic, API keys).

## Skill

A registered capability for an OpenClaw agent, backed by executable code (e.g., a Node.js script). Example: `moi-agent-dating`.

## State Actor

Per-actor isolated state in Coco. Each caller has their own separate state slot on-chain.

## State Logic

Shared state in Coco. All callers read from and write to the same state on-chain.

## TaxToken

A custom Cocolang asset that collects a percentage of every transfer as a fee, routing it to a treasury address.

## Treasury

An address that collects fees from custom asset transfers (e.g., TaxToken). Set at deploy time.

## Uploader

A service that accepts agent card JSON and returns a URI. In demo scenarios, it returns a `data:` URI; in production, IPFS or S3.

## VoyageProvider

The RPC provider for MOI devnet. Connects the SDK to `https://voyage.moi.technology`.

## Wallet

Derived from a 12-word mnemonic and derivation path. Manages signing and account identity.
