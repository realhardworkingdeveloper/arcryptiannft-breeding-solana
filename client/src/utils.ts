import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SystemProgram } from '@solana/web3.js';
import {
  LAMPORTS_PER_SOL,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import axios from "axios";

const {
  REACT_APP_WORLD_TIME_API_URL,
  REACT_APP_ELAPSED_TIME,
} = process.env;

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export interface AlertState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error' | undefined;
}

export interface BreedingStatus {
  status: 'NOTSTART' | 'READYTOSTART' | 'BREEDING' | 'READYTOMINT' | 'MINTING';
}

export const toDate = (value?: anchor.BN) => {
  if (!value) {
    return;
  }

  return new Date(value.toNumber() * 1000);
};

export interface NFTData {
  name: string;
  image: string;
  mint: string;
}

const numberFormater = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatNumber = {
  format: (val?: number) => {
    if (!val) {
      return '--';
    }

    return numberFormater.format(val);
  },
  asNumber: (val?: anchor.BN) => {
    if (!val) {
      return undefined;
    }

    return val.toNumber() / LAMPORTS_PER_SOL;
  },
};

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID =
  new anchor.web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

export const CIVIC = new anchor.web3.PublicKey(
  'gatem74V238djXdzWnJf94Wo1DcnuGkfijbf3AuBhfs',
);

export const getAtaForMint = async (
  mint: anchor.web3.PublicKey,
  buyer: anchor.web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  );
};

export const getNetworkExpire = async (
  gatekeeperNetwork: anchor.web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    [gatekeeperNetwork.toBuffer(), Buffer.from('expire')],
    CIVIC,
  );
};

export const getNetworkToken = async (
  wallet: anchor.web3.PublicKey,
  gatekeeperNetwork: anchor.web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    [
      wallet.toBuffer(),
      Buffer.from('gateway'),
      Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]),
      gatekeeperNetwork.toBuffer(),
    ],
    CIVIC,
  );
};

export function createAssociatedTokenAccountInstruction(
  associatedTokenAddress: anchor.web3.PublicKey,
  payer: anchor.web3.PublicKey,
  walletAddress: anchor.web3.PublicKey,
  splTokenMintAddress: anchor.web3.PublicKey,
) {
  const keys = [
    {
      pubkey: payer,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: associatedTokenAddress,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: walletAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: splTokenMintAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  return new TransactionInstruction({
    keys,
    programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    data: Buffer.from([]),
  });
}

// export const calculateTimeLeft = (startTime: number) => {

//   const difference = +new Date(startTime) - +new Date();

//   let timeLeft: TimeLeft = {} as TimeLeft;

//   if (difference > 0) {
//     timeLeft = {
//       days: Math.floor(difference / (1000 * 60 * 60 * 24)),
//       hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
//       minutes: Math.floor((difference / 1000 / 60) % 60),
//       seconds: Math.floor((difference / 1000) % 60),
//     };
//   }

//   return timeLeft;
// };

export const getTimeRemaining = async (startTime: number) => {
  const currentTimeData = await getWorldTime();
  const currentTime = currentTimeData.data.datetime;
  const secondTypeCurrentTime = new Date(currentTime).getTime() / 1000;

  const min_in_sec = 60;
  const incubation_duration = min_in_sec * (REACT_APP_ELAPSED_TIME == undefined ? 30 : +REACT_APP_ELAPSED_TIME);
  const timeRemaining = startTime + incubation_duration - secondTypeCurrentTime;

  return timeRemaining;
}

export const getTimeLeft = (timeRemaining: number) => {
  let timeLeft: TimeLeft = {} as TimeLeft;

  timeLeft = {
    days: Math.floor(timeRemaining / (60 * 60 * 24)),
    hours: Math.floor((timeRemaining / (60 * 60)) % 24),
    minutes: Math.floor((timeRemaining / 60) % 60),
    seconds: Math.floor(timeRemaining % 60),
  };

  return timeLeft
}

export const getWorldTime = async () => {
  return (await axios.get(`${REACT_APP_WORLD_TIME_API_URL}`));
}