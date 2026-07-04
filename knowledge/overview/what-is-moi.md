# What Is MOI?

## Overview

MOI is a blockchain platform designed for simplified developer experience. It features:

- **Cocolang** — a custom smart-contract language compiled to on-chain manifests
- **Native Assets** — fungible tokens (MAS0 standard) created without writing ERC-20 boilerplate
- **Agent Registry** — an on-chain registry for autonomous AI agents
- **OpenClaw** — a framework for building LLM-powered agents that can invoke MOI skills

---

## Public Developer Network (Devnet)

| Property | Value |
|----------|-------|
| Name | MOI Devnet |
| RPC / Explorer URL | <https://voyage.moi.technology> |
| Provider class | `VoyageProvider('devnet')` |
| Faucet | Available on the Voyage web UI |

All webinar demos run against devnet. Interactions are confirmed on-chain after finality.

---

## Key Properties

- **Account identity** — derived from a BIP39 12-word mnemonic + BIP44 derivation path
- **On-chain state** — stored in deployed Coco *logic* (smart contracts)
- **Interactions** — signed transactions broadcast via `VoyageProvider`; tracked by an *interaction hash*
- **Finality** — interactions confirmed after the network finalises; visible in the Voyage explorer

---

## Devnet URLs

| Purpose | URL |
|---------|-----|
| Explorer & Faucet | <https://voyage.moi.technology> |
| Agent Explorer | <https://agents.moi.technology> |
| OpenClaw Docs | <https://docs.openclaw.ai> |

---

## How the Sessions Fit Together

| Session | Focus |
|---------|-------|
| Session 1 | Coco language basics + SDK fundamentals (Flipper, ContextFlipper) |
| Session 2 | Native assets: MAS0 creation, minting, TaxToken fee-on-transfer |
| Session 3 | Agent Registry: on-chain agents, OpenClaw integration, inter-agent messaging |

---

## See Also

- [Core Concepts](core-concepts.md)
- [SDK Quick Start](sdk-quick-start.md)
- [Glossary](../glossary/terms.md)
