// components/ClaimWindowStatus.tsx

import React from "react";

interface ClaimWindowStatusProps {
  isInClaimWindow: boolean;
  timeRemaining: number;
}

const ClaimWindowStatus: React.FC<ClaimWindowStatusProps> = ({
  isInClaimWindow,
  timeRemaining,
}) => {
  const formattedTime = new Date(timeRemaining * 1000)
    .toISOString()
    .substr(14, 5);

  return (
    <div className="claim-window-status-container">
      <h2
        className={`claim-window-status-title text-base md:text-lg ${
          isInClaimWindow ? "inside-window" : "outside-window"
        }`}
      >
        {isInClaimWindow ? "Inside Claim Window" : "Outside Claim Window"}
      </h2>
      <p
        className={`claim-window-status-time text-lg md:text-xl ${
          isInClaimWindow ? "inside-window" : "outside-window"
        }`}
      >
        {isInClaimWindow
          ? `${formattedTime} remaining`
          : `${formattedTime} until next window`}
      </p>
    </div>
  );
};

export default ClaimWindowStatus;
