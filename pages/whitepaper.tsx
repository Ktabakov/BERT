import React, { useState, useEffect } from "react";
import Head from "next/head";
import NavBar from "../components/NavBar";
import { claimTokens } from "../public/walletActions"; 
import WalletConnector from '../components/WalletConnector';
import { calculateCountdown } from "../public/walletActions";

const CLAIM_WINDOW = 60; // 1 minute claim window
const CYCLE_DURATION = 540; // 9 minutes cycle duration
const TimeBeginContract = Math.floor(new Date(Date.UTC(2024, 11, 8, 13, 45, 0)).getTime()); 
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

  const handleClaimTokens = () => {
    claimTokens(walletAPI, setIsLoading, setTx);
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
        <main className="content-container flex-grow flex justify-center items-center p-4">
        <div className="w-full max-w-screen-2xl h-[90vh] bg-white shadow-lg border rounded-lg overflow-hidden">
            <iframe
            src="/Whitepaper/Whitepaper.pdf#zoom=130"
            className="w-full h-full"
            style={{ border: "none" }}
            title="Whitepaper PDF"
            />
        </div>
        </main>
    </div>
  );
};

export default Whitepaper;
