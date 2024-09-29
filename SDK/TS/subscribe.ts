import { Connection, PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
//import idl from './path_to_your_idl.json';

// Initialize connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const programId = new PublicKey('YOUR_PROGRAM_ID');

// Function to subscribe
async function subscribe(userPublicKey: PublicKey, plan: string, paymentAmount: number, durationInDays: number): Promise<void> {
    const provider = Provider.local(connection);
    const program = new Program(idl, programId, provider);

    // A new Keypair for the subscription account
    const subscriptionAccount = Keypair.generate();

    // Calling the subscribe method in the Rust contract
    const tx = await program.methods
        .subscribe(plan, paymentAmount, durationInDays) // Calling the Rust function
        .accounts({
            subscriptionAccount: subscriptionAccount.publicKey, // Account to be initialized
            user: userPublicKey, // User's public key
            systemProgram: SystemProgram.programId, // System program for account creation
        })
        .signers([subscriptionAccount]) // Sign the transaction with the new subscription account
        .rpc(); // Send the transaction

    console.log('Subscription successful! Transaction signature:', tx);
}

// Exporting the subscribe function
export { subscribe };
