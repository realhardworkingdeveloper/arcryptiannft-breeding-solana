import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { CandyMachineAccount } from './candy-machine';
import { CircularProgress } from '@material-ui/core';
import { useEffect, useState, useRef } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { BreedingStatus } from './utils';

export const CTAButton = styled(Button)`
  width: 100%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(180deg, #604ae5 0%, #813eee 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
`; // add your own styles here

export const MintButton = ({
  onMint,
  candyMachine,
  breedingStatus,
  isActive,
}: {
  onMint: () => Promise<void>;
  candyMachine?: CandyMachineAccount;
  breedingStatus: BreedingStatus;
  isActive: boolean;
}) => {
  const wallet = useWallet();
  const connection = useConnection();
  const [verified, setVerified] = useState(false);
  const [webSocketSubscriptionId, setWebSocketSubscriptionId] = useState(-1);
  const [clicked, setClicked] = useState(false);

  const getMintButtonContent = () => {
    if (candyMachine?.state.isSoldOut) {
      return 'SOLD OUT';
    } else if (breedingStatus.status === 'MINTING' ) {
      return <CircularProgress />;
    }

    return 'MINT';
  };

  useEffect(() => {
    const mint = async () => {
      await onMint();

      setClicked(false);
      setVerified(false);
    };
    if (verified && clicked) {
      mint();
    }
  }, [
    verified,
    clicked,
    connection.connection,
    onMint,
    webSocketSubscriptionId,
  ]);

  return (
    <CTAButton
      disabled={breedingStatus.status !== 'READYTOMINT' || !isActive}
      onClick={async () => {
        
          await onMint();
          setClicked(false);
      }}
      variant="contained"
    >
      {getMintButtonContent()}
    </CTAButton>
  );
};

