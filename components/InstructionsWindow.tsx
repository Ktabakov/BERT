// InstructionsWindow.tsx
import React from "react";

interface InstructionsWindowProps {
  onClose: () => void;
}

const InstructionsWindow: React.FC<InstructionsWindowProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-xl"
      onClick={onClose} // Close when clicking on the overlay
    >
      <div
        className="instructions-window-container text-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h3 className="instructions-title text-xl font-bold mb-4">
          How to Get Started
        </h3>
        <ol className="instructions-list text-xl">
          <li>Read the whitepaper to understand the project.</li>
          <li>
            Download a wallet -{' '}
            <a
              href="https://namiwallet.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Nami
            </a>
            ,{' '}
            <a
              href="https://yoroi-wallet.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Yoroi
            </a>
            ,{' '}
            <a
              href="https://eternl.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Eternl
            </a>
             ,{' '}
             <a
              href="https://typhonwallet.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
              >
              Typhon Wallet
             </a>
             , or{' '}
             <a
             href="https://www.gerowallet.io/"
             target="_blank"
             rel="noopener noreferrer"
             className="text-blue-500 hover:underline"
             >
              Gero Wallet
             </a>
            .
          </li>
          <li>Create and secure your wallet.</li>
          <li>Connect your wallet to the application.</li>
          <li>Start playing the game and claim tokens!</li>
        </ol>
        <p className="text-red-500">
          Important!
        </p>
        <p className="text-red-500">
        Each time you claim tokens, you receive the current dynamic reward and lock some ADA by creating a new UTXO, for others to claim.
        </p>
        <button
          onClick={onClose}
          className="instructions-close-button"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default InstructionsWindow;
