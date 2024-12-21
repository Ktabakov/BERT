// components/ErrorPopup.tsx

import React, { useEffect } from 'react';

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => {
  // Handle Escape key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener for keydown
    document.addEventListener('keydown', handleEsc);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Handle click outside the popup container
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    onClose();
  };

  // Prevent click events inside the popup container from propagating to the overlay
  const handlePopupClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={handleOverlayClick} // Close when clicking on the overlay
    >
      <div
        className="error-popup-container"
        onClick={handlePopupClick} // Prevent closing when clicking inside the popup
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="close-button"
          aria-label="Close"
        >
          &times;
        </button>
        {/* Error Message */}
        <h2 className="error-title">Oops!</h2>
        <p className="error-message">{message}</p>
      </div>
    </div>
  );
};

export default ErrorPopup;
