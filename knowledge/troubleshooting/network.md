# Network & Connectivity Troubleshooting

Issues relating to devnet timeouts, explorer lag, and RPC errors.

---

## Interaction Times Out

**Error:** Script hangs or `.result()` times out waiting for confirmation.

**Cause:**
- Devnet network latency or temporary downtime.
- Transaction is stuck in the mempool due to a nonce gap or network issue.

**Fix:**
1. Wait a few seconds, then `Ctrl+C` and retry the script.
2. Check devnet status: Try visiting <https://voyage.moi.technology> to see if the explorer is responding.
3. If repeated timeouts occur, check Discord or official docs for devnet maintenance windows.
4. For live demos, use pre-recorded demo clips as a fallback.

---

## Agent Not Visible on Explorer

**Error:** Agent registered successfully but not showing on <https://agents.moi.technology>

**Cause:**
- The explorer is lagging behind on-chain state (indexing delay).
- The agent status is not `ACTIVE`.
- You are searching for the wrong agent ID.

**Fix:**
1. Wait 1–2 minutes for the explorer to catch up.
2. Verify the agent exists by running `node discover.mjs` (it should print the `agent_id`).
3. Check the agent status in the discover output — it should show `[ACTIVE]`.
4. Paste the exact agent ID from the discover output into the explorer search bar.

---

## Asset Created But Not Visible on Voyage

**Error:** `asset.js` completes, but the asset is not shown on the wallet address in the explorer.

**Cause:**
- Indexing delay (Voyage can lag 1-2 minutes).
- You are searching by wallet address before the token has been indexed to that address.

**Fix:**
1. Paste the **Asset ID** directly into the Voyage search bar to confirm the asset itself exists.
2. Wait a few minutes and refresh the wallet address page.

---

## Connection Refused (Session 3)

**Error:** `UPLOADER_URL=http://localhost:7777 unreachable` or `say-hi` gets a connection refused error.

**Cause:** The background services (`uploader.mjs` or `message-server.mjs`) are not running, or are running on different ports than configured.

**Fix:**
1. Run `./start-demo.sh` to start all required services.
2. Ensure `AGENT_URL` points to the correct running message-server on the correct port.
3. Check if the port is in use: `lsof -nP -iTCP:7777 -sTCP:LISTEN`
