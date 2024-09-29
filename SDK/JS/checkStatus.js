const { Connection, PublicKey } = require('@solana/web3.js');
const { Program, Provider } = require('@project-serum/anchor');

// Function to check subscription status(check this abdulhaleem:assumming wallet has been called somewhere in the contract)

async function checkSubscriptionStatus(subscriptionAccountPublicKey) {

    // Initialize the connection to the Solana cluster
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    // Create a provider to interact with the program
    const provider = Provider.local(connection);

    // Load the IDL (Interface Definition Language)
    const idl = await Program.fetchIdl("subscription_contract", provider);

    // Create an instance of the program
    const program = new Program(idl, "YOUR_PROGRAM_ID_HERE", provider);

    try {
        // Fetch the subscription account using the public key
        
        const subscriptionAccount = await program.account.subscriptionAccount.fetch(subscriptionAccountPublicKey);
        
        // Get the current timestamp
        const currentTimestamp = Math.floor(Date.now() / 1000);

        // Check if the subscription is still active
        const isActive = currentTimestamp < subscriptionAccount.expiryDate;

        return isActive;  // Return true if active, false otherwise
    } catch (error) {
        console.error("Failed to fetch subscription status:", error);
        throw new Error("Could not retrieve subscription status.");
    }
}

module.exports = checkSubscriptionStatus;
