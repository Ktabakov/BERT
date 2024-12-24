import React, { createContext, useContext, useState, useEffect } from "react";

interface WalletContextProps {
  isConnected: boolean;
  walletAPI: any;
  walletAddress: string | null;
  connectedWallet: string | null;
  connectWallet: (api: any, walletName: string) => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAPI, setWalletAPI] = useState<any>(undefined);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);

  useEffect(() => {
    const reconnectWallet = async () => {
      const savedWallet = localStorage.getItem("connectedWallet");

      if (savedWallet && typeof window !== "undefined" && window.cardano?.[savedWallet]) {
        try {
          const wAPI = await window.cardano[savedWallet].enable();
          const address = await wAPI.getChangeAddress();
          setWalletAPI(wAPI);
          setWalletAddress(address);
          setConnectedWallet(savedWallet);
          setIsConnected(true);
        } catch (err) {
          console.error("Failed to reconnect wallet:", err);
          localStorage.removeItem("connectedWallet");
        }
      }
    };

    reconnectWallet();
  }, []);

  const connectWallet = async (api: any, walletName: string) => {
    localStorage.setItem("connectedWallet", walletName);
    setWalletAPI(api);
    const address = await api.getChangeAddress();
    setWalletAddress(address);
    setConnectedWallet(walletName);
    setIsConnected(true);
  };

  const disconnectWallet = () => {
    localStorage.removeItem("connectedWallet");
    setWalletAPI(undefined);
    setWalletAddress(null);
    setConnectedWallet(null);
    setIsConnected(false);
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAPI,
        walletAddress,
        connectedWallet,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextProps => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
