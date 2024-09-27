import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SubscriptionContract } from "../target/types/subscription_contract";
import * as assert from "assert"; // Ensure that the assert library is imported

const { SystemProgram } = anchor.web3;

describe("Subscription Contract Test", () => {
  // Set up the provider and program reference
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SubscriptionContract as Program<SubscriptionContract>;

  it("should subscribe a user to a plan", async () => {
    try {
      // Generate a keypair for the new subscription account
      const subscriptionAccount = anchor.web3.Keypair.generate();

      // Set up the subscription details
      const plan = "premium_plan";
      const paymentAmount = new anchor.BN(1000); // Payment in lamports (BN type for big numbers)
      const durationInDays = new anchor.BN(30);  // Duration in days (BN type)

      // Send the transaction to subscribe the user
      const txHash = await program.methods
        .subscribe(plan, paymentAmount, durationInDays)
        .accounts({
          subscriptionAccount: subscriptionAccount.publicKey, // Subscription account to store data
          user: provider.wallet.publicKey, // The wallet sending the transaction
          // systemProgram: SystemProgram.programId,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([subscriptionAccount])
        .rpc();

      console.log(`Transaction hash: ${txHash}`);

      // Confirm the transaction
      await provider.connection.confirmTransaction(txHash);

      // Fetch the subscription account data
      const subscriptionAccountData = await program.account.subscriptionAccount.fetch(subscriptionAccount.publicKey);

      // Print the fetched data to the console
      console.log("Subscription Account Data:", {
        plan: subscriptionAccountData.plan,
        paymentAmount: subscriptionAccountData.paymentAmount.toString(),
        startDate: new Date(subscriptionAccountData.startDate.toNumber() * 1000),
        expiryDate: new Date(subscriptionAccountData.expiryDate.toNumber() * 1000),
      });

      // Assertions to verify the account data
      assert.strictEqual(subscriptionAccountData.plan, plan, "The subscription plan does not match");
      assert.strictEqual(subscriptionAccountData.paymentAmount.toString(), paymentAmount.toString(), "The payment amount does not match");
      assert.ok(subscriptionAccountData.startDate.toNumber() > 0, "The start date should be greater than 0");
      assert.ok(subscriptionAccountData.expiryDate.toNumber() > subscriptionAccountData.startDate.toNumber(), "The expiry date should be greater than the start date");

      // Check subscription status using the program's check_subscription_status function
      const isActive = await program.methods
        .checkSubscriptionStatus()
        .accounts({
          subscriptionAccount: subscriptionAccount.publicKey, // The same subscription account
        })
        .rpc();

      // Log the subscription status
      console.log("Is the subscription active?", isActive);
      assert.ok(isActive, "The subscription should be active");

    } catch (error) {
      console.error("Test failed:", error);
      throw error; // Rethrow the error so that Mocha reports the test as failed
    }
  });
});
