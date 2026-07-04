# Environment Variable Troubleshooting

Problems related to `.env` files and environment configuration.

---

## `missing MOI_MNEMONIC`

**Error:** `missing required env var: MOI_MNEMONIC`

**Cause:**
- `.env` file missing or incomplete
- `MOI_MNEMONIC` not set in OpenClaw `openclaw.json`
- Script trying to read env but neither `.env` nor `openclaw.json` is configured

**Fix for Standalone Scripts:**
```bash
cp .env.example .env
# Open .env and replace the placeholder with your 12-word mnemonic
```

**Fix for OpenClaw:**
Set `MOI_MNEMONIC` in `~/.openclaw*/openclaw.json` under `env.vars`.

**Verification:**
```bash
echo $MOI_MNEMONIC
# Should print a non-empty string
```

---

## `MOI_MNEMONIC is not set`

**Symptom:** Scripts immediately exit complaining that the mnemonic is not set, even though a `.env` file exists.

**Cause:** The `.env` file still contains the template placeholder (e.g. `<your twelve word mnemonic>`).

**Fix:** Edit `.env` and replace the placeholder with the actual 12 words. Do not use quotes around the words unless the placeholder had them.

---

## Missing `LOGIC_ID` or `ASSET_ID`

**Symptom:** Scripts like `flip.js` or `mint.js` fail with missing arguments.

**Cause:** The script relies on the ID being present in `.env`, but it hasn't been added after deployment.

**Fix:**
1. Check the output of the deployment script (`deploy.js` or `asset.js`).
2. Copy the ID printed (starting with `0x`).
3. Add it to `.env`:
   ```dotenv
   LOGIC_ID=0x...
   ASSET_ID=0x...
   ```

---

## OpenClaw Profile Config Being Ignored

**Symptom:** Changes to `openclaw.json` inside the repository have no effect on OpenClaw behavior.

**Cause:** OpenClaw does not read profile config from the current working directory. It reads from `~/.openclaw/` (or `~/.openclaw-<profile>/`).

**Fix:**
Edit the correct configuration file outside the repository:
```bash
nano ~/.openclaw-jack/openclaw.json
```

---

## `OPENAI_API_KEY` Ignored in Demo

**Symptom:** The message servers in the Session 3 demo only return echo replies, even though `OPENAI_API_KEY` is set in `openclaw.json`.

**Cause:** The background services (`uploader`, `message-server`) started by `./start-demo.sh` do not read `openclaw.json`. They rely on shell environment variables.

**Fix:** Export the API key in the shell *before* running the script:
```bash
export OPENAI_API_KEY=sk-<your-key>
./start-demo.sh
```
