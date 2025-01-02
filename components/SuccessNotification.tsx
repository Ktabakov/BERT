// src/components/SuccessNotification.tsx
import React, { useEffect } from 'react';
interface SuccessNotificationProps {
  message: string;
  onClose: () => void;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // 3 seconds

    // Cleanup the timer on component unmount
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="success-notification">
      <p>{message}</p>
    </div>
  );
};

export default SuccessNotification;
