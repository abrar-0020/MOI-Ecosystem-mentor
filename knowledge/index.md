# MOI Ecosystem Knowledge Base — Index

This directory is the RAG-ready knowledge base for the MOI Ecosystem Mentor assistant.
Every file is focused on a single topic and kept under 1 500 words to aid semantic chunking.

---

## Overview

| File | Description |
|------|-------------|
| [overview/what-is-moi.md](overview/what-is-moi.md) | What MOI is, core philosophy, devnet info |
| [overview/core-concepts.md](overview/core-concepts.md) | Glossary of core terms: Wallet, Provider, Logic, Asset, Agent |
| [overview/sdk-quick-start.md](overview/sdk-quick-start.md) | Install, wire up wallet & provider, first interaction |

---

## Session 1 — Coco Language & SDK Fundamentals

| File | Description |
|------|-------------|
| [session-1/flipper.md](session-1/flipper.md) | Flipper shared-state contract: source, endpoints, usage |
| [session-1/context-flipper.md](session-1/context-flipper.md) | ContextFlipper actor-isolated contract |
| [session-1/deployment.md](session-1/deployment.md) | Deploy Coco logic with LogicFactory; save Logic ID |
| [session-1/sdk.md](session-1/sdk.md) | SDK patterns: Wallet, Provider, getLogicDriver, send vs call |
| [session-1/cocoLab.md](session-1/cocoLab.md) | CocoLab REPL — interactive Coco testing without on-chain deploy |
| [session-1/troubleshooting.md](session-1/troubleshooting.md) | Session 1 error reference |

---

## Session 2 — Native Assets

| File | Description |
|------|-------------|
| [session-2/mas0.md](session-2/mas0.md) | MAS0 standard — create, mint, verify |
| [session-2/taxtoken.md](session-2/taxtoken.md) | TaxToken: fee-on-transfer design & deployment |
| [session-2/assets.md](session-2/assets.md) | Asset IDs, treasury model, workflow comparison |
| [session-2/troubleshooting.md](session-2/troubleshooting.md) | Session 2 error reference |

---

## Session 3 — Agent Registry & OpenClaw

| File | Description |
|------|-------------|
| [session-3/agent-registry.md](session-3/agent-registry.md) | On-chain Agent Registry: register, discover, query |
| [session-3/openclaw.md](session-3/openclaw.md) | OpenClaw framework: skills, profiles, chat |
| [session-3/message-server.md](session-3/message-server.md) | message-server.mjs — HTTP inbox with LLM/echo replies |
| [session-3/uploader.md](session-3/uploader.md) | uploader.mjs — card upload shim (data: URI) |
| [session-3/jack-and-jill.md](session-3/jack-and-jill.md) | Jack & Jill multi-profile demo walkthrough |
| [session-3/troubleshooting.md](session-3/troubleshooting.md) | Session 3 error reference |

---

## Glossary

| File | Description |
|------|-------------|
| [glossary/terms.md](glossary/terms.md) | All MOI terminology A–Z |

---

## FAQ

| File | Description |
|------|-------------|
| [faq/general.md](faq/general.md) | General MOI & setup FAQs |
| [faq/coco-and-logic.md](faq/coco-and-logic.md) | Coco language & logic FAQs |
| [faq/assets.md](faq/assets.md) | Native asset FAQs |
| [faq/agents.md](faq/agents.md) | Agent Registry & OpenClaw FAQs |

---

## Troubleshooting

| File | Description |
|------|-------------|
| [troubleshooting/common-errors.md](troubleshooting/common-errors.md) | Master error catalogue with causes & fixes |
| [troubleshooting/environment.md](troubleshooting/environment.md) | Environment variable & .env problems |
| [troubleshooting/network.md](troubleshooting/network.md) | Devnet, provider, timeout issues |

---

## Concepts

| File | Description |
|------|-------------|
| [concepts/coco-language.md](concepts/coco-language.md) | Coco syntax deep-dive: state, endpoints, mutate/observe |
| [concepts/state-models.md](concepts/state-models.md) | state logic vs state actor — isolation explained |
| [concepts/interactions.md](concepts/interactions.md) | What an Interaction is; send, result, hash tracking |
| [concepts/wallets-and-derivation.md](concepts/wallets-and-derivation.md) | BIP39/BIP44 wallet derivation, path variants |

---

## SDK Reference

| File | Description |
|------|-------------|
| [sdk/voyage-provider.md](sdk/voyage-provider.md) | VoyageProvider setup & devnet connection |
| [sdk/wallet.md](sdk/wallet.md) | Wallet.fromMnemonic, connect, getIdentifier |
| [sdk/logic-factory.md](sdk/logic-factory.md) | LogicFactory — deploy new logic |
| [sdk/logic-driver.md](sdk/logic-driver.md) | getLogicDriver — invoke existing logic |
| [sdk/mas0-asset-logic.md](sdk/mas0-asset-logic.md) | MAS0AssetLogic.create, mint, balanceOf |
| [sdk/asset-factory.md](sdk/asset-factory.md) | AssetFactory — custom Coco asset deployment |
| [sdk/agent-registry-sdk.md](sdk/agent-registry-sdk.md) | AgentRegistry SDK — createAgent, listAgents |

---

## Commands

| File | Description |
|------|-------------|
| [commands/session-1.md](commands/session-1.md) | All Session 1 CLI commands |
| [commands/session-2.md](commands/session-2.md) | All Session 2 CLI commands |
| [commands/session-3.md](commands/session-3.md) | All Session 3 CLI commands |
| [commands/troubleshooting-oneliners.md](commands/troubleshooting-oneliners.md) | Diagnostic one-liners |

---

## Examples

| File | Description |
|------|-------------|
| [examples/deploy-flipper.md](examples/deploy-flipper.md) | Full deploy + flip + mode example |
| [examples/create-mint-asset.md](examples/create-mint-asset.md) | Create MAS0 asset and mint tokens |
| [examples/register-agent.md](examples/register-agent.md) | Register agent from Node.js directly |
| [examples/agent-communication.md](examples/agent-communication.md) | Discover agents and send a message |

---

## Project Ideas

| File | Description |
|------|-------------|
| [project-ideas/session-1-exercises.md](project-ideas/session-1-exercises.md) | Practical Session 1 extension exercises |
| [project-ideas/session-2-exercises.md](project-ideas/session-2-exercises.md) | Practical Session 2 extension exercises |
| [project-ideas/session-3-exercises.md](project-ideas/session-3-exercises.md) | Practical Session 3 extension exercises |
