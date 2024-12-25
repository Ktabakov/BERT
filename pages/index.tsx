// Home.tsx
import type { NextPage } from 'next';
import { useState, useEffect } from "react";
import NavBar from '../components/NavBar';  
import FlappyBirdGame from "../components/Game";
import InstructionsWindow from "../components/InstructionsWindow"; 
import ClaimWindowStatus from '../components/ClaimWindowStatus';
import ErrorPopup from '../components/ErrorPopup'; 
import WalletConnector from '../components/WalletConnector';
import { claimTokens } from '../public/walletActions'; 
import { isMobile } from 'react-device-detect'; 
import { network } from '../common/network';

const Home: NextPage = () => {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false); // New state
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
  
      if (!isMobile && savedWallet && window.cardano?.[savedWallet]) {
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
      setConnectedWallet(walletName); // Track the connected wallet
      console.log(`Connected to wallet: ${walletName}`);
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
      } else if (err.message && err.message.includes('wallet returned 0 utxos')) {
        console.log("Insufficient ADA in the user's wallet.");
        setError("Your wallet does not have enough ADA to claim tokens. Please add some ADA to your wallet and try again.");
      } else if (err.message && err.message.includes('Wallet API is not set.')) {
        console.log("No wallet connected");
        setError("Connect a wallet before claiming tokens.");
      } else if (err.message && err.message.includes('No more tokens to claim. Game Over!')) {
        console.log("No more tokens to claim. Game Over!");
        setError("No more tokens to claim. Game Over!");
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

  const openInstructions = () => {
    setIsInstructionsOpen(true);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navigation Bar */}
      {!isMobile && (
        <NavBar
          isConnected={!!walletAPI}
          walletAddress={walletAddress || ""}
          onConnect={handleConnect}
          onClaimTokens={handleClaimTokens} 
          isInClaimWindow={isInClaimWindow}
          onHowToPlay={openInstructions} // Pass the handler to NavBar
        />
      )}
    
      {/* Instructions Window */}
      {isInstructionsOpen && (
        <InstructionsWindow onClose={() => setIsInstructionsOpen(false)} />
      )}
    
      {/* Wallet Modal */}
      {!isMobile && isWalletModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-center mb-4">
              Select Your Wallet
            </h3>
            <WalletConnector onWalletAPI={handleWalletConnect} />
            <button
              onClick={toggleWalletModal}
              className="mt-6 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition w-full"
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
      <main className="flex-grow flex flex-col items-center justify-center">
        <FlappyBirdGame
          onClaimWindowStatusChange={(isInWindow) => setIsInClaimWindow(isInWindow)}
        />

      </main>
    
      {/* Footer */}
      {!isMobile && (
        <footer className="footer bg-gray-900 text-white p-4">
          <div className="flex justify-between items-center w-full px-4">
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
              <p className="text-xs break-all text-center">
                addr1q9muvfmvxaxnhsm9ekek86jj4n7pan0n3038rv9cnjgg0cxwrmddhxvxma08n5gnke2g3c2wtvy6mske29sp78jw5a8qfdt3ze
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Home;
