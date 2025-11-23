import React, { useState, useEffect, useRef } from 'react';
import MechCard from '../components/ui/MechCard';
import MechButton from '../components/ui/MechButton';
import TokenDisplay from '../components/ui/TokenDisplay';
import { soundManager } from '../utils/sound';
import { SoundType } from '../types';

const Aviator: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<'IDLE' | 'RUNNING' | 'CRASHED'>('IDLE');
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [betAmount, setBetAmount] = useState<number>(25);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game Loop Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (gameStatus === 'RUNNING') {
      interval = setInterval(() => {
        setMultiplier(prev => {
          // Simulate crash randomly
          if (Math.random() < 0.01) {
             setGameStatus('CRASHED');
             soundManager.play(SoundType.IMPACT);
             return prev;
          }
          // Exponential growth curve
          return prev + (prev * 0.02); 
        });
      }, 100);
    }

    return () => clearInterval(interval);
  }, [gameStatus]);

  // Canvas Rendering (The rising graph)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameStatus === 'IDLE') {
        // Draw Waiting text
        ctx.fillStyle = '#333';
        ctx.font = '20px Orbitron';
        ctx.fillText("PREPARING ENGINES...", 50, canvas.height / 2);
        return;
    }

    // Draw Curve
    const w = canvas.width;
    const h = canvas.height;
    
    // Calculate height based on multiplier (clamped visual)
    const visualProgress = Math.min((multiplier - 1) / 5, 0.9); // 0 to 0.9 scale
    
    ctx.beginPath();
    ctx.moveTo(0, h);
    
    // Draw bezier curve representing ascent
    const cp1x = w * 0.5;
    const cp1y = h;
    const cp2x = w * 0.8;
    const cp2y = h - (h * visualProgress);
    const ex = w;
    const ey = h - (h * visualProgress) - 20;

    ctx.quadraticCurveTo(cp1x, h - (h * visualProgress * 0.5), ex, ey);
    
    ctx.lineWidth = 4;
    ctx.strokeStyle = gameStatus === 'CRASHED' ? '#ef4444' : '#00A8FF';
    ctx.shadowBlur = 15;
    ctx.shadowColor = gameStatus === 'CRASHED' ? '#ef4444' : '#00A8FF';
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, gameStatus === 'CRASHED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 168, 255, 0.2)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Rocket/Drone at tip
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ex, ey, 6, 0, Math.PI * 2);
    ctx.fill();

  }, [multiplier, gameStatus]);

  const startGame = () => {
    setGameStatus('RUNNING');
    setMultiplier(1.00);
    setHasCashedOut(false);
    soundManager.play(SoundType.SERVO); // Engine start
  };

  const cashOut = () => {
    setHasCashedOut(true);
    soundManager.play(SoundType.PING); // Cashout success
    // Logic to add balance would go here
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel: Stats/History */}
        <div className="lg:col-span-1 flex flex-col gap-4">
           <MechCard title="Flight History" className="flex-1">
              <div className="space-y-2">
                 {[12.4, 2.1, 1.1, 5.5, 8.9].map((m, i) => (
                    <div key={i} className={`
                       px-3 py-2 rounded border border-white/5 text-right font-mono font-bold
                       ${m < 2.0 ? 'text-blue-400 bg-blue-900/20' : 'text-purple-400 bg-purple-900/20'}
                    `}>
                       {m.toFixed(2)}x
                    </div>
                 ))}
              </div>
           </MechCard>
        </div>

        {/* Center/Right Panel: Game */}
        <div className="lg:col-span-2">
           <MechCard className="relative h-[400px] bg-black border-2 border-white/10" glowing={gameStatus === 'RUNNING'}>
              
              {/* Multiplier Overlay */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20">
                 <div className={`font-['Orbitron'] text-7xl font-black tracking-tighter ${
                    gameStatus === 'CRASHED' ? 'text-red-500' : 
                    hasCashedOut ? 'text-green-400' : 'text-white'
                 }`}>
                    {multiplier.toFixed(2)}x
                 </div>
                 {gameStatus === 'CRASHED' && <div className="text-red-500 font-['Quantico'] mt-2 animate-pulse">CRASHED</div>}
                 {hasCashedOut && <div className="text-green-400 font-['Quantico'] mt-2">CASHED OUT: +<TokenDisplay amount={betAmount * multiplier} /></div>}
              </div>

              <canvas 
                ref={canvasRef} 
                width={600} 
                height={350} 
                className="w-full h-full object-cover"
              />
           </MechCard>

           {/* Controls */}
           <div className="mt-6 p-4 bg-[#111] rounded-xl border border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
              
              {/* Bet Selector */}
              <div className="flex items-center gap-4 bg-black/40 p-2 rounded-lg border border-white/5">
                 <button className="w-10 h-10 rounded bg-gray-800 hover:bg-gray-700 text-white font-bold" onClick={() => setBetAmount(b => Math.max(1, b-5))}>-</button>
                 <div className="w-24 text-center"><TokenDisplay amount={betAmount} /></div>
                 <button className="w-10 h-10 rounded bg-gray-800 hover:bg-gray-700 text-white font-bold" onClick={() => setBetAmount(b => b+5)}>+</button>
              </div>

              {/* Action Button */}
              <div className="w-full sm:w-auto min-w-[200px]">
                {gameStatus === 'RUNNING' && !hasCashedOut ? (
                   <MechButton variant="success" fullWidth onClick={cashOut} sound={SoundType.PING}>
                      EJECT ({ (betAmount * multiplier).toFixed(0) })
                   </MechButton>
                ) : gameStatus === 'IDLE' || gameStatus === 'CRASHED' || hasCashedOut ? (
                   <MechButton variant="primary" fullWidth onClick={startGame} disabled={gameStatus === 'RUNNING'} sound={SoundType.SERVO}>
                      INITIATE LAUNCH
                   </MechButton>
                ) : null}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Aviator;