# Uploader — Agent Card Upload Service

## What Is `uploader.mjs`?

`uploader.mjs` is a minimal HTTP server that accepts agent card JSON and returns a **data: URI** encoding of it. The URI is then stored on-chain by `register.mjs` as the `card_uri`.

Located at: `session-3/moi-agent-dating/scripts/uploader.mjs`

---

## Why Is It Needed?

The Agent Registry stores a `card_uri` (not the card content directly). The URI must point to the card JSON. In production this would be an IPFS pin or S3 URL. For the demo, `uploader.mjs` encodes cards as `data:` URIs — self-contained, no external dependency.

---

## API

### `POST /` (any body)

**Request body:** Agent card JSON

**Response:**

```json
{
  "uri": "data:application/json;base64,eyJuYW1lIjoiSmFjayIsInZlcnNpb24iOiIxLjAuMCJ9..."
}
```

The returned `uri` is passed to `AgentRegistry.createAgent()` as the `card_uri`.

---

## Starting the Uploader

```bash
# Default port 7777
node session-3/moi-agent-dating/scripts/uploader.mjs &

# Custom port
PORT=8080 node session-3/moi-agent-dating/scripts/uploader.mjs &
```

Or use `./start-demo.sh` to start all three services together.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `7777` | Port to listen on |

---

## Configuring `UPLOADER_URL`

`register.mjs` reads `UPLOADER_URL` from env:

```dotenv
UPLOADER_URL=http://localhost:7777
```

If the uploader is not running when `register.mjs` executes:

```
Error: UPLOADER_URL=http://localhost:7777 unreachable — ECONNREFUSED
```

---

## Logs

When started via `./start-demo.sh`, logs go to:

```
/tmp/uploader.log
```

View live:

```bash
tail -F /tmp/uploader.log
```

---

## Testing the Uploader

```bash
curl http://localhost:7777 -X POST \
  -H 'Content-Type: application/json' \
  -d '{"name":"TestAgent","version":"1.0.0"}'

# Expected response:
# {"uri":"data:application/json;base64,..."}
```

---

## Production Alternative

In production, replace `uploader.mjs` with a service that:

- Pins the card JSON to IPFS and returns the `ipfs://...` URI
- Uploads to S3/GCS and returns a `https://...` URL
- Uses any other persistent, publicly accessible storage

The interface (POST → `{ uri }`) remains the same, so `register.mjs` works unchanged.

---

## See Also

- [Agent Registry](agent-registry.md)
- [Message Server](message-server.md)
- [Jack & Jill Demo](jack-and-jill.md)
- [Session 3 Troubleshooting](troubleshooting.md)
