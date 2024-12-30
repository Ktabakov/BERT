import React, { useEffect, useState } from "react";
import Image from 'next/image';

/**
 * CIP-30: Provides the global "cardano" object if wallets are injecting it.
 * https://cips.cardano.org/cips/cip30/
 */
declare global {
  interface Window {
    cardano?: Record<string, any>;
  }
}

interface WalletConnectorProps {
  onWalletAPI: (walletAPI: any, walletName: string) => void;
}

// Define which wallets you support and how to display them.
interface WalletDetails {
  [key: string]: {
    api: string;
    label: string;
    logo: string;
  };
}

// Example wallet definitions. Feel free to add or remove as needed.
const walletDetails: WalletDetails = {
  eternl: {
    api: "eternl",
    label: "Eternl",
    logo: "/logos/eternl.svg",
  },
  nami: {
    api: "nami",
    label: "Nami",
    logo: "/logos/nami.svg",
  },
  atomic: {
    api: "atomic",
    label: "atomic",
    logo: "/logos/atomic.png",
  },
  yoroi: {
    api: "yoroi",
    label: "Yoroi",
    logo: "/logos/yoroi.svg",
  },
};

const WalletConnector: React.FC<WalletConnectorProps> = ({ onWalletAPI }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Main function to enable (connect) a wallet using CIP-30.
   */
  const enableWallet = async (walletKey: string) => {
    const walletInfo = walletDetails[walletKey];
    const walletApiName = walletInfo.api;

    // If the wallet isn't injected in the browser, show an error.
    if (!window?.cardano?.[walletApiName]) {
      setErrorMessage(`Selected wallet (${walletKey}) is not available.`);
      return;
    }

    try {
      // Enable the wallet's CIP-30 API.
      const walletAPI = await window.cardano[walletApiName].enable();

      // Optional: store the walletKey in localStorage if you want to remember which wallet was used.
      localStorage.setItem("connectedWallet", walletKey);

      // Pass the API object back to the parent component so it can perform additional actions.
      onWalletAPI(walletAPI, walletKey);

      // Clear any previous error messages.
      setErrorMessage(null);
    } catch (error) {
      console.error("Error enabling wallet:", error);
      setErrorMessage("Failed to connect to the wallet. Please try again.");
    }
  };

  return (
    <div className="wallet-connector">
      <div className="wallet-grid grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.keys(walletDetails).map((walletKey) => {
          const { api, label, logo } = walletDetails[walletKey];
          // If window.cardano.api exists, that wallet is installed.
          const isAvailable = !!window.cardano?.[api];

          return (
            <div
              key={walletKey}
              onClick={() => isAvailable && enableWallet(walletKey)}
              className={`wallet-card bg-white rounded-lg shadow hover:shadow-lg hover:cursor-pointer transition p-4 flex flex-col items-center justify-center ${
                isAvailable ? "" : "opacity-50 cursor-not-allowed"
              }`}
            >
              <Image
                src={logo}
                alt={label}
                className="w-12 h-12 mb-2"
                style={{ objectFit: "contain" }}
              />
              <span className="text-gray-700 font-medium">{label}</span>
              {!isAvailable && (
                <span className="text-xs text-red-500 mt-1">Not Installed</span>
              )}
            </div>
          );
        })}
      </div>

      {errorMessage && (
        <p className="text-red-500 text-sm mt-4 text-center">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default WalletConnector;
