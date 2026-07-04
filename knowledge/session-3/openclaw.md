# OpenClaw — AI Agent Framework

## What Is OpenClaw?

OpenClaw is a framework for building **LLM-powered AI agents**. An agent is a chat interface backed by a language model that can invoke registered **skills** (Node.js scripts or other executables) based on the user's natural-language request.

The LLM decides **when** to invoke a skill — the skill itself is deterministic code.

---

## moi-agent-dating Skill

`session-3/moi-agent-dating` is a JSON5 skill manifest that tells OpenClaw to run Node.js scripts when the user asks about MOI agent operations:

| User intent | Script invoked |
|-------------|----------------|
| "register me on the MOI agent registry" | `register.mjs` |
| "who is on the registry?" | `discover.mjs` |
| "say hi to agent_42" | `say-hi.mjs agent_42` |

---

## Installing the Skill

```bash
# Default profile
openclaw skills install ./session-3/moi-agent-dating

# Named profile
openclaw --profile jack skills install ./session-3/moi-agent-dating
openclaw --profile jill skills install ./session-3/moi-agent-dating
```

Verify:

```bash
openclaw skills info moi-agent-dating
# Expected: moi-agent-dating ✓ Ready
```

---

## OpenClaw Profile Configuration

OpenClaw stores profiles outside the repository:

| Profile | Path |
|---------|------|
| Default | `~/.openclaw/openclaw.json` |
| Named (`jack`) | `~/.openclaw-jack/openclaw.json` |
| Named (`jill`) | `~/.openclaw-jill/openclaw.json` |

> **Never commit profile files** — they contain mnemonics and API keys.

### Minimal `openclaw.json`

```json5
{
  env: {
    vars: {
      MOI_MNEMONIC: "your twelve word mnemonic",
      UPLOADER_URL: "http://localhost:7777",
      AGENT_NAME: "Jack",
      AGENT_URL: "http://localhost:3940",
      OPENAI_API_KEY: "sk-...",  // optional but required for LLM replies
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

---

## Starting a Chat Session

```bash
export OPENAI_API_KEY=sk-...   # required for LLM
openclaw --profile jack chat
```

Then type natural-language requests:

```
> register me on the MOI agent registry
> who is on the registry?
> say hi to agent_42
```

---

## Skill Readiness Check

If the skill is not `✓ Ready`:

1. Check `MOI_MNEMONIC` is set in `~/.openclaw*/openclaw.json` under `env.vars`
2. Re-run: `openclaw skills info moi-agent-dating`
3. Expected output: `moi-agent-dating ✓ Ready`

---

## Skill Invocation Flow

```
User types request
    ↓
LLM classifies intent
    ↓
OpenClaw selects skill (moi-agent-dating)
    ↓
OpenClaw runs Node.js script (register.mjs / discover.mjs / say-hi.mjs)
    ↓
Script output is returned to LLM
    ↓
LLM formats a natural-language response
    ↓
User sees the result
```

---

## Troubleshooting Skill Not Running

| Symptom | Fix |
|---------|-----|
| Skill not installed | Run `openclaw --profile <p> skills install ./session-3/moi-agent-dating` |
| Skill shows `✗ Not Ready` | Set `MOI_MNEMONIC` in `~/.openclaw*/openclaw.json` |
| LLM doesn't invoke skill | Rephrase: "register me on the MOI agent registry"; check skill info |
| Chat has no LLM responses | Export `OPENAI_API_KEY=sk-...` before running `openclaw chat` |

---

## See Also

- [Agent Registry](agent-registry.md)
- [Message Server](message-server.md)
- [Jack & Jill Demo](jack-and-jill.md)
- [Session 3 Troubleshooting](troubleshooting.md)
