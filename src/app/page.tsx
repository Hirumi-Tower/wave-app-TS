'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';

type Difficulty = 'hard' | 'veryhard' | 'impossible';

export default function WavePuzzle() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [wave1, setWave1] = useState<number>(50);
  const [wave2, setWave2] = useState<number>(50);
  const [wave3, setWave3] = useState<number>(50);
  const [currentTarget, setCurrentTarget] = useState<number>(0);
  const [isCleared, setIsCleared] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [targets, setTargets] = useState<number[][]>([]);

  const snapStep: Record<Difficulty, number> = {
    hard: 10,
    veryhard: 5,
    impossible: 1,
  };

  const generateTargets = (difficulty: Difficulty): number[][] => {
    const step = snapStep[difficulty];
    return Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => Math.floor(Math.random() * (100 / step)) * step)
    );
  };

  const drawWave = (ctx: CanvasRenderingContext2D, amplitudes: number[], color: string): void => {
    ctx.beginPath();
    for (let x = 0; x <= 600; x++) {
      const t = (x / 600) * 2 * Math.PI;
      const y =
        amplitudes.reduce((sum, amp, i) => sum + amp * Math.sin((i + 1) * t), 0) / 3;
      ctx.lineTo(x, 100 - y);
    }
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 600, 200);
        if (targets[currentTarget]) {
          drawWave(ctx, targets[currentTarget], '#00ff00'); // 緑
        }
        drawWave(ctx, [wave1, wave2, wave3], '#ffffff'); // 白
      }
    }
  }, [wave1, wave2, wave3, targets, currentTarget]);

  useEffect(() => {
    if (timeLeft > 0 && !isCleared) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isCleared]);

  const handleTouchMove = (e: React.TouchEvent<HTMLInputElement>) => {
    e.preventDefault();
  };

  const handleSliderChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    setter(Number(e.target.value));
  };

  const checkMatch = (): void => {
    const tolerance = difficulty === 'impossible' ? 1 : snapStep[difficulty!];
    const isMatch = targets[currentTarget].every(
      (target, i) => Math.abs(target - [wave1, wave2, wave3][i]) <= tolerance
    );
    if (isMatch) {
      if (currentTarget + 1 < targets.length) {
        setCurrentTarget(currentTarget + 1);
      } else {
        setIsCleared(true);
      }
    } else {
      alert('Not quite right. Try again!');
    }
  };

  const resetGame = (): void => {
    setWave1(50);
    setWave2(50);
    setWave3(50);
    setCurrentTarget(0);
    setIsCleared(false);
    setTimeLeft(300);
  };

  const startGame = (selectedDifficulty: Difficulty): void => {
    setDifficulty(selectedDifficulty);
    setTargets(generateTargets(selectedDifficulty));
    resetGame();
  };

  if (!difficulty) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-green-500 font-mono">
        <h1 className="text-3xl mb-6">[ Wave Puzzle - Select Difficulty ]</h1>
        {(['hard', 'veryhard', 'impossible'] as Difficulty[]).map((level) => (
          <button
            key={level}
            onClick={() => startGame(level)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg shadow-md m-2"
          >
            {level.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-green-500 font-mono">
      <h1 className="text-2xl mb-4">[ Wave Synthesis Puzzle ]</h1>
      {isCleared ? (
        <div className="text-center">
          <h2 className="text-2xl">You cleared all levels! 🎉</h2>
          <p className="mt-4">Final Score: {timeLeft}</p>
          <button
            onClick={() => setDifficulty(null)}
            className="mt-6 px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">Time Left: {300 - timeLeft}s</div>
          <canvas
            ref={canvasRef}
            width="600"
            height="200"
            className="border-2 border-green-500 bg-black mb-4"
          ></canvas>
          <div className="w-full max-w-md space-y-2">
            {[wave1, wave2, wave3].map((wave, index) => (
              <div key={index}>
                <label htmlFor={`wave${index + 1}`}>{`Wave ${index + 1} Amplitude`}</label>
                <input
                  id={`wave${index + 1}`}
                  type="range"
                  min="0"
                  max="100"
                  step={snapStep[difficulty!]}
                  value={wave}
                  onChange={(e) =>
                    handleSliderChange(e, [setWave1, setWave2, setWave3][index])
                  }
                  onTouchMove={handleTouchMove}
                  className="w-full bg-black text-green-500"
                />
                <p>{wave}</p>
              </div>
            ))}
          </div>
          <button
            onClick={checkMatch}
            className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg"
          >
            Check Match
          </button>
        </>
      )}
      <footer className="fixed bottom-0 w-full text-center py-2 text-green-700">
        Original code by <a href="https://github.com/Hirumi-Tower" className="underline">Hirumi-Tower</a>
      </footer>
    </div>
  );
}
