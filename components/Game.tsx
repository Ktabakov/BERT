// components/FlappyBirdGame.tsx
import React, { useRef, useEffect } from "react";
import { useFlappyBirdGame } from "../public/useFlappyBirdGame";

interface FlappyBirdGameProps {
  autoStart?: boolean;
  onUserInput: () => void;
  onScoreUpdate: (score: number) => void;
}

const FlappyBirdGame: React.FC<FlappyBirdGameProps> = ({
  autoStart = true,
  onUserInput,
  onScoreUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Our custom hook
  const { handleUserInput, currentScore } = useFlappyBirdGame(
    canvasRef,
    false, // isPaused
    autoStart
  );

  // Whenever currentScore changes, notify parent
  useEffect(() => {
    onScoreUpdate(currentScore);
  }, [currentScore, onScoreUpdate]);

  return (
    <div className="flex justify-center items-center w-full h-full">
      <div
        id="canvas-container"
        onTouchStart={() => {
          handleUserInput();
          onUserInput();
        }}
        className="
          relative
          border border-black
          rounded-lg
          shadow-lg
          bg-yellow-100
          flex
          items-center
          justify-center
          p-2
          w-full
          max-w-xs sm:max-w-sm md:max-w-[360px]
          max-h-xs sm:max-h-sm md:max-h-[640px]
          h-full
          aspect-[9/13]
          mx-auto
        "
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default FlappyBirdGame;
