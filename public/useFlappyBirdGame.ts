import { useEffect, useRef, useState } from "react";

// Types for game objects
interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  bottomHeight: number;
  scored: boolean;
}

interface Coin {
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
}

// Constants
const GRAVITY = 0.25;
const FLAP = -7.5;
const PIPE_WIDTH = 90;
const PIPE_SPACING = 250;
const BIRD_WIDTH = 50;
const BIRD_HEIGHT = 50;
const COIN_SIZE = 100;
const ROTATION_SPEED = 0.005;

// How often to spawn pipes in terms of frames
// ~100 frames at ~60fps is ~1.66 seconds. Adjust as needed
const PIPE_SPAWN_FRAMES = 100;

export function useFlappyBirdGame(canvasRef: React.RefObject<HTMLCanvasElement>, isPaused: boolean, autoStart: boolean) {
  const requestIdRef = useRef<number>();
  
  // State refs
  const [highScore, setHighScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);

  const birdYRef = useRef<number>(0);
  const birdVelocityRef = useRef<number>(0);
  const pipesRef = useRef<Pipe[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const gameOverRef = useRef<boolean>(false);
  const gameStartedRef = useRef<boolean>(false);

  const coinRotationStepRef = useRef<number>(0);
  const framesRef = useRef<number>(0); // Count frames

  // Assets
  let birdImage: HTMLImageElement;
  let pipeTop: HTMLImageElement;
  let pipeBottom: HTMLImageElement;
  let background: HTMLImageElement;
  let coinImage: HTMLImageElement;

  if (typeof window !== "undefined") {
    birdImage = new Image();
    birdImage.src = "/assets/flappybird.png";

    pipeTop = new Image();
    pipeTop.src = "/assets/top.png";

    pipeBottom = new Image();
    pipeBottom.src = "/assets/bottom.png";

    background = new Image();
    background.src = "/assets/flappybirdbg1.png";

    coinImage = new Image();
    coinImage.src = "/assets/Coin.png";
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resetGame() {
      const c = canvasRef.current;
      if (!c) return;
      const { width, height } = c;

      birdYRef.current = height / 3;
      birdVelocityRef.current = 0;
      pipesRef.current = [];
      coinsRef.current = [];
      setCurrentScore(0);
      gameOverRef.current = false;
      gameStartedRef.current = false;
      coinRotationStepRef.current = 0;
      framesRef.current = 0;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === " ") {
        if (!gameStartedRef.current && !gameOverRef.current) {
          startGame();
        } else if (gameOverRef.current) {
          startGame();
        } else {
          birdVelocityRef.current = FLAP;
        }
      }
    }

    background.onload = () => {
        console.log("Background image loaded!");
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) initializeGame();
        }
      };

    window.addEventListener("keydown", handleKeyDown);

    function handleResize() {
      const c = canvasRef.current;
      if (!c) return;
      c.width = 360;
      c.height = 640;

      if (!gameStartedRef.current && !gameOverRef.current && ctx) {
        drawStartScreen(ctx, c);
      }
    }
    window.addEventListener("resize", handleResize);

    // Initialize the game
    const initializeGame = () => {
        canvas.width = 360;
        canvas.height = 640;
        drawStartScreen(ctx, canvas);
    };

    initializeGame();

    function startGame() {
      resetGame();
      gameStartedRef.current = true;
      animate(); // Start the loop
    }

    function animate() {
      if (isPaused || !gameStartedRef.current) {
        // If paused or not started, just request next frame without updating state
        requestIdRef.current = requestAnimationFrame(animate);
        return;
      }

      const c = canvasRef.current;
      if (!c) return;
      const context = c.getContext("2d");
      if (!context) return;

      updateGameState(c);
      draw(context, c);

      if (!gameOverRef.current) {
        requestIdRef.current = requestAnimationFrame(animate);
      } else {
        drawGameOverScreen(context, c);
      }
    }

    function updateGameState(canvas: HTMLCanvasElement) {
      framesRef.current++;

      // Gravity
      birdVelocityRef.current += GRAVITY;
      birdYRef.current += birdVelocityRef.current;

      // Spawn pipes every PIPE_SPAWN_FRAMES frames
      if (framesRef.current % PIPE_SPAWN_FRAMES === 0) {
        createPipe(canvas);
      }

      movePipesAndCoins();
      checkCoinCollection();

      // Check collisions after movement
      if (checkCollisions(canvas)) {
        gameOverRef.current = true;
        return;
      }

      updateScore();

      // Rotate coin a bit each frame
      coinRotationStepRef.current += ROTATION_SPEED;
      if (coinRotationStepRef.current >= 1) coinRotationStepRef.current = 0;
    }

    function draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground(ctx, canvas);
      drawBird(ctx);
      drawPipes(ctx);
      drawCoins(ctx);
    }

    function drawStartScreen(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground(ctx, canvas);
      ctx.font = "bold 30px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'black';
      ctx.textBaseline = 'middle';
      ctx.fillText("Press Space to Start", canvas.width / 2, canvas.height / 2);
    }

    function drawGameOverScreen(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 50px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 10;

      ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 40);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px Arial';
      ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 20);

      ctx.fillStyle = '#ffff00';
      ctx.font = '30px Arial';
    }

    function drawBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    }

    function drawBird(ctx: CanvasRenderingContext2D) {
      ctx.drawImage(birdImage, 100, birdYRef.current, BIRD_WIDTH, BIRD_HEIGHT);
    }

    function drawPipes(ctx: CanvasRenderingContext2D) {
      for (const pipe of pipesRef.current) {
        ctx.drawImage(pipeTop, pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.drawImage(pipeBottom, pipe.x, pipe.bottomY, PIPE_WIDTH, pipe.bottomHeight);
      }
    }

    function drawCoins(ctx: CanvasRenderingContext2D) {
      const scaleX = Math.abs(Math.cos(coinRotationStepRef.current * Math.PI * 2));
      const halfSize = COIN_SIZE / 2;

      for (const coin of coinsRef.current) {
        if (!coin.collected) {
          ctx.save();
          ctx.translate(coin.x + halfSize, coin.y + halfSize);
          ctx.scale(scaleX, 1);
          ctx.drawImage(coinImage, -halfSize, -halfSize, COIN_SIZE, COIN_SIZE);
          ctx.restore();
        }
      }
    }

    function createPipe(canvas: HTMLCanvasElement) {
      const pipeHeight = Math.random() * (canvas.height - PIPE_SPACING - 100) + 50;
      const bottomY = pipeHeight + PIPE_SPACING;
      pipesRef.current.push({
        x: canvas.width,
        topHeight: pipeHeight,
        bottomY,
        bottomHeight: canvas.height - bottomY,
        scored: false
      });

      // 50% chance to spawn a coin
      if (Math.random() > 0.5) {
        coinsRef.current.push({
          x: canvas.width + PIPE_WIDTH / 2 - COIN_SIZE / 2,
          y: pipeHeight + PIPE_SPACING / 2 - COIN_SIZE / 2,
          width: COIN_SIZE,
          height: COIN_SIZE,
          collected: false
        });
      }
    }

    function movePipesAndCoins() {
      for (const pipe of pipesRef.current) {
        pipe.x -= 2;
      }
      pipesRef.current = pipesRef.current.filter(pipe => pipe.x + PIPE_WIDTH > 0);

      for (const coin of coinsRef.current) {
        coin.x -= 2;
      }
      coinsRef.current = coinsRef.current.filter(coin => coin.x + coin.width > 0 && !coin.collected);
    }

    function checkCollisions(canvas: HTMLCanvasElement): boolean {
      if (birdYRef.current < 0 || birdYRef.current + BIRD_HEIGHT > canvas.height) {
        return true;
      }

      const birdLeft = 100;
      const birdRight = birdLeft + BIRD_WIDTH;
      const birdTop = birdYRef.current;
      const birdBottom = birdYRef.current + BIRD_HEIGHT;

      for (const pipe of pipesRef.current) {
        const withinPipeX = birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH;
        const withinPipeY = birdTop < pipe.topHeight || birdBottom > pipe.bottomY;
        if (withinPipeX && withinPipeY) return true;
      }

      return false;
    }

    function checkCoinCollection() {
      const birdLeft = 100;
      const birdRight = birdLeft + BIRD_WIDTH;
      const birdTop = birdYRef.current;
      const birdBottom = birdYRef.current + BIRD_HEIGHT;

      for (const coin of coinsRef.current) {
        if (!coin.collected) {
          const coinLeft = coin.x;
          const coinRight = coin.x + coin.width;
          const coinTop = coin.y;
          const coinBottom = coin.y + coin.height;

          if (birdRight > coinLeft && birdLeft < coinRight && birdBottom > coinTop && birdTop < coinBottom) {
            coin.collected = true;
            setCurrentScore((prevScore) => {
              const newScore = prevScore + 5;      
              setHighScore((prevHighScore) => Math.max(prevHighScore, newScore));       
              return newScore;
            });
          }
        }
      }
    }

    function updateScore() {
      for (const pipe of pipesRef.current) {
        if (!pipe.scored && pipe.x + PIPE_WIDTH < 100) {
          setCurrentScore((prevScore) => {
            const newScore = prevScore + 1;      
            setHighScore((prevHighScore) => Math.max(prevHighScore, newScore));       
            return newScore;
          });
          pipe.scored = true;
        }
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, [canvasRef, isPaused, autoStart]);

  return { highScore, currentScore };
}
