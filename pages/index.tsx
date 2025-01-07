import type { NextPage } from 'next';
import { useState, useEffect } from "react";
import Image from "next/image";
import NavBar from '../components/NavBar';
import FlappyBirdGame from "../components/Game"; // Use correct path
import InstructionsWindow from "../components/InstructionsWindow"; 
import ClaimWindowStatus from '../components/ClaimWindowStatus';
import ErrorPopup from '../components/ErrorPopup'; 
import WalletConnector from '../components/WalletConnector';
import { claimTokens, calculateCountdown } from '../public/walletActions';
import { network } from '../common/network';
import SuccessNotification from '../components/SuccessNotification';

const CLAIM_WINDOW = 20; 
const CYCLE_DURATION = 600; 

const Home: NextPage = () => {
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tx, setTx] = useState({ txId: '' });
  const [walletAPI, setWalletAPI] = useState<any>(undefined);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isInClaimWindow, setIsInClaimWindow] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isTransactionInProgress, setIsTransactionInProgress] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reconnect wallet on mount
  useEffect(() => {
    const reconnectWallet = async () => {
      const savedWallet = localStorage.getItem("connectedWallet");
      if (savedWallet && (window as any).cardano?.[savedWallet]) {
        try {
          const api = await (window as any).cardano[savedWallet].enable();
          const address = await api.getChangeAddress();
          setWalletAPI(api);
          setWalletAddress(address);
          setConnectedWallet(savedWallet);
          setIsConnected(true);
          console.log(`Reconnected to wallet: ${savedWallet}`);
        } catch (err) {
          console.error("Failed to reconnect wallet:", err);
          localStorage.removeItem("connectedWallet");
        }
      }
    };
    reconnectWallet();
  }, []);

  // Manage Claim Window Status
  useEffect(() => {
    const updateClaimWindowStatus = () => {
      const position = calculateCountdown();
      const insideWindow = position < CLAIM_WINDOW;
      setIsInClaimWindow(insideWindow);

      const remaining = insideWindow
        ? CLAIM_WINDOW - position
        : CYCLE_DURATION - position;
      setTimeRemaining(remaining);
    };

    updateClaimWindowStatus();
    const interval = setInterval(updateClaimWindowStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Wallet Connection
  const handleWalletConnect = async (api: any, walletName: string) => {
    if (api) {
      localStorage.setItem("connectedWallet", walletName);
      setWalletAPI(api);
      const address = await api.getChangeAddress();
      setWalletAddress(address);
      setConnectedWallet(walletName);
      setIsConnected(true);
      console.log(`Connected to wallet: ${walletName}`);
      setIsWalletModalOpen(false);
    }
  };

  // Toggle Wallet Modal
  const toggleWalletModal = () => {
    setIsWalletModalOpen(!isWalletModalOpen);
  };

  // Handle Claim Tokens
  const handleClaimTokens = async () => {
    try {
      setIsTransactionInProgress(true);
      await claimTokens(walletAPI, setIsLoading, setTx);
      setShowSuccess(false);
      setTimeout(() => setShowSuccess(true), 0);
    } catch (err: any) {
      if (err.info === 'User declined to sign the transaction.') {
        console.log("Transaction canceled by user.");
      } else if (err.message && err.message.includes('wallet returned 0 utxos')) {
        console.log("Insufficient ADA in the user's wallet.");
        setError("Your wallet does not have enough ADA to claim tokens.");
      } else if (err.message && err.message.includes('Wallet API is not set.')) {
        console.log("No wallet connected");
        setError("Connect a wallet before claiming tokens.");
      } else if (err.message && err.message.includes('No more tokens to claim. Game Over!')) {
        console.log("No more tokens to claim. Game Over!");
        setError("No more tokens to claim. Game Over!");
      } else {
        setError("Something went wrong. Please try again.");
        console.log(err.message);
      }
    } finally {
       setIsTransactionInProgress(false);
    }
  };

  // Close Error Popup
  const closeErrorPopup = () => setError(null);

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    localStorage.removeItem("connectedWallet"); 
    setWalletAddress('');
  };

  // Open Wallet Modal
  const handleConnect = () => {
    setIsWalletModalOpen(true);
  };

  // Open Instructions Window
  const openInstructions = () => {
    setIsInstructionsOpen(true);
  };

  // Callback to update current score from the game
  const updateCurrentScore = (score: number) => {
    setCurrentScore(score);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("highScore", score.toString());
    }
  };

  // Load high score from localStorage on mount
  useEffect(() => {
    const storedHighScore = localStorage.getItem("highScore");
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Navigation Bar */}
      <NavBar
        isConnected={isConnected}
        walletAddress={walletAddress || ""}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect} 
        onClaimTokens={handleClaimTokens}
        isInClaimWindow={isInClaimWindow}
        onHowToPlay={openInstructions}
        highScore={highScore}
        currentScore={currentScore}
        isTransactionInProgress={isTransactionInProgress}
      />

      {/* Instructions Window */}
      {isInstructionsOpen && (
        <InstructionsWindow onClose={() => setIsInstructionsOpen(false)} />
      )}

      {/* Wallet Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold text-center mb-4">Select Your Wallet</h3>
            <p className="text-lg text-center">Only CIP-30-compatible browser wallets are supported.</p>
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
      {error && <ErrorPopup message={error} onClose={closeErrorPopup} />}

      {/* Main Content */}
      <main className="flex-grow content-container p-2 md:p-4 mt-16">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full h-full">
           {/* Left Column: BERT Mascot (Hidden on Mobile) */}
          <div className="hidden md:flex items-center justify-center">
            <Image
              src="/logos/transparentTestBertBubbleTiny(1).png"
              alt="BERT Mascot"
              className="w-512 h-512 md:w-512 md:h-512 object-contain"
              width={512}
              height={512}
            />
          </div>

          {showSuccess && (
           <SuccessNotification
          message="Transaction Successful!"
          onClose={handleCloseSuccess}
           />
           )}
          {/* Middle Column: Game */}
          <div className="flex-grow flex justify-center items-center w-full">
            <FlappyBirdGame
              onUserInput={() => {/* optional */}}
              onScoreUpdate={updateCurrentScore}
            />
          </div>

          {/* Right Column: Claim Window Status (Hidden on Mobile) */}
          <div className="hidden md:flex flex-col items-end justify-start p-2 md:p-4">
            <ClaimWindowStatus
              isInClaimWindow={isInClaimWindow}
              timeRemaining={timeRemaining}
            />
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="footer bg-gray-900 text-white p-2 md:p-4 text-xs md:text-sm flex-shrink-0">
        <div className="flex flex-col md:flex-row items-center w-full px-2 md:px-4">
          {/* Left: Transaction Success Message */}
          <div className="flex-1 text-left pl-2 md:pl-4">
            {tx.txId && walletAPI && (
              <>
                <h4 className="font-bold text-green-400">Transaction Success!</h4>
                <p>
                  <span className="font-semibold">TxId:</span>&nbsp;
                  <a
                    href={`https://${network}.cexplorer.io/tx/${tx.txId}`}
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

          {/* Middle: Twitter (X) Link */}
          <div className="flex-none mx-auto mt-2 md:mt-0">
            <a
              href="https://x.com/CardanoBert" // Replace with your actual Twitter (X) URL
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
              aria-label="Follow us on Twitter"
            >
              {/* Using SVG directly for the Twitter (X) icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
              <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
              </svg>
            </a>
          </div>

          {/* Right: Donation Address */}
          <div className="flex-1 text-center md:text-right mt-2 md:mt-0 md:pr-4">
            <p className="mb-1">ADA Donation Address:</p>
            <div className="flex items-center justify-center md:justify-end">
              <p className="break-all mr-2">
                addr1q9muvfmvxaxnhsm9ekek86jj4n7pan0n3038rv9cnjgg0cxwrmddhxvxma08n5gnke2g3c2wtvy6mske29sp78jw5a8qfdt3ze
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
