import { useEffect, useState } from "react";

declare global {
  interface Window {
    cardano?: Record<string, any>;
  }
}

interface WalletConnectorProps {
  onWalletAPI: (walletAPI: any, walletName: string) => void;
}

interface WalletDetails {
  [key: string]: {
    api: string;
    label: string;
    logo: string;
  };
}

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
  yoroi: {
    api: "yoroi",
    label: "Yoroi",
    logo: "/logos/yoroi.svg",
  },
};

const WalletConnector: React.FC<WalletConnectorProps> = ({ onWalletAPI }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const enableWallet = async (walletKey: string) => {
    const walletInfo = walletDetails[walletKey];
    const walletApiName = walletInfo.api;

    if (walletApiName && window.cardano?.[walletApiName]) {
      try {
        const walletAPI = await window.cardano[walletApiName].enable();
        localStorage.setItem("connectedWallet", walletKey); // Save wallet name to localStorage
        onWalletAPI(walletAPI, walletKey); // Pass wallet API and name to parent
        setErrorMessage(null);
      } catch (err) {
        console.error("Error enabling wallet:", err);
        setErrorMessage("Failed to connect to the wallet. Please try again.");
      }
    } else {
      setErrorMessage("Selected wallet is not available.");
    }
  };

  return (
    <div className="wallet-connector">
      <div className="wallet-grid grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.keys(walletDetails).map((walletKey) => {
          const { api, label, logo } = walletDetails[walletKey];
          const isAvailable = !!window.cardano?.[api];

          return (
            <div
              key={walletKey}
              onClick={() => isAvailable && enableWallet(walletKey)}
              className={`wallet-card bg-white rounded-lg shadow hover:shadow-lg hover:cursor-pointer transition p-4 flex flex-col items-center justify-center ${
                !isAvailable ? 'unavailable' : ''
              }`}
            >
              <img src={logo} alt={label} className="w-12 h-12 mb-2" />
              <span className="text-gray-700 font-medium">{label}</span>
              {!isAvailable && (
                <span className="text-xs text-red-500 mt-1">Not Installed</span>
              )}
            </div>
          );
        })}
      </div>
      {errorMessage && <p className="text-red-500 text-sm mt-4">{errorMessage}</p>}
    </div>
  );
};

export default WalletConnector;
