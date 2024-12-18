import React from "react";

interface ClaimWindowStatusProps {
  isInClaimWindow: boolean;
  timeRemaining: number;
}

const ClaimWindowStatus: React.FC<ClaimWindowStatusProps> = ({ isInClaimWindow, timeRemaining }) => {
  const formattedTime = new Date(timeRemaining * 1000)
    .toISOString()
    .substr(14, 5);

  return (
    <div style={{ textAlign: "center", margin: "1rem 0" }}>
      <h2
        style={{
          color: isInClaimWindow ? "green" : "red",
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginBottom: "0.5rem",
        }}
      >
        {isInClaimWindow ? "Inside Claim Window" : "Outside Claim Window"}
      </h2>
      <p
        style={{
          fontSize: "1.5rem",
          color: isInClaimWindow ? "green" : "red",
          fontWeight: "bold",
          margin: 0,
        }}
      >
        {isInClaimWindow
          ? `${formattedTime} remaining`
          : `${formattedTime} until next window`}
      </p>
    </div>
  );
};

export default ClaimWindowStatus;
