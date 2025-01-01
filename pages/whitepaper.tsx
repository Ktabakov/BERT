import React, { useState, useEffect } from "react";
import Head from "next/head";
import NavBar from "../components/NavBar";
import { claimTokens, calculateCountdown } from "../public/walletActions"; 
import WalletConnector from '../components/WalletConnector';
import ErrorPopup from '../components/ErrorPopup'; 
import InstructionsWindow from "../components/InstructionsWindow"; 
import { network } from '../common/network';

const CLAIM_WINDOW = 20; // 20 seconds claim window (adjust as needed)
const CYCLE_DURATION = 580; // 580 seconds cycle duration

const Whitepaper: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAPI, setWalletAPI] = useState<undefined | any>(undefined);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tx, setTx] = useState({ txId: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false); 
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null); // Track connected wallet name
  const [isInClaimWindow, setIsInClaimWindow] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [error, setError] = useState<string | null>(null); // New state for error messages
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);

  useEffect(() => {
    const reconnectWallet = async () => {
      const savedWallet = localStorage.getItem("connectedWallet");

      if (typeof window !== 'undefined' && savedWallet && window.cardano?.[savedWallet]) {
        try {
          const wAPI = await window.cardano[savedWallet].enable();
          const address = await wAPI.getChangeAddress(); // Get wallet address
          setWalletAPI(wAPI);
          setWalletAddress(address);

          const updateClaimWindowStatus = () => {
            const positionInCycle = calculateCountdown();
            setIsInClaimWindow(positionInCycle < CLAIM_WINDOW);
            setCountdown(
              positionInCycle < CLAIM_WINDOW
                ? CLAIM_WINDOW - positionInCycle // Remaining time inside the claim window
                : CYCLE_DURATION - positionInCycle // Time until the next claim window
            );
          };

          updateClaimWindowStatus();
          // Set interval for real-time updates every second
          const interval = setInterval(updateClaimWindowStatus, 1000);

          setConnectedWallet(savedWallet);
          setIsConnected(true); 

          return () => clearInterval(interval); 
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
      setIsConnected(true); 
      setConnectedWallet(walletName);
      setIsWalletModalOpen(false);
    }
  };

  const toggleWalletModal = () => {
    setIsWalletModalOpen(!isWalletModalOpen);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    localStorage.removeItem("connectedWallet");
    setWalletAddress('');
  };


  const handleClaimTokens = async () => {
    try {
      await claimTokens(walletAPI, setIsLoading, setTx);
    } catch (err: any) { 
      if (err.info === 'User declined to sign the transaction.') {
        console.log("Transaction was canceled by user.");
        // Optionally, show a toast notification here
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
    <div className="flex flex-col min-h-screen bg-[url('/logos/backgroundCrypto4Tiny.webp')] bg-cover bg-center"> {/* Add your background image here */}
      <Head>
        <title>Whitepaper - Bert</title>
      </Head>

      {/* Navigation Bar */}
      <NavBar 
        isConnected={isConnected}
        walletAddress={walletAddress || ""}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect} 
        onClaimTokens={handleClaimTokens}
        isInClaimWindow={isInClaimWindow}
        onHowToPlay={openInstructions}
        // highScore and currentScore are omitted as they're not tracked on this page
      />

      {/* Instructions Window */}
      {isInstructionsOpen && (
        <InstructionsWindow onClose={() => setIsInstructionsOpen(false)} />
      )}

      {/* Wallet Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-center mb-4">
              Select Your Wallet
            </h3>
            <p className="text-lg text-center">Currently, only CIP-30-compatible browser wallets are supported.</p>
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
      <main className="flex-grow mt-16 p-5"> {/* Added mt-16 to account for fixed navbar height */}
        <div className="w-full max-w-screen-xl mx-auto flex-grow h-[80vh] bg-white shadow-lg border rounded-lg overflow-hidden">
        <div className="absolute left-1/3 transform -translate-x-1/2 bg-gray-800 bg-opacity-75 text-white px-4 py-2 rounded">
        <a href="/Whitepaper/Whitepaper.pdf" download className="underline">
        Download
       </a>
      </div>
          <iframe
            src="/Whitepaper/Whitepaper.pdf#zoom=120"
            width="100%"
            height="800px"
            className="w-full h-full"
            style={{ border: "none" }}
            title="Whitepaper PDF"
          />
        </div>
      </main>

       {/* Footer (Minimized on Mobile) */}
      <footer className="footer bg-gray-900 text-white p-1 md:p-3 text-xs md:text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-2 md:px-4">
          {/* Left Container: Transaction Success Message */}
          <div className="flex-1 text-left pl-2 md:pl-4">
            {tx.txId && walletAPI && (
              <>
                <h4 className="font-bold text-green-400">
                  Transaction Success!
                </h4>
                <p>
                  <span className="font-semibold">TxId:</span>&nbsp;
                  <a
                    href={`${network + "."}cexplorer.io/tx/${tx.txId}`}
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
          <div className="flex-none text-center md:text-right mt-2 md:mt-0 md:pr-4">
            <p className="mb-1">ADA Donation Address:</p>
            <div className="flex items-center justify-center md:justify-end">
              <p className="break-all mt-2">
                addr1q9muvfmvxaxnhsm9ekek86jj4n7pan0n3038rv9cnjgg0cxwrmddhxvxma08n5gnke2g3c2wtvy6mske29sp78jw5a8qfdt3ze
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Whitepaper;
