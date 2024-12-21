import type { NextPage } from 'next';
import { useState, useEffect } from "react";
import NavBar from '../components/NavBar';  
import FlappyBirdGame from "../components/Game";
import { claimTokens, send } from '../public/walletActions'; 

import { 
  network 
} from '../common/network';
import WalletConnector from '../components/WalletConnector'
import ErrorPopup from '../components/ErrorPopup'; 

const Home: NextPage = () => {
 
  const [isLoading, setIsLoading] = useState(false);
  const [tx, setTx] = useState({ txId : '' });
  const [walletAPI, setWalletAPI] = useState<undefined | any>(undefined);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false); // Modal state for wallet connection
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null); // Track connected wallet name
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isInClaimWindow, setIsInClaimWindow] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // New state for error messages

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

  const handleClaimTokens = async () => {
    try {
      await claimTokens(walletAPI, setIsLoading, setTx);
    } catch (err: any) { 
      if (err.info === 'User declined to sign the transaction.') {
        console.log("Transaction was canceled by the user.");
        // You can choose to show a toast notification or simply do nothing
      } else {
        // For all other errors, display the error popup
        setError("Something went wrong. Please try again.");
      }
    }
  };
  const closeErrorPopup = () => {
    setError(null);
  };

  const handleConnect = () => {
    setIsWalletModalOpen(true);
  };

  return (
<div className="flex flex-col min-h-screen">
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
  
       {/* Error Popup */}
      {error && (
        <ErrorPopup message={error} onClose={closeErrorPopup} />
      )}
      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {/* Flappy Bird Game */}
        <div className="flex-grow flex justify-center items-center">
          <FlappyBirdGame onClaimWindowStatusChange={(isInWindow) => setIsInClaimWindow(isInWindow)} />
        </div>
      </main>
       {/* Footer */}
       <footer className="footer bg-gray-800 text-white py-4 mt-auto">
  <div className=" mx-auto flex flex-wrap md:flex-nowrap justify-between items-center">
    {/* Left Container: Transaction Success Message */}
    <div className="flex-1 text-left pl-4 md:pl-8">
      {tx.txId && walletAPI && (
        <>
          <h4 className="font-bold text-green-400">Transaction Success!</h4>
          <p className="text-sm">
            <span className="font-semibold">TxId:</span>&nbsp;
            <a
              href={`https://${network === "mainnet" ? "" : network + "."}cexplorer.io/tx/${tx.txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline break-all"
            >
              {tx.txId}
            </a>
          </p>
        </>
      )}
    </div>
    {/* Right Container: ADA Donation Address */}
    <div className="flex-none text-right mt-4 md:mt-0 md:pr-8">
      <p className="text-sm mb-1">ADA Donation Address:</p>
      <p className="text-xs break-all text-center"> CHANGE IT FOR PROD! addr_test1qrarqhmklnhwcw3q0zm6sgm3g3l7pua0y36sql9k5ru8dsucglsked5f5yrcf9e9xgxjgmt7xk52knh8h0dgayc00arqlh7g60</p>
    </div>
  </div>
</footer>
    </div>
  );
  };
  
  export default Home;
  