import { useEffect, useMemo, useState, useCallback } from 'react';
import * as anchor from '@project-serum/anchor';

import styled from 'styled-components';
import {
  Container,
  Snackbar,
  CircularProgress
} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { Countdown } from './Countdown';
import {
  PublicKey,
  Transaction,
  Connection
} from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletDialogButton } from '@solana/wallet-adapter-material-ui';
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  CANDY_MACHINE_PROGRAM,
  getCandyMachineState,
  mintOneToken,
  getCandyMachineCreator,
} from './candy-machine';
import { AlertState, BreedingStatus, getTimeRemaining, NFTData } from './utils';
import { programs } from "@metaplex/js";

import { ParentChooseButton } from './ParentChooseButton';
import { MintButton } from './MintButton';

import * as BreedingAdapter from './lib/BreedingAdapter';
import { FetchNFTs } from './lib/FetchNFTByCandymachine';

import idl from './idl/arcryptiannft_breeding_solana.json';

const { SystemProgram, SYSVAR_RENT_PUBKEY, SYSVAR_CLOCK_PUBKEY } = anchor.web3;

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
const nft_authority_owner = process.env.REACT_APP_ADULT_AUTHORITY_PUBKEY;

export interface HomeProps {
  egg_candyMachineId?: anchor.web3.PublicKey;
  baby_candyMachineId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  txTimeout: number;
  rpcHost: string;
}

