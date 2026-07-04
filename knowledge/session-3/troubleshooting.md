# Session 3 Troubleshooting

Common errors encountered during Session 3 (Agent Registry + OpenClaw).

---

## `openclaw is not recognized` / `command not found`

**Cause:** OpenClaw is not installed or not in PATH.

**Fix:**

```bash
# Install OpenClaw (follow official docs)
# https://docs.openclaw.ai

# Verify after install
openclaw --version
```

---

## Skill Not `✓ Ready`

**Symptom:** `openclaw skills info moi-agent-dating` shows `✗ Not Ready`.

**Cause:** `MOI_MNEMONIC` is not set in the OpenClaw profile config.

**Fix:**

Edit `~/.openclaw/openclaw.json` (or `~/.openclaw-<profile>/openclaw.json`):

```json5
{
  env: {
    vars: {
      MOI_MNEMONIC: "your twelve word mnemonic",
    },
  },
}
```

Then re-check:

```bash
openclaw skills info moi-agent-dating
# Should show: moi-agent-dating ✓ Ready
```

---

## OpenClaw Doesn't Invoke the Skill

**Cause:** Skill not installed, or LLM didn't recognise the request phrasing.

**Fix:**

```bash
# Install skill
openclaw --profile <profile> skills install /path/to/session-3/moi-agent-dating

# Verify
openclaw skills info moi-agent-dating
```

Try rephrasing: `"please register me on the MOI agent registry"` or `"register me on the MOI registry"`.

---

## `UPLOADER_URL unreachable`

**Symptom:**

```
Error: UPLOADER_URL=http://localhost:7777 unreachable — ECONNREFUSED
```

**Cause:** Uploader service is not running.

**Fix:**

```bash
cd session-3/moi-agent-dating/scripts
./start-demo.sh
# Or manually:
node uploader.mjs &
```

Verify it's listening:

```bash
curl http://localhost:7777 -X POST -H 'Content-Type: application/json' -d '{}'
```

---

## `account not found`

**Cause:**

- Wallet not funded on devnet
- Derivation path mismatch

**Fix:**

- Fund via faucet: <https://voyage.moi.technology>
- Try alternate path:

```dotenv
MOI_DERIVATION_PATH=m/44'/6174'/0'/0/0
```

---

## Registration Succeeds But `say-hi` Fails

**Cause:** `AGENT_URL` registered on-chain doesn't match the running message server's port.

**Fix:**

1. Check the registered URL: `node discover.mjs`
2. Ensure `AGENT_URL` in env matches the running message server port
3. Re-register (which replaces the URL): `node register.mjs`

---

## Agent Not Visible on Explorer

**Symptom:** Registered successfully but not shown on <https://agents.moi.technology>.

**Fix:**

1. Wait 1–2 minutes for indexing
2. Verify with: `node discover.mjs` (should show your `agent_id`)
3. Confirm status is `ACTIVE` in discover output
4. Paste exact `agent_id` from discover into the explorer

---

## LLM Replies Are Echo Only

**Cause:** `OPENAI_API_KEY` not set when message server started.

**Fix:**

```bash
export OPENAI_API_KEY=sk-<your-key>
# THEN start the servers:
./start-demo.sh
```

Setting the key in `openclaw.json` alone does **not** affect the message-server processes started by `./start-demo.sh`.

---

## Interaction Times Out

**Cause:** Devnet latency or temporary downtime.

**Fix:**

1. Retry after a few seconds
2. Check Voyage explorer is loading: <https://voyage.moi.technology>
3. Use pre-recorded demo clip as a fallback

---

## Summary Table

| Symptom | Cause | Fix |
|---------|-------|-----|
| `openclaw` not found | Not installed | Install from docs.openclaw.ai |
| Skill `✗ Not Ready` | Missing `MOI_MNEMONIC` in profile | Set in `~/.openclaw*/openclaw.json` |
| Skill not invoked | Not installed / phrasing | Install; rephrase request |
| `UPLOADER_URL unreachable` | Uploader not running | `./start-demo.sh` |
| `account not found` | Not funded or wrong path | Fund; try alternate derivation path |
| `say-hi` connection refused | Message server not running | `./start-demo.sh` |
| Wrong URL stored on-chain | `AGENT_URL` mismatch | Fix env; re-register |
| Agent not on explorer | Indexing lag | Wait; check `discover.mjs` |
| Echo-only replies | `OPENAI_API_KEY` not exported before `start-demo.sh` | Export key first, restart services |

---

## See Also

- [Agent Registry](agent-registry.md)
- [OpenClaw](openclaw.md)
- [Jack & Jill Demo](jack-and-jill.md)
- [Common Errors (all sessions)](../troubleshooting/common-errors.md)
