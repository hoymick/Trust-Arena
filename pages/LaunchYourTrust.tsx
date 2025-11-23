import React, { useState, useEffect, useRef, useCallback } from 'react';
import MechCard from '../components/ui/MechCard';
import MechButton from '../components/ui/MechButton';
import TokenDisplay from '../components/ui/TokenDisplay';
import { soundManager } from '../utils/sound';
import { SoundType } from '../types';
import { useUser } from '../context/UserContext';

// --- Game Constants ---
const SCROLL_SPEED_BASE = 4;
const LIFT_MULTIPLIER = 1.10;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

const LaunchYourTrust: React.FC = () => {
  const { balance, updateBalance } = useUser();

  // Game Logic State
  const [gameStatus, setGameStatus] = useState<'IDLE' | 'TAKEOFF' | 'FLYING' | 'CRASHED'>('IDLE');
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [betAmount, setBetAmount] = useState<number>(25);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [winnings, setWinnings] = useState<number>(0);
  
  // Auto Play State
  const [autoBetActive, setAutoBetActive] = useState<boolean>(false);
  const [autoCashOutActive, setAutoCashOutActive] = useState<boolean>(false);
  const [autoCashOutTarget, setAutoCashOutTarget] = useState<number>(2.00);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeImgRef = useRef<HTMLImageElement | null>(null);
  
  // Physics Refs
  const planeY = useRef<number>(0);
  const planeX = useRef<number>(100);
  const planeRotation = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const gridOffset = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const crashTimeRef = useRef<number>(0);
  const autoBetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load Airplane Asset
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/airplane.png'; // Updated to use png
    img.onload = () => {
      planeImgRef.current = img;
    };
  }, []);

  // --- Game Loop (Logic) ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (gameStatus === 'TAKEOFF' || gameStatus === 'FLYING') {
      interval = setInterval(() => {
        setMultiplier(prev => {
          // Crash Logic
          const crashChance = 0.005 + (prev * 0.0005);
          if (Math.random() < crashChance && prev > 1.15) { 
             handleCrash(prev);
             return prev;
          }
          // Growth Curve
          return prev + (prev * 0.008) + 0.001; 
        });

        // Lift off logic
        if (gameStatus === 'TAKEOFF' && multiplier > LIFT_MULTIPLIER) {
          setGameStatus('FLYING');
        }

      }, 50);
    }

    return () => clearInterval(interval);
  }, [gameStatus, multiplier]);

  // --- Auto Cashout ---
  useEffect(() => {
    if (gameStatus === 'FLYING' && !hasCashedOut && autoCashOutActive) {
      if (multiplier >= autoCashOutTarget) {
        cashOut();
      }
    }
  }, [multiplier, gameStatus, autoCashOutActive, hasCashedOut, autoCashOutTarget]);

  // --- Auto Bet ---
  useEffect(() => {
    if (gameStatus === 'CRASHED' && autoBetActive) {
      if (autoBetTimeoutRef.current) clearTimeout(autoBetTimeoutRef.current);
      autoBetTimeoutRef.current = setTimeout(() => {
        if (balance >= betAmount) {
          startGame();
        } else {
          setAutoBetActive(false);
          alert("Auto Bet Stopped: Insufficient Funds");
        }
      }, 3000);
    }
    return () => {
      if (autoBetTimeoutRef.current) clearTimeout(autoBetTimeoutRef.current);
    };
  }, [gameStatus, autoBetActive, balance, betAmount]);

  const handleCrash = (finalMult: number) => {
    setGameStatus('CRASHED');
    soundManager.play(SoundType.CRASH);
    crashTimeRef.current = Date.now();
  };

  const startGame = () => {
    if (betAmount > balance) {
        alert("Insufficient TRUST tokens.");
        soundManager.play(SoundType.IMPACT);
        setAutoBetActive(false);
        return;
    }
    if (betAmount <= 0) return;

    updateBalance(-betAmount);
    
    setGameStatus('TAKEOFF');
    setMultiplier(1.00);
    setHasCashedOut(false);
    setWinnings(0);
    
    particles.current = [];
    planeRotation.current = 0;
    startTimeRef.current = Date.now();
    
    soundManager.play(SoundType.CLICK);
    setTimeout(() => soundManager.play(SoundType.TAKEOFF), 100);
  };

  const cashOut = () => {
    if (hasCashedOut || gameStatus === 'CRASHED' || gameStatus === 'IDLE') return;
    
    setHasCashedOut(true);
    soundManager.play(SoundType.CASHOUT); 
    
    const winVal = Math.floor(betAmount * multiplier);
    setWinnings(winVal);
    updateBalance(winVal);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setBetAmount(0);
    } else {
      setBetAmount(parseInt(val));
    }
  };

  // --- Drawing ---

  const drawEnvironment = (ctx: CanvasRenderingContext2D, width: number, height: number, speed: number) => {
    const runwayY = height * 0.85;
    gridOffset.current = (gridOffset.current - speed) % 60;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Sky Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#050508');
    grad.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Runway / Ground
    ctx.fillStyle = '#0f0f14';
    ctx.fillRect(0, runwayY, width, height - runwayY);

    // Runway Lights
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#FFFF00';
    ctx.fillStyle = 'rgba(255,255,0,0.6)';
    for (let x = gridOffset.current; x < width; x += 60) {
        // Top lights
        ctx.fillRect(x, runwayY + 2, 30, 2);
        // Bottom lights
        ctx.fillRect(x, height - 5, 30, 2);
    }

    // Center Line
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    for (let x = gridOffset.current; x < width; x += 100) {
        ctx.fillRect(x, runwayY + (height-runwayY)/2, 50, 4);
    }
    
    // Horizon Line
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, runwayY);
    ctx.lineTo(width, runwayY);
    ctx.stroke();
  };

  const drawPlane = (ctx: CanvasRenderingContext2D, x: number, y: number, rot: number, isCrashed: boolean, isCashingOut: boolean) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot * Math.PI / 180);

    if (isCrashed) {
        // Draw debris/explosion
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#FF4500';
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Fade out plane
        ctx.globalAlpha = 0.5;
    }

    if (isCashingOut) {
        // Flash Effect
        ctx.shadowBlur = 50;
        ctx.shadowColor = '#00FF00';
        ctx.globalCompositeOperation = 'source-over';
    }

    // Draw Image
    if (planeImgRef.current) {
        // Center image
        const w = 140;
        const h = 70;
        ctx.drawImage(planeImgRef.current, -w/2, -h/2, w, h);
    } else {
        // Fallback
        ctx.fillStyle = '#00E5FF';
        ctx.fillRect(-30, -10, 60, 20);
    }
    
    ctx.restore();
  };

  const updateParticles = (ctx: CanvasRenderingContext2D) => {
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;
      
      if (p.life <= 0) {
        particles.current.splice(i, 1);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }
  };

  // --- Loop ---
  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const runwayY = height * 0.85;

    // Speed calculation
    let speed = SCROLL_SPEED_BASE;
    if (gameStatus === 'FLYING') speed += (multiplier * 2);
    if (gameStatus === 'CRASHED' || gameStatus === 'IDLE') speed = 0;
    if (gameStatus === 'TAKEOFF') speed = SCROLL_SPEED_BASE * 2;

    drawEnvironment(ctx, width, height, speed);

    // Physics
    let targetY = runwayY - 30; // Resting on runway (offset for image center)
    let targetRot = 0;

    if (gameStatus === 'TAKEOFF') {
        targetY = runwayY - 30 + (Math.random() * 2 - 1);
        targetRot = -2;
    } else if (gameStatus === 'FLYING') {
        const flightTime = (Date.now() - startTimeRef.current) / 1000;
        
        // Diagonal Climb
        // As multiplier goes up, plane goes higher AND slightly forward visual trick if needed, but usually x is fixed.
        const climbAmount = Math.min((multiplier - 1) * 300, height * 0.6);
        
        targetY = (runwayY - 30) - climbAmount;
        targetY += Math.sin(flightTime * 3) * 5; // Float
        
        targetRot = -15;
    } else if (gameStatus === 'CRASHED') {
        // Drop Fast
        const crashDuration = (Date.now() - crashTimeRef.current) / 1000;
        targetY = planeY.current + (crashDuration * 400); // Fall down
        targetRot = planeRotation.current + 5;
        
        if (targetY > height + 100) targetY = height + 100; // Cap at bottom
    }

    // Interpolate
    planeY.current += (targetY - planeY.current) * 0.1;
    planeRotation.current += (targetRot - planeRotation.current) * 0.1;

    // Engine Particles
    if (gameStatus !== 'IDLE' && gameStatus !== 'CRASHED') {
        particles.current.push({
            x: planeX.current - 60,
            y: planeY.current + 5,
            vx: -speed - Math.random() * 5,
            vy: (Math.random() - 0.5) * 2,
            life: 1.0,
            color: '#00E5FF',
            size: Math.random() * 3 + 1
        });
    }

    updateParticles(ctx);

    // Visual Cashout Pulse
    // If just cashed out recently (within 500ms), show effect
    // Since hasCashedOut is persistent, we can just pulse if hasCashedOut is true and game is flying
    const isCashingOut = hasCashedOut && gameStatus === 'FLYING' && (Math.floor(Date.now() / 100) % 2 === 0);

    drawPlane(ctx, planeX.current, planeY.current, planeRotation.current, gameStatus === 'CRASHED', isCashingOut);

    requestRef.current = requestAnimationFrame(loop);
  }, [gameStatus, multiplier, hasCashedOut]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [loop]);


  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar Stats */}
        <div className="hidden lg:flex flex-col gap-4">
           <MechCard title="FLIGHT LOG" className="flex-1">
              <div className="grid grid-cols-3 gap-2">
                 {[1.2, 2.4, 12.5, 1.1, 3.5, 8.2, 1.05, 2.2].map((m, i) => (
                    <div key={i} className={`px-2 py-1 rounded border text-center font-mono font-bold text-sm ${m < 2 ? 'border-blue-500/30 text-blue-400' : 'border-purple-500/30 text-purple-400'}`}>
                       {m}x
                    </div>
                 ))}
              </div>
           </MechCard>
        </div>

        {/* Main Game */}
        <div className="lg:col-span-2 flex flex-col gap-4">
           <MechCard className="relative w-full aspect-[16/9] bg-black border-2 border-white/10 overflow-hidden" glowing={gameStatus === 'FLYING'}>
              
              {/* HUD Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-20">
                 <div className={`font-['Orbitron'] text-7xl md:text-8xl font-black tracking-tighter ${gameStatus === 'CRASHED' ? 'text-red-500' : hasCashedOut ? 'text-green-400' : 'text-white'}`}>
                    {multiplier.toFixed(2)}x
                 </div>
                 <div className="mt-4 font-['Quantico'] text-lg uppercase font-bold tracking-widest">
                    {gameStatus === 'IDLE' && <span className="text-gray-500 animate-pulse">READY FOR TAKEOFF</span>}
                    {gameStatus === 'TAKEOFF' && <span className="text-yellow-400">ACCELERATING</span>}
                    {gameStatus === 'CRASHED' && <span className="text-red-500">CRASHED</span>}
                    {hasCashedOut && (
                      <div className="bg-black/80 border border-green-500 px-6 py-2 rounded-xl neon-pop mt-2">
                         <span className="text-green-400 block text-sm">EJECT SUCCESSFUL</span>
                         <div className="flex items-center justify-center gap-2 text-white font-bold text-xl">
                            + <TokenDisplay amount={winnings} />
                         </div>
                      </div>
                    )}
                 </div>
              </div>

              <canvas ref={canvasRef} width={800} height={450} className="w-full h-full object-cover" />

           </MechCard>

           {/* Controls */}
           <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              <div className="md:col-span-8 bg-[#0A0A0F] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
                 <div className="flex-1 w-full">
                    <label className="text-[#00A8FF] font-['Quantico'] text-xs uppercase tracking-wider mb-1 block">Stake</label>
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-lg overflow-hidden">
                       <button onClick={() => setBetAmount(Math.max(10, betAmount - 10))} className="w-12 h-12 bg-white/5 hover:bg-white/10 text-[#00A8FF] font-bold text-xl">-</button>
                       <div className="flex-1 relative h-12">
                          <input 
                            type="number"
                            value={betAmount === 0 ? '' : betAmount}
                            onChange={handleInputChange}
                            className="w-full h-full bg-transparent text-center text-white font-['Orbitron'] text-xl font-bold focus:outline-none"
                          />
                       </div>
                       <button onClick={() => setBetAmount(betAmount + 10)} className="w-12 h-12 bg-white/5 hover:bg-white/10 text-[#00A8FF] font-bold text-xl">+</button>
                    </div>
                 </div>

                 <div className="w-full md:w-auto min-w-[200px]">
                    {gameStatus === 'FLYING' && !hasCashedOut ? (
                       <MechButton variant="success" fullWidth className="h-[80px] text-2xl" onClick={cashOut}>
                          EJECT
                          <span className="block text-sm font-mono opacity-80 mt-1">{(betAmount * multiplier).toFixed(0)}</span>
                       </MechButton>
                    ) : (
                       <MechButton variant="primary" fullWidth className="h-[80px] text-2xl" onClick={startGame} disabled={gameStatus === 'TAKEOFF' || gameStatus === 'FLYING'}>
                          {gameStatus === 'TAKEOFF' ? 'LAUNCHING...' : 'LAUNCH'}
                       </MechButton>
                    )}
                 </div>
              </div>

              {/* Automation */}
              <div className="md:col-span-4 bg-[#0A0A0F] border border-white/10 rounded-xl p-3 flex flex-col justify-center gap-3">
                  <div className="text-gray-500 font-['Quantico'] text-[10px] uppercase tracking-widest text-center border-b border-white/5 pb-1">Auto-Pilot</div>
                  
                  <div className="flex items-center justify-between px-2">
                     <span className="text-xs font-['Quantico'] text-[#00A8FF]">Auto Launch</span>
                     <button onClick={() => setAutoBetActive(!autoBetActive)} className={`w-10 h-5 rounded-full relative transition-all duration-300 ${autoBetActive ? 'bg-[#00E5FF]' : 'bg-gray-800'}`}>
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${autoBetActive ? 'translate-x-5' : ''}`}></div>
                     </button>
                  </div>

                  <div className="flex flex-col gap-2 px-2">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-['Quantico'] text-[#00A8FF]">Auto Eject</span>
                        <button onClick={() => setAutoCashOutActive(!autoCashOutActive)} className={`w-10 h-5 rounded-full relative transition-all duration-300 ${autoCashOutActive ? 'bg-[#00E5FF]' : 'bg-gray-800'}`}>
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${autoCashOutActive ? 'translate-x-5' : ''}`}></div>
                        </button>
                     </div>
                     <div className={`flex items-center gap-2 border border-white/10 rounded bg-black/30 px-2 py-2 transition-opacity ${autoCashOutActive ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <span className="text-[10px] text-gray-500 font-['Quantico']">AT</span>
                        <input type="number" step="0.1" min="1.1" value={autoCashOutTarget} onChange={(e) => setAutoCashOutTarget(parseFloat(e.target.value))} className="w-full bg-transparent text-right font-['Orbitron'] font-bold text-[#00E5FF] outline-none text-sm" />
                        <span className="text-xs text-[#00E5FF]">x</span>
                     </div>
                  </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchYourTrust;