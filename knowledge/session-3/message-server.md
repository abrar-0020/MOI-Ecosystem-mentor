# Message Server — Agent Inbox HTTP Service

## What Is `message-server.mjs`?

`message-server.mjs` is a lightweight HTTP server that acts as an agent's **message inbox**. Other agents POST messages to it; it replies either via an LLM or in echo-fallback mode.

Located at: `session-3/moi-agent-dating/scripts/message-server.mjs`

---

## API

### `POST /message`

**Request body:**

```json
{
  "from": "0x<sender-wallet-address>",
  "text": "hello from an OpenClaw agent on MOI"
}
```

**Response (LLM mode):**

```json
{
  "reply": "Hi there! I'm Jack, happy to chat..."
}
```

**Response (echo-fallback mode, no `OPENAI_API_KEY`):**

```json
{
  "reply": "[echo] hello from an OpenClaw agent on MOI"
}
```

---

## Starting the Server

```bash
# Jack's server on port 3940
AGENT_NAME=Jack PORT=3940 node message-server.mjs &

# Jill's server on port 3941
AGENT_NAME=Jill PORT=3941 node message-server.mjs &
```

Or use `./start-demo.sh` to start all services at once — see [Jack & Jill Demo](jack-and-jill.md).

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3940` | Port to listen on |
| `AGENT_NAME` | `an OpenClaw agent` | Name used in log messages and LLM persona |
| `AGENT_PERSONA` | (built-in) | Full system prompt override for LLM |
| `OPENAI_API_KEY` | — | If unset, server falls back to echo mode |
| `OPENAI_MODEL` | `gpt-5.4-mini` | OpenAI model to use for replies |
| `LLM_TIMEOUT_MS` | `25000` | Max ms to wait for LLM response |

---

## LLM Mode vs Echo Mode

| | LLM Mode | Echo Mode |
|--|----------|-----------|
| Trigger | `OPENAI_API_KEY` is set | `OPENAI_API_KEY` not set |
| Reply quality | Intelligent, context-aware | Simple echo of the input |
| External dependency | OpenAI API | None |
| Suitable for demo | Yes (with API key) | Yes (fallback) |

---

## Logs

Each message is logged with a timestamp:

```
[Jack] Message from 0xabc... : hello from an OpenClaw agent on MOI
[Jack] Replying: Hi there! I'm Jack...
```

When started via `./start-demo.sh`, logs are written to:

```
/tmp/jack-msgserver.log
/tmp/jill-msgserver.log
```

View live:

```bash
tail -F /tmp/jack-msgserver.log
tail -F /tmp/jill-msgserver.log
```

---

## Integration with Agent Registry

The URL registered on-chain (via `register.mjs`) must match the message server's host + port:

```dotenv
AGENT_URL=http://localhost:3940   # Jack
AGENT_URL=http://localhost:3941   # Jill
```

If the registered URL is wrong, `say-hi.mjs` will fail to deliver messages even if the server is running.

---

## Common Issues

| Symptom | Fix |
|---------|-----|
| `say-hi.mjs` gets connection refused | Message server not running; start it with `./start-demo.sh` |
| LLM replies are echo only | Export `OPENAI_API_KEY` **before** starting the server |
| Wrong agent URL stored on-chain | Re-register with correct `AGENT_URL` in env |

---

## See Also

- [Uploader](uploader.md)
- [Agent Registry](agent-registry.md)
- [Jack & Jill Demo](jack-and-jill.md)
- [Session 3 Troubleshooting](troubleshooting.md)
