import './App.css';
import './userCSS.css';
import { useMemo } from 'react';
import * as anchor from '@project-serum/anchor';
import Home from './Home';

import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolletExtensionWallet,
} from '@solana/wallet-adapter-wallets';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletDialogProvider } from '@solana/wallet-adapter-material-ui';

import { ThemeProvider, createTheme } from '@material-ui/core';

const theme = createTheme({
  palette: {
    type: 'dark',
  },
});

const getCandyMachineId = (): anchor.web3.PublicKey | undefined => {
  try {
    const candyMachineId = new anchor.web3.PublicKey(
      process.env.REACT_APP_CANDY_MACHINE_ID!,
    );

    return candyMachineId;
  } catch (e) {
    console.log('Failed to construct CandyMachineId', e);
    return undefined;
  }
};

const candyMachineId = getCandyMachineId();
const network = process.env.REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork;
const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
const connection = new anchor.web3.Connection(
  rpcHost ? rpcHost : anchor.web3.clusterApiUrl('devnet'),
);

const txTimeoutInMilliseconds = 30000;

const App = () => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolflareWallet(),
      getSlopeWallet(),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
    ],
    [],
  );

  return (
    <ThemeProvider theme={theme}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletDialogProvider>
            <div className="App">
              <nav>
                <div className="nav-container">
                  <img className="nav-logo" src="/img/logo.png" alt=""/>
                  <a className="hide-800" href="/#">Stake</a>
                  <a className="hide-800 active" href="/#">Breeding</a>
                  <a className="hide-800" href="/#">Road Map</a>
                  <a className="hide-800" href="/#">FAQ</a>
                  <a className="hide-800" href="/#">Black Paper</a>
                  <div className="social-icons hide-800">
                    <a href="https://www.instagram.com/arcryptiannft" title="Instagram" target="_top">
                      <img className="nav-social" src="/icons/insta.svg" alt="" />
                    </a>
                    <a href="https://twitter.com/arcryptian_nft" title="Twitter" target="_top">
                      <img className="nav-social" src="/icons/twitter.svg" alt="" />
                    </a>
                    <a href="https://discord.gg/ZugZB8QKmB" title="Discord Link" target="_top">
                      <img className="nav-social" src="/icons/discord.svg" alt="" />
                    </a>
                  </div>
                </div>
              </nav>
              <div className="content-wrapper">
                <div id="link2" className="container card">
                  <h1 className="pb-3" style={{textAlign: 'center'}}>Arcryptian Breeding</h1>
                  <p className="text-secondary-color">NFT breeding refers to mint a new non-fungible token to a user who has 2 arcryptians(adult man and woman) and paid some $ARC.</p>
                  <p>Heres the arcyptian breeding requirements:</p>
                  <br />
                  <h4 style={{textAlign: 'left'}}>• Must put two arcyptians: One is man and the other is woman</h4>
                  <br/>
                  <h4 style={{textAlign: 'left'}}>• Must be adult to breed a new baby arcryptian</h4>
                  <br/>
                  <h4 style={{textAlign: 'left'}}>• Must pay X $ARC to breed</h4>
                  <br/>
                  <h4 style={{textAlign: 'left'}}>• Must wait for incubation</h4>
                  <br/>
                  <Home
                    candyMachineId={candyMachineId}
                    connection={connection}
                    txTimeout={txTimeoutInMilliseconds}
                    rpcHost={rpcHost}
                  />
                </div>
              </div>
            </div>
          </WalletDialogProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
};

export default App;
