// NavBar.tsx
import React from "react";
import Image from 'next/image'

interface NavBarProps {
  isConnected: boolean;
  walletAddress?: string; // Add wallet address as a prop
  onConnect: () => void; // Now just toggles main.tsx's modal
  onClaimTokens: () => void;
  isInClaimWindow: boolean;
  onHowToPlay: () => void; // New prop for opening InstructionsWindow
}

const NavBar: React.FC<NavBarProps> = ({
  isConnected,
  walletAddress,
  onConnect,
  onClaimTokens,
  isInClaimWindow,
  onHowToPlay, 
}) => {
  const truncateAddress = (address: string) => {
    if (address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-6)}`;
    }
    return address;
  };

  const isButtonDisabled = !isConnected || !isInClaimWindow;

  return (
    <nav className="navContainer bg-gray-800 text-white p-4">
      <div className="flex items-center justify-between w-full relative">
        {/* Left Links */}
        <div className="flex items-center space-x-4">
          <a href="/" className="page-link text-base md:text-lg font-medium hover:text-gray-400 transition">
            Home
          </a>
          <a href="/whitepaper" className="page-link text-base md:text-lg font-medium hover:text-gray-400 transition">
            Whitepaper
          </a>
          {/* How to Play Button */}
          <button
            onClick={onHowToPlay}
            className="btn btn-instructions text-base md:text-lg font-medium bg-green-500 hover:bg-green-600 transition px-3 py-1 rounded"
          >
            How to Participate
          </button>
        </div>

        {/* Centered Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="gameTitle text-xl md:text-2xl font-bold">Bert</h1>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onClaimTokens}
            className={`btn btn-claim ${
              isButtonDisabled ? "blurred-button cursor-not-allowed opacity-50" : "bg-blue-500 hover:bg-blue-600"
            } text-white px-4 py-2 rounded transition`}
            disabled={isButtonDisabled}
          >
            Claim Tokens
          </button>
          {!isConnected ? (
            <button
              onClick={onConnect}
              className="btn btn-connect bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="wallet-bubble flex items-center space-x-2 rounded-full border border-gray-300 p-1 pr-2 shadow hover:bg-gray-700 transition">
              <Image
                src="/logos/transparentTestBertBubbleTiny(1).png"
                alt="wallet avatar"
                className="rounded-full"
                width={40}
                height={40}
              />
              <span className="text-sm text-gray-200">
                {truncateAddress(walletAddress || "Unknown")}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
