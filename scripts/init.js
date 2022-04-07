import * as anchor from '@project-serum/anchor'
import {
    Connection,
    clusterApiUrl,
    PublicKey,
} from '@solana/web3.js'
import * as staking from './abi.json'
import * as WALLET from './devnet.json';

import {programID, candyV2, opts} from "./common.js"
const { SystemProgram, SYSVAR_RENT_PUBKEY, SYSVAR_CLOCK_PUBKEY } = anchor.web3

async function main() {
    const network = clusterApiUrl("devnet")
    const connection = new Connection(network, opts.preflightCommitment);
    const wallet = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(WALLET))
    const walletK = new anchor.Wallet(wallet)
    const provider = new anchor.Provider(
        connection, walletK, opts.preflightCommitment,
    )
    const program = new anchor.Program(staking, programID, provider);

    const [programPDA, programBump] =
        await PublicKey.findProgramAddress([
            wallet.publicKey.toBuffer(),
            Buffer.from('arcryptian_breeding', "utf8")
        ], programID);

   await program.rpc.initialize({
       accounts: {
           breeding: programPDA,
           
           authority: wallet.publicKey,
           systemProgram: SystemProgram.programId,
           clock: SYSVAR_CLOCK_PUBKEY
       },
       signers: [wallet],
   })
   .then(res => console.log(res))
   .catch(err => console.log(err));

}

main().then("finish")

// node --experimental-json-modules initializeStaking.js