import { programs } from "@metaplex/js";
import {
  PublicKey, Transaction
} from "@solana/web3.js";
import * as anchor from '@project-serum/anchor';
import {
  Program, Provider
} from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token } from "@solana/spl-token"

import idl from '../idl/arcryptiannft_breeding_solana.json';

const { SystemProgram, SYSVAR_RENT_PUBKEY, SYSVAR_CLOCK_PUBKEY } = anchor.web3;

const programID = new PublicKey(idl.metadata.address);

const {
  REACT_APP_BREEDING_SEED,
  REACT_APP_DIPOSIT_WALLET_ADDRESS,
  REACT_APP_TOKEN_ACCOUNT
} = process.env;

const TOKEN_METADATA = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const getProgram = async (wallet, connection) => {

  const provider = new Provider(
    connection,
    wallet,
    {
      preflightCommitment: "processed",
    }
  );

  const program = new Program(idl, programID, provider);

  return program;
}

export const getBreeding = async (wallet, connection) => {

  const program = await getProgram(wallet, connection);

  const authority = program.provider.wallet.publicKey;

  const [programPDA, bump] = await PublicKey.findProgramAddress(
    [authority.toBuffer(), Buffer.from(REACT_APP_BREEDING_SEED, "utf8")],
    program.programId
  );

  try {
    const breeding_info = await program.account.breeding.fetch(programPDA);
    
    return breeding_info;
  } catch (getInfoErr) {
    console.log(getInfoErr);
    try {
      await program.rpc.initialize({
        accounts: {
          authority: authority,
          breeding: programPDA,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY
        }
      });

      const breeding_info = await program.account.breeding.fetch(programPDA);
      
      return breeding_info;
    } catch (err) {
      console.log("Breeding initialize Failed");
    }
  }

  return undefined;
};

export const startBreeding = async (wallet, connection, male, female) => {
  const MALE_MINT = new PublicKey(male.mint);
  const FEMALE_MINT = new PublicKey(female.mint);
  
  const program = await getProgram(wallet, connection);

  const authority = program.provider.wallet.publicKey;

  const [programPDA, bump] = await PublicKey.findProgramAddress(
    [authority.toBuffer(), Buffer.from(REACT_APP_BREEDING_SEED, "utf8")],
    program.programId
  );
  
  const maleLockATA = await getOrCreateAssociatedTokenAccount(connection, MALE_MINT, programPDA, wallet)
  const femaleLockATA = await getOrCreateAssociatedTokenAccount(connection, FEMALE_MINT, programPDA, wallet)
  
  const maleATA = await findAssociatedTokenAddress(
    wallet.publicKey,
    MALE_MINT
  );
  const femaleATA = await findAssociatedTokenAddress(
    wallet.publicKey,
    FEMALE_MINT
  );
  
  const arcMint = new PublicKey(REACT_APP_TOKEN_ACCOUNT);
  const arcFrom = await findAssociatedTokenAddress(
    wallet.publicKey,
    arcMint
  );

  const adminPublickey = new PublicKey(REACT_APP_DIPOSIT_WALLET_ADDRESS);
  const arcTo = await getOrCreateAssociatedTokenAccount(
    connection,
    arcMint,
    adminPublickey,
    wallet
  );

  try {
    await program.rpc.start(
      male.image,
      female.image,
      MALE_MINT,
      FEMALE_MINT, {
      accounts: {
        authority: authority,
        breeding: programPDA,

        arcFrom: arcFrom,
        arcTo: arcTo,

        maleLockAccount: maleLockATA,
        maleUserWallet: maleATA,
        
        femaleLockAccount: femaleLockATA,
        femaleUserWallet: femaleATA,

        tokenProgramId: TOKEN_PROGRAM_ID,
        adultNftProgramId: TOKEN_METADATA,
        systemProgram: SystemProgram.programId,

        clock: SYSVAR_CLOCK_PUBKEY
      }
    });
    console.log("start breeding success");
    return true;
  } catch(err) {
    console.log("adult lock failed", err);
    return false;
  }
}

export const finishBreeding = async (wallet, connection, male_mint, female_mint, egg_mint) => {
  const MALE_MINT = male_mint;
  const FEMALE_MINT = female_mint;
  const EGG_MINT = new PublicKey(egg_mint);

  const program = await getProgram(wallet, connection);

  const authority = program.provider.wallet.publicKey;

  const [programPDA, bump] = await PublicKey.findProgramAddress(
    [authority.toBuffer(), Buffer.from(REACT_APP_BREEDING_SEED, "utf8")],
    program.programId
  );

  const maleLockATA = await getOrCreateAssociatedTokenAccount(connection, MALE_MINT, programPDA, wallet)
  const femaleLockATA = await getOrCreateAssociatedTokenAccount(connection, FEMALE_MINT, programPDA, wallet)
  
  const maleATA = await findAssociatedTokenAddress(
    wallet.publicKey,
    MALE_MINT
  );
  const femaleATA = await findAssociatedTokenAddress(
    wallet.publicKey,
    FEMALE_MINT
  );

  const arcMint = new PublicKey(REACT_APP_TOKEN_ACCOUNT);
  const arcFrom = await findAssociatedTokenAddress(
    wallet.publicKey,
    arcMint
  );

  const adminPublickey = new PublicKey(REACT_APP_DIPOSIT_WALLET_ADDRESS);
  const arcTo = await getOrCreateAssociatedTokenAccount(
    connection,
    arcMint,
    adminPublickey,
    wallet
  );

  const eggLockATA = 
    await getOrCreateAssociatedTokenAccount(connection, EGG_MINT, programPDA, wallet)
  
  const eggATA = await findAssociatedTokenAddress(
    wallet.publicKey,
    EGG_MINT
  );

  try {
    await program.rpc.finish(
      bump, 
      {
      accounts: {
          authority: authority,
          breeding: programPDA,

          arcFrom: arcFrom,
          arcTo: arcTo,

          maleNftTokenMint: MALE_MINT,
          maleLockAccount: maleLockATA,
          maleUserWallet: maleATA,

          femaleNftTokenMint: FEMALE_MINT,
          femaleLockAccount: femaleLockATA,
          femaleUserWallet: femaleATA,

          eggLockAccount: eggLockATA,
          eggUserWallet: eggATA,

          tokenProgramId: TOKEN_PROGRAM_ID,
          adultNftProgramId: TOKEN_METADATA,
          systemProgram: SystemProgram.programId,

          clock: SYSVAR_CLOCK_PUBKEY
      }
    });
    console.log("unlock success");
    return true;
  } catch(err) {
    console.log("adult lock failed", err);
    return false;
  }
}

const findAssociatedTokenAddress = async (
  walletAddress,
  tokenMintAddress
) => {
  return (await PublicKey.findProgramAddress(
    [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
    ],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  ))[0];
}

const getOrCreateAssociatedTokenAccount = async (
  connection,
  mint,
  wallet, 
  payer
) => {

  const address = await findAssociatedTokenAddress(
    wallet,
    mint
  );

  if (!(await connection.getAccountInfo(address))) {
    try {
      const txn = new Transaction().add(Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        address,
        wallet,
        payer.publicKey
      ));

      txn.feePayer = payer.publicKey;

      txn.recentBlockhash = (
        await connection.getRecentBlockhash()
        ).blockhash;

      const signedTxn = await payer.signTransaction(txn, connection)

      const signature = await connection.sendRawTransaction(signedTxn.serialize());
      let confirmed = await connection.confirmTransaction(signature);
    } catch {
      console.log("createAssociatedTokenAccount failed");
    }
  }

  return address;
}

