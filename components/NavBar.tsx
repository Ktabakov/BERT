import React from "react";
import Image from 'next/image'

interface NavBarProps {
  isConnected: boolean;
  walletAddress?: string; // Add wallet address as a prop
  onConnect: () => void; // Now just toggles main.tsx's modal
  onClaimTokens: () => void;
  isInClaimWindow: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ isConnected, walletAddress, onConnect, onClaimTokens, isInClaimWindow }) => {
    const truncateAddress = (address: string) => {
        if (address.length > 10) {
          return `${address.slice(0, 6)}...${address.slice(-6)}`;
        }
        return address;
      };

      const isButtonDisabled = !isConnected || !isInClaimWindow;

    return (
        <nav className="navContainer">
  <div className="flex items-center justify-between px-4 w-full">
    {/* Left Links */}
    <div className="flex items-center space-x-2">
      <a href="/" className="page-link text-base md:text-lg font-medium">Home</a>
      <a href="/whitepaper" className="page-link text-base md:text-lg font-medium">Whitepaper</a>
    </div>

  {/* Centered Title */}
  <div className="absolute left-1/2 transform -translate-x-1/2">
    <h1 className="gameTitle">Bert</h1>
   </div>


    {/* Right Buttons */}
    <div className="flex items-center space-x-3">
      <button
        onClick={onClaimTokens}
        className={`btn btn-claim ${isButtonDisabled ? "blurred-button" : ""}`}
        disabled={isButtonDisabled}
      >
        Claim Tokens
      </button>
      {!isConnected ? (
        <button onClick={onConnect} className="btn btn-connect">
          Connect Wallet
        </button>
      ) : (
        <div className="wallet-bubble flex items-center space-x-2 rounded-full border border-gray-300 p-1 pr-2 shadow hover:bg-gray-100">
          <Image
            src="/logos/transparentTestBertBubbleTiny(1).png"
            alt="wallet avatar"
            className="rounded-full"
            width={65}
            height={65}
          />
          <span className="text-sm text-gray-700">
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
