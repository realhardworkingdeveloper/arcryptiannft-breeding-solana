import { useEffect, useMemo, useState, useCallback } from 'react';
import * as anchor from '@project-serum/anchor';

import styled from 'styled-components';
import { Container, Snackbar } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { PublicKey, Transaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletDialogButton } from '@solana/wallet-adapter-material-ui';
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  CANDY_MACHINE_PROGRAM,
  getCandyMachineState,
  mintOneToken,
} from './candy-machine';
import { AlertState, BreedingStatus } from './utils';
import { programs } from "@metaplex/js";
import { FetchNFTsByWallet } from './lib/FetchNFTsByWallet';

import { ParentChooseButton } from './ParentChooseButton';
import { MintButton } from './MintButton';

const ConnectButton = styled(WalletDialogButton)`
  width: 100%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(180deg, #604ae5 0%, #813eee 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const { MetadataData } = programs.metadata;
const adult_arcryptian_prefix = process.env.REACT_APP_ADULT_NAME_PREFIX;

export interface HomeProps {
  candyMachineId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  txTimeout: number;
  rpcHost: string;
}

const Home = (props: HomeProps) => {
  const [breedingStatus, setBreedingStatus] = useState<BreedingStatus>({
    status: 'NOTSTART'
  });
  const [isParentChosen, setIsParentChosen] = useState(false);
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  });

  const [isActive, setIsActive] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [itemsRemaining, setItemsRemaining] = useState<number>();

  const [maleList, setMaleList] = useState([]);
  const [femaleList, setFemaleList] = useState([]);

  const rpcUrl = props.rpcHost;
  const wallet = useWallet();

  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const refreshCandyMachineState = useCallback(async () => {
    if (!anchorWallet) {
      return;
    }

    if (props.candyMachineId) {
      try {
        const cndy = await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          props.connection,
        );

        // check if mint functionality is active
        let active =
          cndy?.state.goLiveDate?.toNumber() < new Date().getTime() / 1000;

        // amount to stop the mint?
        if (cndy?.state.endSettings?.endSettingType.amount) {
          let limit = Math.min(
            cndy.state.endSettings.number.toNumber(),
            cndy.state.itemsAvailable,
          );
          if (cndy.state.itemsRedeemed < limit) {
            setItemsRemaining(limit - cndy.state.itemsRedeemed);
          } else {
            setItemsRemaining(0);
            cndy.state.isSoldOut = true;
          }
        } else {
          setItemsRemaining(cndy.state.itemsRemaining);
        }

        // check if all of nfts are minted
        if (cndy.state.isSoldOut) {
          active = false;
        }

        setIsActive((cndy.state.isActive = active));
        setCandyMachine(cndy);
      } catch (e) {
        console.log('There was a problem fetching Candy Machine state');
        console.log(e);
      }
    }
  }, [anchorWallet, props.candyMachineId, props.connection]);

  const onMint = async (
    beforeTransactions: Transaction[] = [],
    afterTransactions: Transaction[] = [],
  ) => {
    try {
      document.getElementById('#identity')?.click();
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        let mintOne = await mintOneToken(
          candyMachine,
          wallet.publicKey,
          beforeTransactions,
          afterTransactions,
        );

        const mintTxId = mintOne[0];

        let status: any = { err: true };
        if (mintTxId) {
          status = await awaitTransactionSignatureConfirmation(
            mintTxId,
            props.txTimeout,
            props.connection,
            true,
          );
        }

        if (status && !status.err) {
          // manual update since the refresh might not detect
          // the change immediately
          let remaining = itemsRemaining! - 1;
          setItemsRemaining(remaining);
          setIsActive((candyMachine.state.isActive = remaining > 0));
          candyMachine.state.isSoldOut = remaining === 0;
          setAlertState({
            open: true,
            message: 'Congratulations! Mint succeeded!',
            severity: 'success',
          });
        } else {
          setAlertState({
            open: true,
            message: 'Mint failed! Please try again!',
            severity: 'error',
          });
        }
      }
    } catch (error: any) {
      let message = error.msg || 'Minting failed! Please try again!';
      if (!error.msg) {
        if (!error.message) {
          message = 'Transaction Timeout! Please try again.';
        } else if (error.message.indexOf('0x137')) {
          console.log(error);
          message = `SOLD OUT!`;
        } else if (error.message.indexOf('0x135')) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          console.log(error);
          message = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: 'error',
      });
      // updates the candy machine state to reflect the lastest
      // information on chain
      refreshCandyMachineState();
    } finally {
    }
  };

  const toggleMintButton = () => {
    let active = !isActive;

    setIsActive((candyMachine!.state.isActive = active));
  };

  async function getNFTList() {
    const { publicKey } = wallet;
    if (!publicKey) {
      setMaleList([]);
      setFemaleList([]);
      return null;
    };

    let userNFTs, males:any = [], females:any = [];
    try {
      userNFTs = await FetchNFTsByWallet(
        new PublicKey(publicKey),
        props.connection
      );

      if (typeof userNFTs === "undefined") {
        setMaleList([]);
        setFemaleList([]);
        return null;
      } else {
        userNFTs.forEach(async (nft: any) => {
          if(nft?.data?.name?.includes(adult_arcryptian_prefix) == true) {
            let data = await (await fetch(nft?.data?.uri)).json();

            if(data?.attributes[0]?.trait_type.charAt(0) === 'm' || data?.attributes[1]?.trait_type.charAt(0) === 'm') {
              males.push(data);
            } else if(data?.attributes[0]?.trait_type.charAt(0) === 'f' || data?.attributes[1]?.trait_type.charAt(0) === 'f') {
              females.push(data);
            }
          }
        })

        setMaleList(males);
        setFemaleList(females);
        return userNFTs;
      }
    } catch (error) {
      console.log("error: ", error);
      return null;
    }
  }

  useEffect(() => {
    refreshCandyMachineState();

    if (wallet.connected && !isFetching) {
      setIsFetching(true);
      (async () => {
        await getNFTList();
        setIsFetching(false);
      })();
    }
  }, [
    anchorWallet,
    props.candyMachineId,
    props.connection,
    refreshCandyMachineState,
  ]);

  return (
    <Container style={{ marginTop: 100 }}>
      <Container className='breeding' maxWidth="xs" style={{ position: 'relative' }}>
          {!wallet.connected ? (
            // <ConnectButton>Connect Wallet</ConnectButton>
            <ParentChooseButton
                maleList={maleList}
                femaleList={femaleList}
                candyMachine={candyMachine}
                setBreedingStatus={setBreedingStatus}
              />
          ) : (
            breedingStatus.status === 'NOTSTART' ? (
              <ParentChooseButton
                maleList={maleList}
                femaleList={femaleList}
                candyMachine={candyMachine}
                setBreedingStatus={setBreedingStatus}
              />
            ) : (
              breedingStatus.status === 'BREEDING' ? (
                <p>Countdown</p>
              ) : (
                <MintButton
                  candyMachine={candyMachine}
                  breedingStatus={breedingStatus}
                  onMint={onMint}
                  isActive={isActive}
                />
              )
            )
          )}
      </Container>

      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Home;
