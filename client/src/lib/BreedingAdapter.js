import { programs } from "@metaplex/js";
import {
  PublicKey, clusterApiUrl, Connection
} from "@solana/web3.js";
import * as anchor from '@project-serum/anchor';
import {
  Program, Provider
} from '@project-serum/anchor';

import idl from '../idl/arcryptiannft_breeding_solana.json';

const { SystemProgram, SYSVAR_RENT_PUBKEY, SYSVAR_CLOCK_PUBKEY } = anchor.web3;

const programID = new PublicKey(idl.metadata.address);


// const {
  // REACT_APP_WORLD_TIME_API_URL,
  // REACT_APP_ELAPSED_TIME,
  // REACT_APP_SOLANA_NETWORK,
  // REACT_APP_TOKEN_ACCOUNT,
  // REACT_APP_DIPOSIT_WALLET_ADDRESS,
  // REACT_APP_DIPOSIT_TOKEN_AMOUNT,
// } = process.env;

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
    [authority.toBuffer(), Buffer.from("arcryptian_breeding", "utf8")],
    program.programId
  );

  try {
    const breeding_info = await program.account.breeding.fetch(programPDA);
    
    return breeding_info;
  } catch {
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

