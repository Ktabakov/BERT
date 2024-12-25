import React, { useState, useEffect } from "react";
import Head from "next/head";
import NavBar from "../components/NavBar";
import { claimTokens } from "../public/walletActions"; 
import WalletConnector from '../components/WalletConnector';
import { calculateCountdown } from "../public/walletActions";
import ErrorPopup from '../components/ErrorPopup'; 
import { 
    network 
  } from '../common/network';

  const CLAIM_WINDOW = 20; // 1 minute claim window
  const CYCLE_DURATION = 580; // 9 minutes cycle duration
  const TimeBeginContract = Math.floor(new Date(Date.UTC(2024, 11, 25, 13, 45, 0)).getTime());
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
            const positionInCycle = calculateCountdown(TimeBeginContract);
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
      setIsConnected(true); // IMPORTANT: Set isConnected to true after connecting
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

  return (
    <div>
      <Head>
        <title>Whitepaper - Bert</title>
      </Head>

      <NavBar 
        isConnected={isConnected}
        walletAddress={walletAddress || ""}
        onConnect={handleConnect}
        onClaimTokens={handleClaimTokens}
        isInClaimWindow={isInClaimWindow}
      />

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
       <main className="content-container flex-grow flex flex-col justify-between p-5">
    <div className="w-full max-w-screen-1x1 flex-grow h-[80vh] bg-white shadow-lg border rounded-lg overflow-hidden">
        <iframe
        src="/Whitepaper/Whitepaper.pdf#zoom=120"
        className="w-full h-full"
        style={{ border: "none" }}
        title="Whitepaper PDF"
        />
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
      <p className="text-xs break-all text-center">addr1q9muvfmvxaxnhsm9ekek86jj4n7pan0n3038rv9cnjgg0cxwrmddhxvxma08n5gnke2g3c2wtvy6mske29sp78jw5a8qfdt3ze</p>
    </div>
  </div>
</footer>
    </div>
  );
};

export default Whitepaper;
