// components/NavBar.tsx
import React, { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'; 
import Link from 'next/link';

interface NavBarProps {
  isConnected: boolean;
  walletAddress?: string; // Optional wallet address
  onConnect: () => void;
  onDisconnect: () => void; // New prop for disconnecting
  onClaimTokens: () => void;
  isInClaimWindow: boolean;
  onHowToPlay: () => void;
  highScore?: number; // Optional
  currentScore?: number; 
  isTransactionInProgress: boolean;
}

const NavBar: React.FC<NavBarProps> = ({
  isConnected,
  walletAddress,
  onConnect,
  onDisconnect,
  onClaimTokens,
  isInClaimWindow,
  onHowToPlay,
  highScore,
  currentScore,
  isTransactionInProgress
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // References for the mobile menu and the menu button
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const truncateAddress = (address: string) => {
    if (address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-6)}`;
    }
    return address;
  };

  const isButtonDisabled = !isConnected || !isInClaimWindow || isTransactionInProgress;

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      // If menu is not open, no need to do anything
      if (!isMobileMenuOpen) return;

      // If the click is on the button, toggle the menu (handled by button's onClick)
      if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
        return;
      }

      // If the click is inside the menu, do nothing
      if (menuRef.current && menuRef.current.contains(event.target as Node)) {
        return;
      }

      // Otherwise, close the menu
      setIsMobileMenuOpen(false);
    };

    // Attach the listeners
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    // Cleanup the listeners on unmount
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="bg-gradient-to-r from-green-500 to-green-700 text-white fixed top-0 left-0 w-full z-50 shadow-lg rounded-b-lg">
      <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        {/* Left: Desktop links */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/"
            className="px-3 py-2 rounded-md text-base font-medium hover:bg-green-600 transition-all"
          >
            Home
          </Link>
          <Link
            href="/whitepaper"
            className="px-3 py-2 rounded-md text-base font-medium hover:bg-green-600 transition-all"
          >
            Whitepaper
          </Link>
          <button
            onClick={onHowToPlay}
            className="px-3 py-2 rounded-md text-base font-medium bg-green-600 hover:bg-green-700 transition-all"
          >
            How to Participate
          </button>
        </div>

        {/* Center: Title + Optional Scores */}
        <div className="flex flex-col items-center flex-grow">
          <Link href="/" className="flex items-center mb-1 md:mb-0">
            <span className="text-xl md:text-4xl">Bert</span>
          </Link>
          {(highScore !== undefined && currentScore !== undefined) && (
            <div className="flex space-x-4">
              <div className="text-sm md:text-base">
                <span className="font-semibold text-sm md:text-xl">High Score:</span> {highScore}
              </div>
              <div className="text-sm md:text-base">
                <span className="font-semibold text-sm md:text-xl">Current Score:</span> {currentScore}
              </div>
            </div>
          )}
        </div>

        {/* Right: Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={onClaimTokens}
            className={`px-4 py-2 rounded-md text-base font-medium ${
              isButtonDisabled
                ? "bg-blue-500 cursor-not-allowed opacity-50"
                : "bg-green-600 hover:bg-green-700"
            } text-white transition-all`}
            disabled={false}
          >
            Claim Tokens
          </button>
          {!isConnected ? (
            <button
              onClick={onConnect}
              className="px-4 py-2 rounded-md text-base font-medium bg-green-600 hover:bg-green-700 text-white transition-all"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={onDisconnect}
              className="flex items-center space-x-2 rounded-full border border-green-500 p-1 pr-2 shadow hover:bg-green-600 transition-all"
            >
              <Image
                src="/logos/transparentTestBertBubbleTiny(1).png" 
                alt="Wallet Avatar"
                className="rounded-full"
                width={35}
                height={35}
              />
              <span className="text-base text-white font-roboto text-sm">
                {truncateAddress(walletAddress || "Unknown")}
              </span>
            </button> 
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            onClick={toggleMobileMenu}
            ref={buttonRef} // Attach the buttonRef to the menu button
            className="text-white hover:text-gray-200 focus:outline-none transition-all"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={menuRef} // Attach the menuRef to the mobile menu container
          id="mobile-menu"
          className="absolute top-full left-0 w-full bg-gradient-to-r from-green-500 to-green-700 shadow-md"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600 transition-all"
            >
              Home
            </Link>
            <Link
              href="/whitepaper"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600 transition-all"
            >
              Whitepaper
            </Link>
            <button
              onClick={() => {
                onHowToPlay();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-green-600 hover:bg-green-700 text-white transition-all"
            >
              How to Participate
            </button>
            <button
              onClick={() => {
                onClaimTokens();
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                isButtonDisabled
                  ? "bg-blue-500 cursor-not-allowed opacity-50"
                  : "bg-green-600 hover:bg-green-700"
              } text-white transition-all`}
              disabled={isButtonDisabled}
            >  {isTransactionInProgress ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Claim Tokens"
            )}
            </button>
            {!isConnected ? (
              <button
                onClick={() => {
                  onConnect();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-green-600 hover:bg-green-700 text-white transition-all"
              >
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={onDisconnect}
                className="w-full flex items-center space-x-2 rounded-full border border-green-500 p-2 shadow hover:bg-green-600 transition-all"
              >
                <Image
                  src="/logos/transparentTestBertBubbleTiny(1).png"
                  alt="Wallet Avatar"
                  className="rounded-full"
                  width={25}
                  height={25}
                />
                <span className="text-sm text-white">
                  {truncateAddress(walletAddress || "Unknown")}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
