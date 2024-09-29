import { Connection, PublicKey } from '@solana/web3.js';
import { Program, Provider, Idl } from '@project-serum/anchor';

// Function to check subscription status
async function checkSubscriptionStatus(subscriptionAccountPublicKey: PublicKey): Promise<boolean> {
    // Initialize the connection to the Solana cluster
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    // Create a provider to interact with the program
    const provider = Provider.local(connection);

    // Load the IDL (Interface Definition Language)
    const idl: Idl | null = await Program.fetchIdl("subscription_contract", provider);
    if (!idl) {
        throw new Error("IDL not found");
    }

    // Create an instance of the program
    const program = new Program(idl, "YOUR_PROGRAM_ID_HERE", provider);

    try {
        // Fetch the subscription account using the public key
        const subscriptionAccountData = await program.account.subscriptionAccount.fetch(subscriptionAccountPublicKey);

        // Get the current timestamp
        const currentTimestamp = Math.floor(Date.now() / 1000);

        // Check if the subscription is still active
        const isActive = currentTimestamp < subscriptionAccountData.expiryDate;

        return isActive;  // Return true if active, false otherwise
    } catch (error) {
        console.error("Failed to fetch subscription status:", error);
        throw new Error("Could not retrieve subscription status.");
    }
}

export default checkSubscriptionStatus;
