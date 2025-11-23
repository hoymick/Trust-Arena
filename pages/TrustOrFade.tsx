
import React, { useState, useEffect, useRef } from 'react';
import MechCard from '../components/ui/MechCard';
import MechButton from '../components/ui/MechButton';
import TokenDisplay from '../components/ui/TokenDisplay';
import { soundManager } from '../utils/sound';
import { SoundType } from '../types';
import { useUser } from '../context/UserContext';

interface HistoryItem {
  result: 'TRUST' | 'FADE';
  id: number;
}

const TrustOrFade: React.FC = () => {
  const { balance, updateBalance } = useUser();

  // Game State
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedSide, setSelectedSide] = useState<'TRUST' | 'FADE' | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [result, setResult] = useState<'TRUST' | 'FADE' | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [winEffect, setWinEffect] = useState<boolean>(false);
  const [lossEffect, setLossEffect] = useState<boolean>(false);
  
  // Animation Refs
  const coinRef = useRef<HTMLDivElement>(null);

  // Reset effects after duration
  useEffect(() => {
    if (winEffect || lossEffect) {
      const timer = setTimeout(() => {
        setWinEffect(false);
        setLossEffect(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [winEffect, lossEffect]);

  const handlePlay = () => {
    if (!selectedSide || isFlipping) return;

    if (betAmount <= 0) {
      alert("Please enter a valid stake amount.");
      return;
    }

    if (betAmount > balance) {
      alert("Insufficient TRUST tokens.");
      soundManager.play(SoundType.IMPACT);
      return;
    }

    // Deduct Stake Immediately
    updateBalance(-betAmount);

    // 1. Start Sequence
    setIsFlipping(true);
    setResult(null);
    setWinEffect(false);
    setLossEffect(false);
    
    // Audio
    soundManager.play(SoundType.CLAMP);
    setTimeout(() => soundManager.play(SoundType.SERVO), 200);
    setTimeout(() => soundManager.play(SoundType.SERVO), 800);
    
    // 2. Determine Result (50/50)
    const outcome: 'TRUST' | 'FADE' = Math.random() > 0.5 ? 'TRUST' : 'FADE';
    
    // 3. Animate Coin
    if (coinRef.current) {
      coinRef.current.style.transition = 'none';
      coinRef.current.style.transform = 'rotateY(0deg)';
      void coinRef.current.offsetWidth; // Force reflow
      coinRef.current.style.transition = 'transform 3s cubic-bezier(0.15, 0.5, 0.15, 1)';
      
      const baseRotation = 1800;
      const finalRotation = outcome === 'TRUST' ? baseRotation : baseRotation + 180;
      
      coinRef.current.style.transform = `rotateY(${finalRotation}deg)`;
    }

    // 4. Conclude Game
    setTimeout(() => {
      setIsFlipping(false);
      setResult(outcome);
      setHistory(prev => [{ result: outcome, id: Date.now() }, ...prev].slice(0, 10));

      if (outcome === selectedSide) {
        // Win Logic
        const winnings = betAmount * 2;
        updateBalance(winnings);
        setWinEffect(true);
        soundManager.play(SoundType.PING);
      } else {
        // Loss Logic (Balance already deducted)
        setLossEffect(true);
        soundManager.play(SoundType.IMPACT);
      }
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setBetAmount(0);
    } else {
      setBetAmount(parseInt(val));
    }
  };

  return (
    <div className={`max-w-4xl mx-auto transition-transform duration-100 ${lossEffect ? 'shake' : ''}`}>
      
      {/* Header Stats */}
      <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="font-['Orbitron'] text-4xl font-black text-white tracking-tight">
            TRUST <span className="text-gray-600 text-2xl mx-2">//</span> FADE
          </h1>
          <p className="font-['Quantico'] text-[#00E5FF] text-sm tracking-[0.3em] mt-1">BINARY PREDICTION PROTOCOL</p>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-gray-500 text-xs font-['Exo_2'] uppercase tracking-widest">Current Stake</div>
          <TokenDisplay amount={betAmount} size="lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CONTROLS */}
        <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
          
          {/* Stake Input */}
          <MechCard title="STAKE CONTROL" glowing={false}>
             <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-white/10 mb-4">
                <button onClick={() => setBetAmount(Math.max(10, betAmount - 10))} className="w-10 h-10 bg-[#1a1a20] hover:bg-[#00A8FF]/20 text-[#00A8FF] rounded font-bold text-xl transition-colors">-</button>
                <input 
                  type="number"
                  value={betAmount === 0 ? '' : betAmount}
                  onChange={handleInputChange}
                  className="bg-transparent w-full text-center font-['Orbitron'] text-2xl font-bold text-white focus:outline-none appearance-none"
                  placeholder="0"
                />
                <button onClick={() => setBetAmount(betAmount + 10)} className="w-10 h-10 bg-[#1a1a20] hover:bg-[#00A8FF]/20 text-[#00A8FF] rounded font-bold text-xl transition-colors">+</button>
             </div>
             <div className="flex justify-between gap-2">
               {[10, 50, 100, 500].map(amt => (
                 <button 
                   key={amt}
                   onClick={() => setBetAmount(amt)}
                   className="flex-1 py-1 text-xs font-['Quantico'] bg-white/5 hover:bg-white/10 border border-white/10 rounded text-gray-400 hover:text-white transition-colors"
                 >
                   {amt}
                 </button>
               ))}
             </div>
          </MechCard>

          {/* Side Selection */}
          <div className="grid grid-cols-2 gap-4">
             <button
               onClick={() => { 
                 if (!isFlipping) {
                   setSelectedSide('TRUST');
                   soundManager.play(SoundType.CLICK);
                 }
               }}
               disabled={isFlipping}
               className={`
                 relative h-32 rounded-xl border-2 transition-all duration-300 overflow-hidden group
                 ${selectedSide === 'TRUST' 
                   ? 'border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_30px_rgba(0,229,255,0.3)]' 
                   : 'border-white/10 bg-black/40 hover:border-[#00E5FF]/50'}
               `}
             >
               <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative z-10 flex flex-col items-center justify-center h-full">
                 <img src="/assets/trust.svg" className="w-12 h-12 mb-2 drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                 <span className="font-['Orbitron'] font-bold text-xl text-white">TRUST</span>
                 <span className="text-[#00E5FF] text-xs font-['Quantico']">2.00x</span>
               </div>
             </button>

             <button
               onClick={() => {
                 if (!isFlipping) {
                   setSelectedSide('FADE');
                   soundManager.play(SoundType.CLICK);
                 }
               }}
               disabled={isFlipping}
               className={`
                 relative h-32 rounded-xl border-2 transition-all duration-300 overflow-hidden group
                 ${selectedSide === 'FADE' 
                   ? 'border-[#FF0055] bg-[#FF0055]/10 shadow-[0_0_30px_rgba(255,0,85,0.3)]' 
                   : 'border-white/10 bg-black/40 hover:border-[#FF0055]/50'}
               `}
             >
               <div className="absolute inset-0 bg-gradient-to-br from-[#FF0055]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative z-10 flex flex-col items-center justify-center h-full">
                 <div className="w-12 h-12 mb-2 rounded-full border-2 border-[#FF0055] flex items-center justify-center bg-[#FF0055]/20 shadow-[0_0_10px_rgba(255,0,85,0.5)]">
                   <span className="text-xl">✕</span>
                 </div>
                 <span className="font-['Orbitron'] font-bold text-xl text-white">FADE</span>
                 <span className="text-[#FF0055] text-xs font-['Quantico']">2.00x</span>
               </div>
             </button>
          </div>

          {/* Play Button */}
          <MechButton 
            variant={selectedSide ? 'primary' : 'secondary'} 
            fullWidth 
            onClick={handlePlay}
            disabled={!selectedSide || isFlipping}
            className="h-16 text-xl"
          >
            {isFlipping ? 'PROCESSING...' : 'PLAY'}
          </MechButton>

        </div>

        {/* ARENA (COIN) */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <MechCard className="h-full min-h-[400px] flex items-center justify-center bg-black/80 relative overflow-hidden" glowing={isFlipping}>
             
             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00A8FF_1px,transparent_1px)] [background-size:20px_20px]"></div>

             {!isFlipping && result && (
               <div className="absolute top-10 z-20 w-full text-center neon-pop">
                 <div className={`font-['Orbitron'] text-6xl font-black tracking-widest drop-shadow-[0_0_20px_rgba(0,0,0,1)]
                   ${result === 'TRUST' ? 'text-[#00E5FF]' : 'text-[#FF0055]'}
                 `}>
                   {result}
                 </div>
                 {winEffect && (
                   <div className="mt-2 text-2xl font-['Quantico'] text-green-400 animate-float">
                     WINNER +{betAmount * 2}
                   </div>
                 )}
               </div>
             )}

             {/* 3D COIN */}
             <div className="coin-container w-64 h-64 relative z-10">
                <div ref={coinRef} className="coin">
                  
                  {/* FRONT: TRUST */}
                  <div className="coin-face coin-front shadow-[0_0_50px_rgba(0,229,255,0.2)]">
                    <div className="absolute inset-0 rounded-full border-2 border-[#00E5FF]/50 m-1"></div>
                    <div className="flex flex-col items-center justify-center">
                      <img src="/assets/trust.svg" className="w-32 h-32 animate-pulse" alt="Trust" />
                      <span className="mt-2 font-['Orbitron'] font-bold text-[#00E5FF] text-xl tracking-widest">TRUST</span>
                    </div>
                  </div>

                  {/* BACK: FADE */}
                  <div className="coin-face coin-back shadow-[0_0_50px_rgba(255,0,85,0.2)]">
                    <div className="absolute inset-0 rounded-full border-2 border-[#FF0055]/50 m-1"></div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-28 h-28 rounded-full border-4 border-[#FF0055] flex items-center justify-center bg-[#FF0055]/10 mb-2">
                        <span className="text-6xl text-[#FF0055]">✕</span>
                      </div>
                      <span className="mt-2 font-['Orbitron'] font-bold text-[#FF0055] text-xl tracking-widest">FADE</span>
                    </div>
                  </div>

                </div>
             </div>

          </MechCard>
        </div>

      </div>

      {/* HISTORY */}
      <div className="mt-8 relative">
        <div className="text-xs text-gray-500 font-['Quantico'] uppercase tracking-widest mb-2 ml-2">Last 10 Results</div>
        <div className="h-16 bg-black/40 border border-white/10 rounded-lg flex items-center px-4 gap-3 overflow-hidden relative">
           <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#0A0A0F] via-transparent to-[#0A0A0F] z-10"></div>
           
           {history.length === 0 && <span className="text-gray-700 text-sm italic">No data recorded...</span>}

           {history.map((item) => (
             <div key={item.id} className="chip-enter flex-shrink-0">
               <div className={`
                 w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg
                 ${item.result === 'TRUST' 
                   ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.2)]' 
                   : 'bg-[#FF0055]/10 border-[#FF0055] text-[#FF0055] shadow-[0_0_10px_rgba(255,0,85,0.2)]'}
               `}>
                 {item.result === 'TRUST' ? (
                   <img src="/assets/trust.svg" className="w-5 h-5" />
                 ) : (
                   <span className="text-xs font-bold">✕</span>
                 )}
               </div>
             </div>
           ))}
        </div>
      </div>

    </div>
  );
};

export default TrustOrFade;
