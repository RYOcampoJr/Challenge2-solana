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

//created new secret key by using 
//const newPair = Keypair.generate()
//console.log(newPair)
const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        86, 128, 206, 189, 152, 164, 105, 186, 191, 160,  54,
       90, 197, 211, 174,  49,  86, 183, 124,  15, 206,  72,
      149, 251,  76, 109, 228, 170, 153,  31, 191, 155,  46,
      252, 160, 183,  23,  45, 209,  71, 155, 132,  81, 111,
      197, 167, 129, 101, 186, 154,  32,  40, 115,  28,  71,
      118,  22, 169, 147, 119,  53,   3,  31, 119
      ]            
);

const getWalletBalance = async (keyPair, sender = true) => {
    try {
        // Devnet request for connection
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        // Get the generated secret kepair and get the wallet/public key
        const myWallet = await Keypair.fromSecretKey(keyPair.secretKey);
        const walletBalance = await connection.getBalance(
            new PublicKey(keyPair.publicKey)
        );
        //if there is a value for wallet address/public key, then sender wallet or "from" wallet will send to receiver or "to" wallet.
        sender === true ? console.log(`from Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`) : console.log(`to Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`); // 0.000000001 SOL
    } catch (err) {
        console.log(err);
    }
};

const transferSol = async () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
 
    // Get permission by getting the Keypair from our own generated key
    const from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

        // Generating another keypair to get the wallet we are sending with
    const to = await Keypair.generate();

    await getWalletBalance(from);
    await getWalletBalance(to, sender = false);

    // Commadn to airdrop 2SOL to "from" wallet or the sender
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // This is to confirm transaction and it is the latest command for blockhash so the function will be updated.
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");

    await getWalletBalance(from);
    await getWalletBalance(to, sender = false);

    // Send 0.01 SOL from "from" to "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: LAMPORTS_PER_SOL / 100 //0.01
        })
    );

    // Block confirmation for transaction ID or signature for successful transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is', signature);// Like ETH Transaction ID

    await getWalletBalance(from);
    await getWalletBalance(to, sender = false);
}

transferSol();
