// types/global.d.ts

interface CardanoWallet {
    enable: () => Promise<void>;
    getChangeAddress: () => Promise<string>;
    // Add other methods and properties as needed
  }
  
  interface Window {
    cardano?: {
      [walletName: string]: CardanoWallet;
    };
  }
  
  export {}; // Ensure this file is treated as a module
  