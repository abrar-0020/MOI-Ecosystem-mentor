# Session 1 CLI Commands

Reference for all command-line operations used in Session 1 (Coco + Flipper).

---

## Compiling Coco Source

If you edit the `.coco` file, you must recompile to update the JSON manifest.

```bash
cd flipper
coco compile
coco manifest convert flipper.yaml -f json -o flipper.json
```
*(Same commands apply in the `context-flipper` directory)*

## CocoLab Interactive REPL

Start the in-memory Coco testing environment. Must be run from inside the Coco project directory.

```bash
cd flipper
coco lab init
```

## Setup Environment

Install dependencies and set up the `.env` file.

```bash
cd session-1
npm install
cp .env.example .env
# Remember to edit .env and set your MOI_MNEMONIC
```

## Running Scripts

Ensure your `.env` is configured and wallet is funded before running these.

**Deploy Flipper:**
```bash
node sdk/deploy.js
```
*(Outputs the Logic ID. Save this to `.env` as `LOGIC_ID=0x...`)*

**Invoke Dynamic Endpoint (Flip):**
Mutates state. Requires `LOGIC_ID` to be set in `.env` or passed as an argument.
```bash
node sdk/flip.js
# OR
node sdk/flip.js 0x<logic-id>
```

**Invoke Static Endpoint (Mode):**
Reads state. Free, no gas required.
```bash
node sdk/mode.js
# OR
node sdk/mode.js 0x<logic-id>
```

**Sneak Peek (Create Asset):**
Runs the preview of Session 2.
```bash
node sdk/asset.js
```
