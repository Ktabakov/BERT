import type { NextPage } from 'next';
import { useState, useEffect } from "react";
import NavBar from '../components/NavBar';  
import FlappyBirdGame from "../components/Game";
import { claimTokens, send } from '../public/walletActions'; 

import { 
  network 
} from '../common/network';
import WalletConnector from '../components/WalletConnector'

const Home: NextPage = () => {
 
  const [isLoading, setIsLoading] = useState(false);
  const [tx, setTx] = useState({ txId : '' });
  const [walletAPI, setWalletAPI] = useState<undefined | any>(undefined);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false); // Modal state for wallet connection
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null); // Track connected wallet name
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isInClaimWindow, setIsInClaimWindow] = useState<boolean>(false);
  
  useEffect(() => {
    const reconnectWallet = async () => {
      const savedWallet = localStorage.getItem("connectedWallet");
  
      if (savedWallet && window.cardano?.[savedWallet]) {
        try {
          const walletAPI = await window.cardano[savedWallet].enable();
          const address = await walletAPI.getChangeAddress(); // Get wallet address
          setWalletAPI(walletAPI); // Set the wallet API
          setWalletAddress(address);
          setConnectedWallet(savedWallet); // Track the connected wallet
          console.log(`Reconnected to wallet: ${savedWallet}`);
        } catch (err) {
          console.error("Failed to reconnect wallet:", err);
          localStorage.removeItem("connectedWallet"); // Clear invalid wallet data
        }
      }
    };
  
    reconnectWallet();
  }, []);

    const handleWalletConnect = async (api: any, walletName: string) => {
    if (api) {
      localStorage.setItem("connectedWallet", walletName);
      setWalletAPI(api);
      const address = await api.getChangeAddress(); // Get wallet address
      setWalletAddress(address);
      setIsWalletModalOpen(false);
    }
  };

  const toggleWalletModal = () => {
    setIsWalletModalOpen(!isWalletModalOpen);
  };

  const handleClaimTokens = () => {
    claimTokens(walletAPI, setIsLoading, setTx);
  };

  const handleConnect = () => {
    setIsWalletModalOpen(true);
  };

  return (
    <div>
      {/* Navigation Bar */}
      <NavBar
        isConnected={!!walletAPI}
        walletAddress={walletAddress || ""}
        onConnect={handleConnect}
        onClaimTokens={handleClaimTokens} 
        isInClaimWindow={isInClaimWindow}
      />
  
      {/* Wallet Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-center mb-4">
              Select Your Wallet
            </h3>
            <WalletConnector onWalletAPI={handleWalletConnect} />
            <button
              onClick={toggleWalletModal}
              className="mt-6 btn btn-cancel w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
  
      {/* Main Content */}
      <main className="flex-grow overflow-hidden flex flex-col">
        {/* Flappy Bird Game */}
        <div className="flex-grow flex justify-center items-center">
          <FlappyBirdGame onClaimWindowStatusChange={(isInWindow) => setIsInClaimWindow(isInWindow)} />
        </div>
        {/* Transaction Success Message */}
        {tx.txId && walletAPI && (
          <div className="border border-gray-400 p-4 rounded mb-4 bg-white shadow">
            <h4 className="font-bold text-green-600">Transaction Success!</h4>
            <p className="text-sm">
              <span className="font-semibold">TxId:</span>&nbsp;
              <a
                href={`https://${network === "mainnet" ? "" : network + "."}cexplorer.io/tx/${tx.txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline break-all"
              >
                {tx.txId}
              </a>
            </p>
            <p className="mt-2 text-gray-600 text-xs">
              Please wait until the transaction is confirmed on the blockchain
              and reload this page before performing another transaction.
            </p>
          </div>
        )}
      </main>
     {/* Footer */}
    <footer className="footer bg-gray-800 text-white text-center py-4">
      <p className="text-sm">
        ADA donation Address:
      </p>
      <p className="text-xs">
        [Insert Address here]
      </p>
    </footer>
    </div>
  );
  };
  
  export default Home;
  