# Troubleshooting One-Liners

Quick diagnostic commands to run when things go wrong.

---

## 1. Test Multiple Derivation Paths
If you keep getting `account not found`, run this to brute-force test the two common derivation paths with your deployment script.

```bash
for path in "m/44'/6174'/7020'/0/0" "m/44'/6174'/0'/0/0"; do
  echo "Testing path: $path"
  MOI_DERIVATION_PATH="$path" node sdk/deploy.js
done
```

## 2. Locate OpenClaw Profiles
If changes to `openclaw.json` aren't doing anything, make sure you are editing the file in the correct external directory.

```bash
ls -la ~/.openclaw*/openclaw.json
```

## 3. Verify OpenClaw Skill Installation
Check if the `moi-agent-dating` skill is correctly installed and ready.

```bash
# Default profile
openclaw skills list | grep moi-agent-dating
openclaw skills info moi-agent-dating

# Named profile
openclaw --profile jack skills list
```

## 4. Check if Ports are in Use
If the background services fail to start, check if ports 7777, 3940, or 3941 are already occupied by zombie processes.

```bash
lsof -nP -iTCP:7777 -iTCP:3940 -iTCP:3941 -sTCP:LISTEN
```

## 5. Force Clean NPM Install
If you get weird `Cannot find module` errors despite running `npm install`.

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 6. Kill Runaway Session 3 Processes
If you need a clean slate for the Jack & Jill demo.

```bash
pkill -f 'moi-agent-dating'
```

## 7. Verify Mnemonic Word Count
If you suspect your mnemonic was copied incorrectly.

```bash
echo "$MOI_MNEMONIC" | wc -w
# Should output exactly 12
```
