import {
  Route,
  BrowserRouter,
  Routes
} from "react-router-dom";
import React, { useMemo } from 'react';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {    CoinbaseWalletAdapter,
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter, } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import { UserContextProvider } from './context/userContext'

import Layout from "./Layout";

import SelectRaffleForm from "./screen/selectform"

import 'react-notifications/lib/notifications.css';

require('@solana/wallet-adapter-react-ui/styles.css');


export default function App() {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Mainnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
      () => [
           new CoinbaseWalletAdapter(),
           new GlowWalletAdapter(),
           new PhantomWalletAdapter(),
           new SlopeWalletAdapter(),
           new SolflareWalletAdapter(),
           new SolletExtensionWalletAdapter(),
           new SolletWalletAdapter(),
           new TorusWalletAdapter(),
          ],
      []
  );

  return (
    <>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <UserContextProvider>
                <BrowserRouter>
                  <Layout>
                    <Routes>
                      <Route path='/' element={<SelectRaffleForm />} />
                    </Routes>
                  </Layout>
                </BrowserRouter>
              </UserContextProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  )
}