# Common Errors Master Catalogue

A comprehensive list of common errors encountered across all webinar sessions.

---

## 1. `account not found`

**Error:** `account not found from devnet RPC`

**Cause:**
- Wallet address derived from mnemonic is not funded.
- Derivation path mismatch (wallet was created with a different path).

**Fix:**
1. Fund the wallet: Visit <https://voyage.moi.technology>, create or import wallet, use faucet.
2. If funded but still failing, try alternate derivation path: `MOI_DERIVATION_PATH=m/44'/6174'/0'/0/0` in `.env`.
3. Verify address in Voyage before running scripts.

---

## 2. `logic not found` / `invalid logic id`

**Error:** `logic not found` when invoking `Flip` or `Mode`

**Cause:**
- Typed Logic ID wrong into `.env`
- Copied partial hash or interaction hash instead of Logic ID
- Logic deploy failed (check interaction hash in Voyage)

**Fix:**
1. Re-run deploy: `node sdk/deploy.js`
2. Copy the exact string after `Logic ID :` (include `0x` prefix)
3. Paste into `.env`: `LOGIC_ID=0x...`

---

## 3. `no private key found`

**Error:** `no private key found` or wallet construction fails

**Cause:**
- Invalid mnemonic (wrong word count, misspelled, not BIP39)
- Mnemonic contains special characters or extra spaces

**Fix:**
- Verify mnemonic: Should be exactly 12 words, separated by single spaces
- Re-copy from source and paste carefully into `.env`

---

## 4. `openclaw is not recognized`

**Error:** `command not found: openclaw`

**Cause:** OpenClaw is not installed or not in PATH.

**Fix:**
- Install OpenClaw: Follow docs at <https://docs.openclaw.ai>
- Verify: `openclaw --version`

---

## 5. `UPLOADER_URL unreachable`

**Error:** `UPLOADER_URL=http://localhost:7777 unreachable — <error>`

**Cause:** Uploader service is not running or listening on the wrong port.

**Fix:**
- Start uploader: `cd session-3/moi-agent-dating/scripts && node uploader.mjs`
- Or start all services: `./start-demo.sh`

---

## 6. Skill not `Ready`

**Error:** `moi-agent-dating` status shows `✗ Not Ready` instead of `✓ Ready`

**Cause:** OpenClaw cannot find required env vars (`MOI_MNEMONIC`) in the profile config.

**Fix:**
- Edit OpenClaw profile: `~/.openclaw/openclaw.json` (default) or `~/.openclaw-<profile>/openclaw.json`
- Add `env.vars.MOI_MNEMONIC` with your funded mnemonic.

---

## 7. `npm install` issues

**Error:** `npm ERR!` or `Cannot find module 'js-moi-sdk'`

**Cause:**
- `npm install` not run in session directory
- Outdated npm or Node.js version (< 20)
- Corrupted `node_modules` or `package-lock.json`

**Fix:**
1. Ensure Node.js 20+: `node --version`
2. Ensure you're in the right directory: `session-1`, `session-2`, or `session-3`
3. Run: `npm install`

---

## 8. Agent not visible on explorer

**Error:** Agent registered successfully but not showing on <https://agents.moi.technology>

**Cause:**
- Explorer is lagging behind on-chain state (indexing delay)
- Agent status is not ACTIVE
- Wrong agent ID copied

**Fix:**
- Wait 1–2 minutes for explorer to catch up
- Verify agent exists with: `node discover.mjs` (should print the `agent_id`)
- Paste the exact agent ID from discover output into the explorer

---

## 9. `balanceOf` returns `undefined`

**Error:** `balanceOf()` returns `undefined` or `null`

**Cause:**
- Used `.send()` instead of `.call()` on the read-only operation
- Balance has not been minted yet (zero balance returns 0, not undefined)

**Fix:**
- Ensure using `.call()` not `.send()`: `const response = await asset.balanceOf(...).call()`

---

## 10. Key path already exists

**Error:** When trying to create a wallet that already exists

**Cause:** OpenClaw or wallet tool trying to derive a new key on a path that's already registered.

**Fix:**
- Use a different derivation path: `MOI_DERIVATION_PATH=m/44'/6174'/7020'/0/1` (increment the last segment)
- Or use existing wallet if path already has funds.
