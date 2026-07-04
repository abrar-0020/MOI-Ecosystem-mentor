# Session 1: Practical Exercises

Once you understand Flipper and ContextFlipper, try these practical exercises to deepen your understanding of the Coco language and SDK.

---

## 1. Multi-User Shared State Test
1. Deploy `flipper.json` and note the `LOGIC_ID`.
2. Share the `LOGIC_ID` with a colleague (or use two different `.env` files with different mnemonics).
3. Have both users run `flip.js` using the same `LOGIC_ID`.
4. Run `mode.js`. Notice how the boolean changes for each user independently, but all data lives in the same shared `values Map[Identifier]Bool`.

## 2. Multi-User Actor Context Test
1. Deploy `context_flipper.json` and note the `LOGIC_ID`.
2. Run `flip.js` and `mode.js`.
3. Have a different wallet run `flip.js` on the same `LOGIC_ID`.
4. Observe that their operations do not conflict and are fully isolated into separate actor slots (`ContextFlipper.Sender.value`).

## 3. Build a Counter
Modify `flipper.coco`:
1. Change the state map to store numbers: `values Map[Identifier]U64`.
2. Change the `Flip()` endpoint to `Increment()` which adds `1` to the caller's map entry.
3. Change `Mode()` to `Read()` to return the integer.
4. Recompile with the Coco toolchain and deploy.

## 4. Add a Setter Endpoint
Modify `flipper.coco`:
1. Add a new endpoint: `endpoint dynamic Set(value Bool)`.
2. Write the logic to explicitly set `values[Sender] = value` instead of toggling it.
3. Recompile and write a custom Node.js script (like `flip.js`) that calls `.routines.Set(true).send()`.

## 5. Experiment with CocoLab
Start `coco lab init` inside the `flipper` folder. Try to reproduce the exact state mutations of Exercise 1 entirely locally inside the REPL without deploying to the blockchain.
