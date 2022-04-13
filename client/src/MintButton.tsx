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
  console.log(isActive)
  const wallet = useWallet();
  const connection = useConnection();
  const [disable, setDisable] = useState(isActive);
  const [verified, setVerified] = useState(false);
  const [webSocketSubscriptionId, setWebSocketSubscriptionId] = useState(-1);
  const [clicked, setClicked] = useState(false);

  const getMintButtonContent = () => {
    if (candyMachine?.state.isSoldOut) {
      return 'SOLD OUT';
    } else if (breedingStatus.status === 'MINTING' || breedingStatus.status === 'BREEDING' ) {
      return <CircularProgress />;
    } else if (breedingStatus.status === 'READYTOSTART') {
      return 'START BREED'
    } else if (breedingStatus.status === 'READYTOMINT') {
      return 'BREED BABY'
    }

    return 'MINT';
  };

  return (
    <CTAButton
      disabled={(breedingStatus.status !== 'NOTSTART' && breedingStatus.status !== 'READYTOMINT') || !disable}
      onClick={async () => {
          await onMint();
          setDisable(true);
      }}
      variant="contained"
    >
      {getMintButtonContent()}
    </CTAButton>
  );
};

