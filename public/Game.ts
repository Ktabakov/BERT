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
const GRAVITY = 0.7;
const FLAP = -11;
const PIPE_WIDTH = 90;
const PIPE_SPACING = 230;
const BIRD_WIDTH = 50;
const BIRD_HEIGHT = 50;
const COIN_SIZE = 100;

// How long between pipe spawns (in milliseconds). ~1.66s => 1667ms
const PIPE_SPAWN_INTERVAL = 1000;

// Horizontal speed (pixels per "60fps" frame). We'll scale it by (deltaTime/16.67).
const HORIZONTAL_SPEED = 4;

// Rotation speed of coin (complete flip from scale 1 to 0 to 1). 1 = full cycle.
const ROTATION_SPEED = 0.01;

// A small constant representing the "ideal frame" for scaling calculations (about 60fps).
const IDEAL_FRAME = 16.67; // ms

export function Game(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  isPaused: boolean,
  autoStart: boolean
) {
  const requestIdRef = useRef<number | null>(null);

  // State
  const [highScore, setHighScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);

  // Refs to track game state
  const birdYRef = useRef<number>(0);
  const birdVelocityRef = useRef<number>(0);
  const pipesRef = useRef<Pipe[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const gameOverRef = useRef<boolean>(false);
  const gameStartedRef = useRef<boolean>(false);

  // For coin rotation
  const coinRotationRef = useRef<number>(0);

  // Track time for spawning pipes
  const pipeSpawnTimerRef = useRef<number>(0);

  // We'll track the previous timestamp for time-based movement
  const lastTimeRef = useRef<number>(0);

  // Bird animation frames
  let birdImages: HTMLImageElement[] = [];
  let pipeTop: HTMLImageElement;
  let pipeBottom: HTMLImageElement;
  let background: HTMLImageElement;
  let coinImage: HTMLImageElement;

  if (typeof window !== "undefined") {
    const birdUp = new Image();
    birdUp.src = "/assets/redbird-upflap.png";

    const birdMid = new Image();
    birdMid.src = "/assets/redbird-midflap.png";

    const birdDown = new Image();
    birdDown.src = "/assets/redbird-downflap.png";

    birdImages = [birdUp, birdMid, birdDown];

    pipeTop = new Image();
    pipeTop.src = "/assets/TopTiny.png";

    pipeBottom = new Image();
    pipeBottom.src = "/assets/BottomTiny.png";

    background = new Image();
    background.src = "/assets/background-day.png";

    coinImage = new Image();
    coinImage.src = "/assets/CoinTiny.png";
  }

  // Current bird frame index (0=up, 1=mid, 2=down). We'll keep the quick flap code.
  const currentBirdFrameRef = useRef<number>(0);

  // Load high score from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedHighScore = localStorage.getItem("highScore");
      if (storedHighScore) {
        setHighScore(parseInt(storedHighScore, 10));
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Utility to ensure an image is fully loaded
    const loadImage = (img: HTMLImageElement): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () =>
            reject(new Error(`Failed to load image: ${img.src}`));
        }
      });
    };

    // Load all assets then init
    const loadAssets = async () => {
      try {
        await Promise.all([
          ...birdImages.map((img) => loadImage(img)),
          loadImage(pipeTop),
          loadImage(pipeBottom),
          loadImage(background),
          loadImage(coinImage),
        ]);
        initializeGame();
      } catch (error) {
        console.error("Error loading assets:", error);
      }
    };

    loadAssets();

    function initializeGame() {
      if (!canvasRef.current) return;
      if (!ctx) return;
      // Fixed canvas size
      canvasRef.current.width = 360;
      canvasRef.current.height = 640;
      drawStartScreen(ctx, canvasRef.current);
    }

    function resetGame() {
      if (!canvasRef.current) return;
      const { width, height } = canvasRef.current;
      birdYRef.current = height / 3;
      birdVelocityRef.current = 0;
      pipesRef.current = [];
      coinsRef.current = [];
      setCurrentScore(0);
      gameOverRef.current = false;
      gameStartedRef.current = false;
      coinRotationRef.current = 0;
      pipeSpawnTimerRef.current = 0;
      currentBirdFrameRef.current = 0;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === " ") {
        if (!gameStartedRef.current && !gameOverRef.current) {
          startGame();
        } else if (gameOverRef.current) {
          startGame();
        } else {
          birdVelocityRef.current = FLAP;
          flapAnimation();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    // For resizing the overall container if needed
    function handleResize() {
      if (!canvasRef.current) return;
      canvasRef.current.width = 360;
      canvasRef.current.height = 640;

      // If we're not started and not over, draw start screen
      if (!gameStartedRef.current && !gameOverRef.current && ctx) {
        drawStartScreen(ctx, canvasRef.current);
      }
    }
    window.addEventListener("resize", handleResize);

    // Start game
    function startGame() {
      resetGame();
      gameStartedRef.current = true;
      lastTimeRef.current = performance.now(); // reset our time-based reference
      animate();
    }

    // This function is exposed to the parent for "click/tap" input
    function handleUserInput() {
      if (!gameStartedRef.current && !gameOverRef.current) {
        startGame();
      } else if (gameOverRef.current) {
        startGame();
      } else {
        birdVelocityRef.current = FLAP;
        flapAnimation();
      }
    }

    // Quick flap animation
    function flapAnimation() {
      currentBirdFrameRef.current = 1;
      setTimeout(() => {
        currentBirdFrameRef.current = 2;
        setTimeout(() => {
          currentBirdFrameRef.current = 0;
        }, 170);
      }, 170);
    }

    // Main game loop
    function animate(currentTime?: number) {
      if (!gameStartedRef.current) {
        // If game hasn't started, just schedule the next frame
        requestIdRef.current = requestAnimationFrame(animate);
        return;
      }
      if (isPaused) {
        // If paused, just schedule the next frame
        requestIdRef.current = requestAnimationFrame(animate);
        return;
      }
      if (!canvasRef.current) return;
      const context = canvasRef.current.getContext("2d");
      if (!context) return;

      // Compute deltaTime
      const now = currentTime ?? performance.now();
      const deltaTime = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Update the game state
      updateGameState(canvasRef.current, deltaTime);

      // Render
      draw(context, canvasRef.current);

      if (!gameOverRef.current) {
        requestIdRef.current = requestAnimationFrame(animate);
      } else {
        drawGameOverScreen(context, canvasRef.current);
      }
    }

    function updateGameState(canvas: HTMLCanvasElement, deltaTime: number) {
      // Scale factor relative to ~60fps = 16.67ms per frame
      const scale = deltaTime / IDEAL_FRAME;

      // Gravity
      birdVelocityRef.current += GRAVITY * scale;
      birdYRef.current += birdVelocityRef.current * scale;

      // Update pipe spawn timer
      pipeSpawnTimerRef.current += deltaTime;
      if (pipeSpawnTimerRef.current >= PIPE_SPAWN_INTERVAL) {
        pipeSpawnTimerRef.current -= PIPE_SPAWN_INTERVAL;
        createPipe(canvas);
      }

      // Move pipes & coins
      movePipesAndCoins(scale);

      // Rotate coin (0 -> 1 is a full cycle in our usage)
      coinRotationRef.current += ROTATION_SPEED * scale;
      if (coinRotationRef.current >= 1) {
        coinRotationRef.current = 0;
      }

      // Check collisions
      if (checkCollisions(canvas)) {
        gameOverRef.current = true;
        return;
      }

      // Check coin collection
      checkCoinCollection();

      // Update score if we pass pipes
      updateScore();
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
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "black";
      ctx.textBaseline = "middle";

      ctx.fillText(
        "Press Space to Start",
        canvas.width / 2,
        canvas.height / 2
      );
    }

    function drawGameOverScreen(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
      ctx.fillStyle = "#ffcc00";
      ctx.font = "bold 50px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 10;

      ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 40);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px Arial";
      ctx.fillText(
        "Press Space to Restart",
        canvas.width / 2,
        canvas.height / 2 + 20
      );
    }

    function drawBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    }

    function drawBird(ctx: CanvasRenderingContext2D) {
      const currentImage = birdImages[currentBirdFrameRef.current];
      // Draw the bird at a fixed X (100) and current birdY
      if (currentImage.complete) {
        ctx.drawImage(currentImage, 100, birdYRef.current, BIRD_WIDTH, BIRD_HEIGHT);
      }
    }

    function drawPipes(ctx: CanvasRenderingContext2D) {
      for (const pipe of pipesRef.current) {
        ctx.drawImage(pipeTop, pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.drawImage(pipeBottom, pipe.x, pipe.bottomY, PIPE_WIDTH, pipe.bottomHeight);
      }
    }

    function drawCoins(ctx: CanvasRenderingContext2D) {
      // We'll flip the coin horizontally using scale
      const scaleX = Math.abs(Math.cos(coinRotationRef.current * Math.PI * 2));
      const halfSize = COIN_SIZE / 2;

      for (const coin of coinsRef.current) {
        if (!coin.collected) {
          ctx.save();
          ctx.translate(coin.x + halfSize, coin.y + halfSize);
          ctx.scale(scaleX, 1); // Horizontal flip effect
          ctx.drawImage(coinImage, -halfSize, -halfSize, COIN_SIZE, COIN_SIZE);
          ctx.restore();
        }
      }
    }

    function createPipe(canvas: HTMLCanvasElement) {
      // Random top pipe height
      const pipeHeight = Math.random() * (canvas.height - PIPE_SPACING - 100) + 50;
      const bottomY = pipeHeight + PIPE_SPACING;
      pipesRef.current.push({
        x: canvas.width,
        topHeight: pipeHeight,
        bottomY,
        bottomHeight: canvas.height - bottomY,
        scored: false,
      });

      // 50% chance to spawn a coin
      if (Math.random() > 0.5) {
        coinsRef.current.push({
          x: canvas.width + PIPE_WIDTH / 2 - COIN_SIZE / 2,
          y: pipeHeight + PIPE_SPACING / 2 - COIN_SIZE / 2,
          width: COIN_SIZE,
          height: COIN_SIZE,
          collected: false,
        });
      }
    }

    function movePipesAndCoins(scale: number) {
      // Move them to the left based on scale
      for (const pipe of pipesRef.current) {
        pipe.x -= HORIZONTAL_SPEED * scale;
      }
      // Filter out pipes that have scrolled offscreen
      pipesRef.current = pipesRef.current.filter((pipe) => pipe.x + PIPE_WIDTH > 0);

      for (const coin of coinsRef.current) {
        coin.x -= HORIZONTAL_SPEED * scale;
      }
      // Filter out coins that have scrolled offscreen or are collected
      coinsRef.current = coinsRef.current.filter(
        (coin) => coin.x + coin.width > 0 && !coin.collected
      );
    }

    function checkCollisions(canvas: HTMLCanvasElement): boolean {
      // Check top/bottom boundaries
      if (birdYRef.current < 0 || birdYRef.current + BIRD_HEIGHT > canvas.height) {
        return true;
      }

      const birdLeft = 100;
      const birdRight = birdLeft + BIRD_WIDTH;
      const birdTop = birdYRef.current;
      const birdBottom = birdYRef.current + BIRD_HEIGHT;

      // Pipe collision
      for (const pipe of pipesRef.current) {
        const withinPipeX = birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH;
        const withinPipeY = birdTop < pipe.topHeight || birdBottom > pipe.bottomY;
        if (withinPipeX && withinPipeY) {
          return true;
        }
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

          if (
            birdRight > coinLeft &&
            birdLeft < coinRight &&
            birdBottom > coinTop &&
            birdTop < coinBottom
          ) {
            // Collect coin
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
        // Score +1 for passing each pipe, only once
        if (!pipe.scored && pipe.x + PIPE_WIDTH < 100) {
          pipe.scored = true;
          setCurrentScore((prevScore) => {
            const newScore = prevScore + 1;
            setHighScore((prevHighScore) => {
              const updatedHighScore = Math.max(prevHighScore, newScore);
              if (typeof window !== "undefined") {
                localStorage.setItem("highScore", updatedHighScore.toString());
              }
              return updatedHighScore;
            });
            return newScore;
          });
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

  // Provide a stable reference for user input (tap/click/space)
  const handleUserInput = () => {
    // Fire a "keydown" with key " "
    const spaceEvent = new KeyboardEvent("keydown", { key: " " });
    window.dispatchEvent(spaceEvent);
  };

  return {
    highScore,
    currentScore,
    handleUserInput,
  };
}