const Home = (props: HomeProps) => {
  const [breedingStatus, setBreedingStatus] = useState<BreedingStatus>({
    status: 'NOTSTART'
  });
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  });

  const [isActive, setIsActive] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [itemsRemaining, setItemsRemaining] = useState<number>();
  const [remainTime, setRemainTime] = useState<number>();
  const [maleList, setMaleList] = useState<NFTData[]>([]);
  const [femaleList, setFemaleList] = useState<NFTData[]>([]);

  const [male, setMale] = useState<NFTData>();
  const [female, setFemale] = useState<NFTData>();

  const rpcUrl = props.rpcHost;
  const wallet = useWallet();

  const breeding_connection = [wallet, props.connection];

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

    let candyMachineId;
    if(breedingStatus.status === 'NOTSTART') {
      candyMachineId = props.egg_candyMachineId;
    } else if(breedingStatus.status === 'READYTOMINT') {
      candyMachineId = props.baby_candyMachineId;
    }
    
    if (candyMachineId) {
      try {
        const cndy = await getCandyMachineState(
          anchorWallet,
          candyMachineId,
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

        console.log(active);

        setIsActive((cndy.state.isActive = active));
        setCandyMachine(cndy);
      } catch (e) {
        console.log('There was a problem fetching Candy Machine state');
        console.log(e);
      }
    }
  }, [
    anchorWallet,
    props.egg_candyMachineId,
    props.baby_candyMachineId,
    props.connection,
    breedingStatus
  ]);

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

          if(breedingStatus.status === 'NOTSTART') {
            setBreedingStatus({
              status: 'READYTOMINT'
            });
          } else if(breedingStatus.status === 'READYTOMINT') {
            setBreedingStatus({
              status: 'NOTSTART'
            });
          }
          
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
    } finally {
      refreshCandyMachineState();
    }
  };

  useEffect(() => {
  }, [breedingStatus]);

  const toggleMintButton = () => {
    let active = !isActive;

    setIsActive((candyMachine!.state.isActive = active));
  };

  const getNFTList = async () =>  {
    const { publicKey } = wallet;
    if (!publicKey) {
      setMaleList([]);
      setFemaleList([]);
      return null;
    };

    let userNFTs, males:NFTData[] = [], females:NFTData[] = [];
    try {
      userNFTs = await FetchNFTs(
        new PublicKey(publicKey),
        props.connection
      );

      if (typeof userNFTs === "undefined") {
        setMaleList([]);
        setFemaleList([]);
        return null;
      } else {
        userNFTs.forEach(async (nft: any) => {
          if(nft?.updateAuthority == nft_authority_owner && nft?.primarySaleHappened === 1) {
            try {
              let data = await (await fetch(nft?.data?.uri)).json();

              if(data?.attributes[0]?.trait_type.charAt(0) === 'm' || data?.attributes[1]?.trait_type.charAt(0) === 'm') {
                males.push({
                  name: data?.name,
                  image: data?.image,
                  mint: nft?.mint
                });
              } else if(data?.attributes[0]?.trait_type.charAt(0) === 'f' || data?.attributes[1]?.trait_type.charAt(0) === 'f') {
                females.push({
                  name: data?.name,
                  image: data?.image,
                  mint: nft?.mint
                });
              }
            } catch {
              console.log("nft metadata is not available");
            }
          }
        });

        // console.log("male", males);
        // console.log("female", females);

        setMaleList(males);
        setFemaleList(females);
        return userNFTs;
      }
    } catch (error) {
      console.log("error: ", error);
      return null;
    }
  };

  useEffect(() => {
    
    refreshCandyMachineState();

    if (wallet.connected && !isFetching) {
      setIsFetching(true);
      
      (async () => {
        const breeding_info = await BreedingAdapter.getBreeding(...breeding_connection);

        if (breeding_info === undefined) {
          console.log("get breeding_info Failed")
        } else {
          console.log("breeding_info", breeding_info);
          let remain_time = await getTimeRemaining(breeding_info?.timestamp.toNumber());
          console.log("remain time", remain_time);
          setRemainTime(remain_time);
          if(breeding_info?.isBreeding) {
            
            console.log("finish breeding");
            // await BreedingAdapter.finishBreeding(...breeding_connection);
            console.log("finish success");
          } else {
            await getNFTList();
            
            console.log("start breeding");
            // await BreedingAdapter.startBreeding(...breeding_connection);
            console.log("start success");
          }
        }

        setIsFetching(false);
      })();
    }
  }, [
    anchorWallet,
    props.egg_candyMachineId,
    props.baby_candyMachineId,
    props.connection,
    refreshCandyMachineState,
    breedingStatus.status
  ]);

  return (
    <Container style={{ marginTop: 100 }}>
      <Container className='breeding' maxWidth="xs" style={{ position: 'relative' }}>
          {
            ((wallet.connected && breedingStatus.status !== 'NOTSTART' && breedingStatus.status !== 'MINTING') ? (
              <Grid container style={{ marginTop: -100 }}>
                <Grid item xs={6} style={{ paddingRight: 10 }}>
                  <img className="preview" src={ male?.image ? male.image : "/img/no-image.png"} />
                  <Paper className="selected_name" elevation={3} >
                    {male ? male.name : 'No selected'}
                  </Paper>
                </Grid>

                <Grid item xs={6} style={{ paddingLeft: 10 }}>
                  <img className="preview" src={ female?.image ? female.image : "/img/no-image.png"} />
                  <Paper className="selected_name" elevation={3} >
                    {female ? female.name : 'No selected'}
                  </Paper>
                </Grid>
              </Grid>
            ) : (<></>))
          }
          
          {!wallet.connected ? (
            <ConnectButton>Connect Wallet</ConnectButton>
          ) : (
            breedingStatus.status === 'NOTSTART' ? (
                <ParentChooseButton
                  maleList={maleList}
                  femaleList={femaleList}
                  setMale = {setMale}
                  setFemale = {setFemale}
                  setBreedingStatus={setBreedingStatus}
                />
              ) : (
                breedingStatus.status === 'READYTOSTART' ? (
                <MintButton
                  candyMachine={candyMachine}
                  breedingStatus={breedingStatus}
                  onMint={onMint}
                  isActive={isActive}
                />
              ) : (
                breedingStatus.status === 'BREEDING' ? (
                  <Countdown
                    remain = {remainTime === undefined ? 0 : remainTime }
                    setBreedingStatus={setBreedingStatus}
                  />
                ) : (
                  breedingStatus.status === 'READYTOMINT' ? (
                    <MintButton
                    candyMachine={candyMachine}
                    breedingStatus={breedingStatus}
                    onMint={onMint}
                    isActive={isActive}
                    />
                  ) : <p>SUCCESS</p>
                )
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
