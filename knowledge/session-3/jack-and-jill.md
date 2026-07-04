# Jack & Jill — Multi-Profile Agent Demo

## Overview

The Jack & Jill demo runs **two OpenClaw agents** (Jack and Jill) simultaneously, each with their own profile and message server. They register on the MOI Agent Registry, discover each other, and exchange messages — all triggered by natural-language commands in their respective chat sessions.

---

## Architecture

```
OpenClaw (--profile jack)              OpenClaw (--profile jill)
      ↓ chat commands                        ↓ chat commands
  register.mjs                           register.mjs
  discover.mjs                           discover.mjs
  say-hi.mjs agent_<jill>               say-hi.mjs agent_<jack>
      ↓                                       ↓
  POST /message → :3941                  POST /message → :3940
      ↓                                       ↓
  Jill's message-server                  Jack's message-server
      ↓                                       ↓
   LLM or echo reply                      LLM or echo reply
```

All four processes (uploader + 2 message servers + 2 OpenClaw sessions) use the **same** `MOI_MNEMONIC` by default.

---

## Step 1 — Start Background Services

```bash
cd session-3/moi-agent-dating/scripts
./start-demo.sh
```

`./start-demo.sh` does:

1. Kills any prior instances on ports `7777`, `3940`, `3941`
2. Starts `uploader.mjs` on `:7777` → logs: `/tmp/uploader.log`
3. Starts `message-server.mjs` for Jack on `:3940` → logs: `/tmp/jack-msgserver.log`
4. Starts `message-server.mjs` for Jill on `:3941` → logs: `/tmp/jill-msgserver.log`
5. Verifies all three are listening
6. Prints stop commands and log file locations

---

## Step 2 — Install Skill into Each Profile

```bash
openclaw --profile jack skills install ./session-3/moi-agent-dating
openclaw --profile jill skills install ./session-3/moi-agent-dating
```

---

## Step 3 — Configure Each Profile

Edit `~/.openclaw-jack/openclaw.json`:

```json5
{
  env: {
    vars: {
      MOI_MNEMONIC: "your twelve word mnemonic",
      UPLOADER_URL: "http://localhost:7777",
      AGENT_NAME: "Jack",
      AGENT_URL: "http://localhost:3940",
      OPENAI_API_KEY: "sk-...",
    },
  },
  models: {
    providers: {
      openai: {
        apiKey: { source: "env", id: "OPENAI_API_KEY" },
      },
    },
  },
}
```

Edit `~/.openclaw-jill/openclaw.json`:

```json5
{
  env: {
    vars: {
      MOI_MNEMONIC: "your twelve word mnemonic",  // same wallet is fine
      UPLOADER_URL: "http://localhost:7777",
      AGENT_NAME: "Jill",
      AGENT_URL: "http://localhost:3941",          // different port
      OPENAI_API_KEY: "sk-...",
    },
  },
}
```

> Using the same mnemonic for both profiles is fine — each agent registration still gets a unique `agent_id`.

---

## Step 4 — Open Two Chat Windows

Terminal 1 (Jack):

```bash
export OPENAI_API_KEY=sk-...
openclaw --profile jack chat
```

Terminal 2 (Jill):

```bash
export OPENAI_API_KEY=sk-...
openclaw --profile jill chat
```

---

## Step 5 — Run the Demo

In Jack's chat:

```
> register me on the MOI agent registry
  → Prints: agent_id = agent_1

> who is on the registry?
  → Lists all registered agents

> say hi to agent_2
  → POSTs to Jill's message server on :3941
  → Prints Jill's reply
```

In Jill's chat:

```
> register me on the MOI agent registry
  → Prints: agent_id = agent_2

> say hi to agent_1
  → POSTs to Jack's message server on :3940
  → Prints Jack's reply
```

---

## Stopping Services

```bash
pkill -f 'moi-agent-dating/scripts/uploader.mjs'
pkill -f 'moi-agent-dating/scripts/message-server.mjs'

# Or kill everything:
pkill -f 'moi-agent-dating'
```

---

## Viewing Logs

```bash
tail -F /tmp/uploader.log
tail -F /tmp/jack-msgserver.log
tail -F /tmp/jill-msgserver.log
```

---

## Common Issues

| Symptom | Fix |
|---------|-----|
| `UPLOADER_URL unreachable` | Run `./start-demo.sh` first |
| `say-hi` gets connection refused | Ensure message server is running on the correct port |
| Jill can't receive Jack's message | Confirm Jill's `AGENT_URL` is `:3941` (not `:3940`) |
| LLM replies are echo | Export `OPENAI_API_KEY` **before** `./start-demo.sh` |
| Both agents same `agent_id` | Not possible — registry assigns unique IDs; check `discover.mjs` output |

---

## See Also

- [OpenClaw](openclaw.md)
- [Agent Registry](agent-registry.md)
- [Message Server](message-server.md)
- [Uploader](uploader.md)
- [Session 3 Troubleshooting](troubleshooting.md)
