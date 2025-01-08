// components/ClaimWindowStatus.tsx

import React, { useState, useEffect } from "react";

interface ClaimWindowStatusProps {
  isInClaimWindow: boolean;
  timeRemaining: number;
}

const ClaimWindowStatus: React.FC<ClaimWindowStatusProps> = ({
  isInClaimWindow,
  timeRemaining,
}) => {
  const [currentReward, setCurrentReward] = useState<string>("0");

  const formattedTime = new Date(timeRemaining * 1000)
    .toISOString()
    .substr(14, 5);

  function calculateRewardInTime(): number {
    // Define the contract start time (Unix timestamp in seconds)
    const TimeBeginContract: number = 1736073600000 / 1000; // Adjust as needed

    const HALVING_PERIOD: number = 7_776_000; // 3 months in seconds
    const MAX_HALVINGS: number = 2; // Limit halvings to 2 times
    const BASE_REWARD: number = 10_000; // Initial reward in tokens

    // Get current time in seconds
    const TimeNow: number = Math.floor(Date.now() / 1000);

    // Calculate the elapsed time in seconds
    const timeElapsed: number = TimeNow - TimeBeginContract;

    // Determine halving steps based on elapsed time, but limit to MAX_HALVINGS
    let halvingSteps: number = Math.floor(timeElapsed / HALVING_PERIOD);
    halvingSteps = Math.min(halvingSteps, MAX_HALVINGS); // Cap halvings at MAX_HALVINGS

    // Calculate reward based on halving steps
    const reward: number = BASE_REWARD / 2 ** halvingSteps;

    // Ensure the reward doesn't fall below a minimum value
    return reward < 1 ? 1 : reward;
  }

  const fetchDynamicReward = () => {
    const reward = calculateRewardInTime();
    setCurrentReward(reward.toString());
  };

  useEffect(() => {
    fetchDynamicReward();

    // Optionally, set up an interval to update the reward periodically
    const interval = setInterval(fetchDynamicReward, 60000); // Update every minute

    return () => clearInterval(interval); // Clean up the interval on unmount
  }, [isInClaimWindow, timeRemaining]); // Dependencies can be adjusted as needed

  return (
    <div className="claim-window-status-container p-4 md:p-6 lg:p-8">
      <h2
        className={`claim-window-status-title text-base md:text-3xl font-bold mb-4 ${
          isInClaimWindow ? "inside-window" : "outside-window"
        }`}
      >
        {isInClaimWindow ? "Inside Claim Window" : "Outside Claim Window"}
      </h2>
      <p
        className={`claim-window-status-time text-lg md:text-3xl mb-4 font-bold ${
          isInClaimWindow ? "inside-window text-green-500" : "outside-window text-red-500"
        }`}
      >
        Current Reward: {currentReward} BERT
      </p>
      <p
        className={`claim-window-status-time text-lg md:text-3xl font-bold ${
          isInClaimWindow ? "inside-window text-green-700" : "outside-window text-red-700"
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
