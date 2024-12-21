import React, { useRef, CSSProperties, useState, useEffect } from "react";
import { useFlappyBirdGame } from "../public/useFlappyBirdGame";
import ClaimWindowStatus from "./ClaimWindowStatus";
import { calculateCountdown } from "../public/walletActions";

const CLAIM_WINDOW = 60;
const CYCLE_DURATION = 540;
const TimeBeginContract = Math.floor(new Date(Date.UTC(2024, 11, 8, 13, 45, 0)).getTime());

const containerStyle: CSSProperties = {
  position: "relative",
  width: "360px",
  height: "640px",
  border: "1px solid #000",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  backgroundColor: "#ffffdd",
};

interface FlappyBirdGameProps {
  autoStart?: boolean;
  onClaimWindowStatusChange: (isInWindow: boolean) => void;
}

const FlappyBirdGame: React.FC<FlappyBirdGameProps> = ({
  autoStart = true,
  onClaimWindowStatusChange
}) => {
const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const { highScore, currentScore } = useFlappyBirdGame(canvasRef, isPaused, autoStart);

  const [positionInCycle, setPositionInCycle] = useState<number>(0);
  const [isInClaimWindow, setIsInClaimWindow] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const position = calculateCountdown(TimeBeginContract);
      setPositionInCycle(position);

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

  const togglePause = () => setIsPaused((prev) => !prev);

  return (
    <div className="content-container h-[calc(100vh-4rem)] flex-grow flex flex-col" >
      {/* 
        Create a grid with 3 columns and 8 rows.
        We'll place all elements in row 4 to center them vertically:
        - BERT (left) at col 1, row 4
        - Score + Canvas (middle) at col 2, row 4
        - Claim Window (right) at col 3, row 4
      */}
     <div className="grid grid-cols-3 grid-rows-6 w-full h-full flex-grow">
        {/* BERT Image in the left column, row 4 */}
        <div className="col-start-1 row-start-4 flex justify-center flex-grow items-center">
          <img
            src="/logos/TransparentTestBertBubble.png"
            alt="BERT Mascot"
            className="w-65 h-65 object-contain"
          />
        </div>

        {/* Scores and Canvas in the middle column, row 4 */}
        <div className="col-start-2 row-start-1 flex flex-col items-center space-y-2">
          <p className="highScore">High Score: {highScore}</p>
          <p className="score">Current Score: {currentScore}</p>
          <div id="canvas-container" style={containerStyle}>
            <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }}></canvas>
          </div>
        </div>

        {/* Claim Window Status in the right column, row 4 */}
        <div className="col-start-3 row-start-2 flex justify-end items-end">
          <ClaimWindowStatus isInClaimWindow={isInClaimWindow} timeRemaining={timeRemaining} />
        </div>
      </div>
    </div>
  );
};

export default FlappyBirdGame;
