import React, { useRef, CSSProperties, useState, useEffect } from "react";
import { useFlappyBirdGame } from "../public/useFlappyBirdGame"; 
// ^ Adjust path if needed. For Next.js in /public, you might do "../public/useFlappyBirdGame".
import ClaimWindowStatus from "./ClaimWindowStatus"; 
// ^ Adjust path if needed
import { calculateCountdown } from "../public/walletActions"; 
// ^ Adjust path if needed
import Image from "next/image";
import { isMobile } from "react-device-detect";

const CLAIM_WINDOW = 20;
const CYCLE_DURATION = 580;

// Example date/time in UTC: 25 Dec 2024, 13:45
const TimeBeginContract = Math.floor(
  new Date(Date.UTC(2024, 11, 25, 13, 45, 0)).getTime()
);

/** Style for the game container */
const containerStyle: CSSProperties = {
  position: "relative",
  width: "360px",
  height: "640px",
  border: "1px solid #000",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  backgroundColor: "#ffffdd",
};

/** Props for the FlappyBirdGame component */
interface FlappyBirdGameProps {
  autoStart?: boolean;
  onClaimWindowStatusChange: (isInWindow: boolean) => void;
}

/**
 * FlappyBirdGame Component
 * @param autoStart Automatically starts the game upon loading.
 * @param onClaimWindowStatusChange Callback to inform parent about claim window status.
 */
const FlappyBirdGame: React.FC<FlappyBirdGameProps> = ({
  autoStart = true,
  onClaimWindowStatusChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Utilize our updated custom hook
  const { highScore, currentScore, handleUserInput } = useFlappyBirdGame(
    canvasRef,
    isPaused,
    autoStart
  );

  // State for claim window
  const [isInClaimWindow, setIsInClaimWindow] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Effect to handle claim window status updates
  useEffect(() => {
    const interval = setInterval(() => {
      const position = calculateCountdown(TimeBeginContract);
      const insideWindow = position < CLAIM_WINDOW;
      setIsInClaimWindow(insideWindow);

      const remaining = insideWindow
        ? CLAIM_WINDOW - position
        : CYCLE_DURATION - position;
      setTimeRemaining(remaining);

      onClaimWindowStatusChange(insideWindow);
    }, 1000);

    return () => clearInterval(interval);
  }, [onClaimWindowStatusChange]);

  /**
   * Toggle the paused state of the game.
   */
  const togglePause = () => setIsPaused((prev) => !prev);

  // **MOBILE VIEW**
  if (isMobile) {
    return (
      <div className="game-container flex justify-center items-center">
        <div
          id="canvas-container"
          style={containerStyle}
          onClick={handleUserInput}
          onTouchStart={handleUserInput}
        >
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
        </div>
      </div>
    );
  }

  // **DESKTOP VIEW**
  return (
    <div className="content-container h-[calc(100vh-4rem)] flex-grow flex flex-col">
      <div className="grid grid-cols-3 grid-rows-6 w-full h-full flex-grow">
        {/* Left Column: BERT Mascot Image */}
        <div className="col-start-1 row-start-4 flex justify-center flex-grow items-center">
          <Image
            src="/logos/transparentTestBertBubbleTiny(1).png"
            alt="BERT Mascot"
            className="w-65 h-65 object-contain"
            width={650}
            height={650}
          />
        </div>

        {/* Middle Column: Scores and Game Canvas */}
        <div className="col-start-2 row-start-1 flex flex-col items-center space-y-2">
          <p className="highScore text-xl font-bold">High Score: {highScore}</p>
          <p className="score text-lg">Current Score: {currentScore}</p>
          <div
            id="canvas-container"
            style={containerStyle}
            onClick={handleUserInput}
            onTouchStart={handleUserInput}
          >
            <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
          </div>
          <button
            onClick={togglePause}
            className="p-2 mt-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        </div>

        {/* Right Column: Claim Window Status */}
        <div className="col-start-3 row-start-2 flex justify-end items-end">
          <ClaimWindowStatus
            isInClaimWindow={isInClaimWindow}
            timeRemaining={timeRemaining}
          />
        </div>
      </div>
    </div>
  );
};

export default FlappyBirdGame;
