# Session 1 Troubleshooting

Common errors encountered during Session 1 (Coco + SDK fundamentals).

---

## `MOI_MNEMONIC is not set`

**Cause:** `.env` file is missing, or the placeholder value was not replaced.

**Fix:**

```bash
cp .env.example .env
# Open .env and replace the placeholder with your real 12-word mnemonic
```

**Verify:**

```bash
echo $MOI_MNEMONIC  # should print 12 words
```

---

## `account not found`

**Cause 1:** Wallet address derived from the mnemonic is not funded on devnet.

**Fix:** Visit <https://voyage.moi.technology>, import/create the wallet, and use the faucet.

**Cause 2:** Derivation path mismatch — the script is deriving a different address than the funded one.

**Fix:** Try the alternate derivation path:

```dotenv
MOI_DERIVATION_PATH=m/44'/6174'/0'/0/0
```

---

## `logic not found` / `invalid logic id`

**Cause:**

- `LOGIC_ID` in `.env` is wrong or partial
- The interaction hash was copied instead of the Logic ID
- The deploy interaction itself failed

**Fix:**

1. Re-run: `node sdk/deploy.js`
2. Copy the exact string after `Logic ID       :` (including `0x` prefix)
3. Paste into `.env`:

```dotenv
LOGIC_ID=0x<exact-id-from-output>
```

4. Verify deploy on Voyage: paste the interaction hash and confirm status is finalized and `logic_id` field is present.

---

## `Mode returns null / undefined`

**Cause:** The wallet calling `mode.js` is different from the one that called `flip.js`. Since `values` is keyed by caller address, an unfamiliar address returns an unset entry.

**Fix:** Use the same wallet (same mnemonic + derivation path) for deploy, flip, and mode.

---

## Interaction times out

**Cause:** Devnet network latency or temporary downtime.

**Fix:**

1. Wait a few seconds, then `Ctrl+C` and retry.
2. Check if the Voyage explorer is responding at <https://voyage.moi.technology>.
3. Use the pre-recorded demo clip as a fallback for live presentations.

---

## `no private key found`

**Cause:** Invalid mnemonic — wrong word count, misspelled words, or not a valid BIP39 phrase.

**Fix:**

1. Count words: `echo "$MOI_MNEMONIC" | wc -w` — must output `12`
2. Re-copy from the original source carefully
3. Try importing into Voyage to confirm it's valid

---

## Cannot find module `js-moi-sdk`

**Cause:** `npm install` was not run in the `session-1` directory.

**Fix:**

```bash
cd session-1
npm install
```

If that still fails:

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## Changes to `.coco` Source Not Taking Effect

**Cause:** The pre-compiled `.json` manifest is used at runtime. Editing the `.coco` source alone does nothing.

**Fix:**

```bash
cd flipper
coco compile
coco manifest convert flipper.yaml -f json -o flipper.json
cd ..
node sdk/deploy.js   # re-deploy the updated logic
```

---

## Summary Table

| Symptom | Cause | Fix |
|---------|-------|-----|
| `MOI_MNEMONIC is not set` | Missing `.env` | `cp .env.example .env` |
| `account not found` | Not funded or wrong path | Fund wallet; try alternate derivation path |
| `logic not found` | Wrong `LOGIC_ID` | Re-deploy; copy exact Logic ID |
| `Mode()` returns null | Different wallet | Use same mnemonic for all scripts |
| Interaction timeout | Devnet down | Retry; check Voyage |
| `no private key found` | Bad mnemonic | Re-copy; validate word count |
| Module not found | `npm install` skipped | Run `npm install` in `session-1/` |
| Source edits ignored | Manifest not recompiled | Run `coco compile && coco manifest convert ...` |

---

## See Also

- [Deployment](deployment.md)
- [SDK patterns](sdk.md)
- [Common Errors (all sessions)](../troubleshooting/common-errors.md)
