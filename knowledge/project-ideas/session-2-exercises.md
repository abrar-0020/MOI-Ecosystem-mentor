# Session 2: Practical Exercises

Try these exercises to master native asset creation and custom asset logic on MOI.

---

## 1. Batch Asset Creation
Modify `sdk/asset.js` to create an array of assets in a loop (e.g., GOLD, SILVER, BRONZE) with different supply limits. Write a script that checks the balance of all three assets for your wallet.

## 2. Implement a Burn Endpoint
1. Modify the `taxtoken.coco` source code.
2. Add an `endpoint dynamic Burn(amount U64)` that reduces the `total_supply` and removes tokens from the treasury's balance.
3. Recompile and deploy the modified logic.

## 3. Variable Tax Rates
1. Deploy two separate instances of `taxtoken.json` using `tax-deploy.js`.
2. For the first instance, pass `500` (5%) as the bps argument.
3. For the second instance, pass `1000` (10%) as the bps argument.
4. Mint tokens for both and perform transfers to verify the different fee deductions.

## 4. End-to-End Treasury Verification
Write a comprehensive test script that:
1. Deploys TaxToken.
2. Mints 100,000 tokens to Wallet A.
3. Transfers 50,000 tokens from Wallet A to Wallet B.
4. Queries the balance of the Treasury address and uses an assertion to prove it received exactly 2,500 tokens (assuming a 5% fee).

## 5. Token Faucet Contract
Write a completely new Coco smart contract that acts as a faucet.
- It holds a balance of a specific Asset ID.
- It has a `dynamic Claim()` endpoint that transfers exactly 100 tokens to the `Sender`.
- *Challenge:* Keep track of who has claimed so they cannot claim twice.
