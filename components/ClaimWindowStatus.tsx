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
  const [daysUntilNextHalving, setDaysUntilNextHalving] = useState<string>("");

  const formattedTime = new Date(timeRemaining * 1000)
    .toISOString()
    .substr(14, 5);

  // Calculate the reward (existing code)
  function calculateRewardInTime(): number {
    const TimeBeginContract: number = 1736073600000 / 1000;
    const HALVING_PERIOD: number = 7_776_000;
    const BASE_REWARD: number = 10_000;

    const TimeNow: number = Math.floor(Date.now() / 1000);
    const timeElapsed: number = TimeNow - TimeBeginContract;

    let halvingSteps: number = Math.floor(timeElapsed / HALVING_PERIOD);
    halvingSteps = Math.min(halvingSteps, 2);

    const reward: number = BASE_REWARD / 2 ** halvingSteps;
    return reward < 1 ? 1 : reward;
  }

  // Calculate the days until next halving or display "No More Halvings"
  function calculateDaysUntilNextHalving(): string {
    const TimeBeginContract = 1736073600000 / 1000;
    const HALVING_PERIOD = 7776000;
    const MAX_HALVINGS = 2;

    const TimeNow = Math.floor(Date.now() / 1000);
    const timeElapsed = TimeNow - TimeBeginContract;

    let halvingSteps = Math.floor(timeElapsed / HALVING_PERIOD);
    halvingSteps = Math.min(halvingSteps, MAX_HALVINGS);

    if (halvingSteps >= MAX_HALVINGS) {
      return "No More Halvings";
    }

    const nextHalvingTime = TimeBeginContract + (halvingSteps + 1) * HALVING_PERIOD;
    const remainingTime = nextHalvingTime - TimeNow;
    const remainingDays = Math.ceil(remainingTime / (60 * 60 * 24));

    return `${remainingDays} days`;
  }

  // Fetch dynamic reward and days until next halving
  const fetchDynamicData = () => {
    const reward = calculateRewardInTime();
    const daysLeft = calculateDaysUntilNextHalving();
    setCurrentReward(reward.toString());
    setDaysUntilNextHalving(daysLeft);
  };

  useEffect(() => {
    fetchDynamicData();

    // Optionally, set up an interval to update the data periodically
    const interval = setInterval(fetchDynamicData, 60000); // Update every minute

    return () => clearInterval(interval); // Clean up the interval on unmount
  }, [isInClaimWindow, timeRemaining]);

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
        className={`claim-window-status-time text-lg md:text-3xl font-bold ${
          isInClaimWindow ? "inside-window text-green-700" : "outside-window text-red-700"
        }`}
      >
        {isInClaimWindow
          ? `${formattedTime} remaining`
          : `${formattedTime} until next window`}
      </p>
      <p
        className={`claim-window-status-time text-lg md:text-2xl mb-4 font-bold ${
          isInClaimWindow ? "inside-window text-green-500" : "outside-window text-red-500"
        }`}
      >
        Current Reward: {currentReward} BERT
      </p>
      <p
        className={`claim-window-status-time text-lg md:text-2xl mb-4 font-bold ${
          isInClaimWindow ? "inside-window text-green-500" : "outside-window text-red-500"
        }`}
      >
        Days until next halving: {daysUntilNextHalving}
      </p>
    </div>
  );
};

export default ClaimWindowStatus;
