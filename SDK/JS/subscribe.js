const { Connection, PublicKey, clusterApiUrl,SystemProgram } = require('@solana/web3.js');

const { Program, Provider, web3 } = require('@project-serum/anchor');

const idl = require('./path_to_your_idl.json');

// Initialize connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

const programId = new PublicKey('YOUR_PROGRAM_ID');


// Function to subscribe
async function subscribe(userPublicKey, plan, paymentAmount, durationInDays) {
    // Logic to interact with the Rust contract

    const provider = Provider.local(connection);
    const program = new Program(idl, programId, provider);

 //A new Keypair for the subscription account

 const subscriptionAccount = web3.Keypair.generate();


 //calling  the subscribe method in the Rust contract

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


//exporting the subscribe function
module.exports = { subscribe };
