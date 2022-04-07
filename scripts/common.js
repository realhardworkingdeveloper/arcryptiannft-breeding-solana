import {
    PublicKey, Transaction
} from '@solana/web3.js'
import pkg, { ASSOCIATED_TOKEN_PROGRAM_ID, Token } from "@solana/spl-token"
const { TOKEN_PROGRAM_ID } = pkg

import anchor from '@project-serum/anchor'

export const programID = new PublicKey("7MFw3o88qjGDRcvXr217A54cMp3chWi5qF2fng1qWshU")
export const candyV2 = new PublicKey("FqAAJUyZx3XszJ4eV3PmHWsezi1jGaaUdUPUZCxtfmLY")

export const tokenMetadata = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
export const owner = new PublicKey("8GejL9cQm9hJoXUDiWaQwWADY67TNrib7CmaCVCcCcKi")

export const opts = {
    preflightCommitment: "recent",
};

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  );
  
export async function findAssociatedTokenAddress(
      walletAddress,
      tokenMintAddress
  ) {
      return (await PublicKey.findProgramAddress(
          [
              walletAddress.toBuffer(),
              TOKEN_PROGRAM_ID.toBuffer(),
              tokenMintAddress.toBuffer(),
          ],
          SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
      ))[0];
  }


export async function getOrCreateAssociatedTokenAccount(
    connection,
    mint,
    wallet, 
    payer
) {
    const address = await findAssociatedTokenAddress(
        wallet,
        mint
        );
    if (!(await connection.getAccountInfo(address))) {
        const txn = new Transaction().add(Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mint,
            address,
            wallet,
            payer.publicKey
        ))
        txn.recentBlockhash = (
            await connection.getRecentBlockhash()
        ).blockhash;
        txn.sign(payer)
        let signature = await connection.sendRawTransaction(txn.serialize());
        let confirmed = await connection.confirmTransaction(signature);
        console.log(signature);
    }
    return address;
}