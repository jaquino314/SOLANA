// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const fromGenerateKey = new Uint8Array(
    [
        150, 242,  37,  32, 117, 237, 148,  38, 198, 186, 208,
        250, 217,  39, 126, 235, 131,  86,  65, 108,   4, 163,
        150, 100, 224,   5, 182, 112, 168, 145,  53,  16,  11,
        53, 250,  59,  56,  85, 216, 205, 241, 231, 186, 110,
        216,  73,  27, 115,  46, 218, 130, 223,   1, 182, 106,
        41,   5, 134, 111, 121, 154, 203,  84, 167
      ]            
);

/* // Get the wallet balance from a given keyPair
const getWalletBalance = async (keyPair, sender = true) => {
    try {
        // Connect to the Devnet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        // Get wallet balance
        // const selectedWallet = await Keypair.fromSecretKey(keyPair.secretKey);
        const walletBalance = await connection.getBalance(
            new PublicKey(keyPair.publicKey)
        );
        if (sender === true) {
            console.log(`FROM wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
        } else {
            console.log(`TO wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`); // 0.000000001 SOL
        }
    } catch (err) {
        console.log(err);
    }
}; */

const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(fromGenerateKey);

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

/*     // Print wallet balances before airdrop
    await getWalletBalance(from, sender = true);
    await getWalletBalance(to, sender = false); */

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    // Show wallet balances before transfer
    let fromBalance = await connection.getBalance(new PublicKey(from.publicKey));
    console.log("From Balance:", parseInt(fromBalance)/LAMPORTS_PER_SOL);

    let toBalance = await connection.getBalance(new PublicKey(to.publicKey))
    console.log("To Balance:", parseInt(toBalance)/LAMPORTS_PER_SOL);
    
    // Show amoount to be transferred
    let sendBal = (fromBalance)/2;
    console.log("Amt to be Tranferred:", parseInt(sendBal)/LAMPORTS_PER_SOL);


    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: sendBal
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is ', signature);

    // Updated balances after transfer
    fromBalance = await connection.getBalance(new PublicKey(from.publicKey));
    toBalance = await connection.getBalance(new PublicKey(to.publicKey))

    console.log("New From Balance:", parseInt(fromBalance)/LAMPORTS_PER_SOL);
    console.log("New To Balance:", parseInt(toBalance)/LAMPORTS_PER_SOL);

/*     // Print wallet balances after transfer
    await getWalletBalance(from);
    await getWalletBalance(to, sender = false);
*/

}

transferSol();
