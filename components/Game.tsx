// components/FlappyBirdGame.tsx

import React, { useRef, useEffect } from "react";
import { useFlappyBirdGame } from "../public/useFlappyBirdGame"; 

/** Props for the FlappyBirdGame component */
interface FlappyBirdGameProps {
  autoStart?: boolean;
  onUserInput: () => void;
  onScoreUpdate: (score: number) => void; // New prop for score updates
}

/**
 * FlappyBirdGame Component
 * Ensures the canvas is fully responsive using Tailwind utilities.
 */
const FlappyBirdGame: React.FC<FlappyBirdGameProps> = ({
  autoStart = true,
  onUserInput,
  onScoreUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Utilize your custom hook
  const { handleUserInput, currentScore, highScore } = useFlappyBirdGame(
    canvasRef,
    /* isPaused */ false,
    autoStart
  );

  // Effect to update scores in Home.tsx
  useEffect(() => {
    onScoreUpdate(currentScore);
  }, [currentScore, onScoreUpdate]);

  return (
    <div
      id="canvas-container"
      onTouchStart={() => {
        handleUserInput();
        onUserInput();
      }}
 
      className="
        relative
        w-full
        max-w-sm       /* Restrict max width on smaller screens */
        sm:max-w-md
        md:max-w-lg
        lg:max-w-xl
        h-72           /* ~18rem tall on mobile */
        sm:h-80        /* ~20rem on small screens */
        md:h-96        /* 24rem on medium screens */
        lg:h-[30rem]   /* ~30rem on large screens, adjust as needed */
        mx-auto
        border border-black
        rounded-lg
        shadow-lg
        bg-yellow-100
      "
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
};

export default FlappyBirdGame;
