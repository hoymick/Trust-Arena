
import React from 'react';
import { Link } from 'react-router-dom';
import MechButton from '../components/ui/MechButton';
import MechCard from '../components/ui/MechCard';
import { soundManager } from '../utils/sound';
import { SoundType } from '../types';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 relative">
      
      {/* Hero Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-[#8A2BE2] opacity-[0.03] blur-[100px] rounded-full pointer-events-none"></div>

      {/* Main Hero Section */}
      <div className="text-center mb-16 relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        
        <img src="/assets/trust.svg" alt="TRUST ARENA Logo" className="arena-hero-logo mb-6" />

        <div className="inline-block mb-6 border border-[#00A8FF]/30 bg-[#00A8FF]/5 px-4 py-1 rounded-full backdrop-blur-sm animate-pulse">
          <span className="font-['Quantico'] text-[#00A8FF] text-sm uppercase tracking-widest">System Status: Optimal</span>
        </div>

        <h1 className="font-['Orbitron'] text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] mb-6">
          WELCOME TO <br/><span className="text-[#00E5FF]">TRUST ARENA</span>
        </h1>
        
        <div className="relative inline-block group">
            {/* Robotic Brackets */}
            <span className="absolute -left-8 top-0 text-6xl text-[#00E5FF] font-['Orbitron'] opacity-50 group-hover:-translate-x-2 transition-transform">[</span>
            <span className="absolute -right-8 top-0 text-6xl text-[#00E5FF] font-['Orbitron'] opacity-50 group-hover:translate-x-2 transition-transform">]</span>
            
            <p className="font-['Quantico'] text-xl md:text-2xl text-gray-300 tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(0,229,255,0.4)] animate-[pulse_3s_ease-in-out_infinite]">
              In the arena of trust, <span className="text-[#00A8FF] font-bold">intuition decides.</span>
            </p>
        </div>
      </div>

      {/* Game Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        
        {/* Trust or Fade Card */}
        <Link to="/trust-fade" className="group">
          <MechCard className="h-full transition-transform duration-300 group-hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(138,43,226,0.2)]" glowing>
             <div className="flex flex-col h-full items-center text-center p-4">
                <div className="w-24 h-24 mb-6 rounded-full bg-[#8A2BE2]/10 border-2 border-[#8A2BE2] flex items-center justify-center shadow-[0_0_15px_rgba(138,43,226,0.4)]">
                    <span className="text-4xl">⚖️</span>
                </div>
                <h2 className="font-['Orbitron'] text-3xl font-bold text-white mb-2 group-hover:text-[#00E5FF] transition-colors">TRUST OR FADE</h2>
                <p className="font-['Exo_2'] text-gray-400 mb-8 max-w-xs">
                  The ultimate 50/50 prediction protocol. Double your tokens instantly.
                </p>
                <div className="mt-auto w-full">
                  <MechButton variant="primary" fullWidth sound={SoundType.CLAMP}>
                    PLAY TRUST OR FADE
                  </MechButton>
                </div>
             </div>
          </MechCard>
        </Link>

        {/* Launch Your Trust (Aviator) Card */}
        <Link to="/launch-your-trust" className="group">
          <MechCard className="h-full transition-transform duration-300 group-hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(0,168,255,0.2)]" glowing>
             <div className="flex flex-col h-full items-center text-center p-4">
                <div className="w-24 h-24 mb-6 rounded-full bg-[#00A8FF]/10 border-2 border-[#00A8FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,168,255,0.4)]">
                    <span className="text-4xl">🚀</span>
                </div>
                <h2 className="font-['Orbitron'] text-3xl font-bold text-white mb-2 group-hover:text-[#00A8FF] transition-colors">LAUNCH YOUR TRUST</h2>
                <p className="font-['Exo_2'] text-gray-400 mb-8 max-w-xs">
                  Ascend. Multipliers rising. Eject before the crash.
                </p>
                <div className="mt-auto w-full">
                  <MechButton variant="secondary" fullWidth sound={SoundType.SERVO}>
                    LAUNCH YOUR TRUST
                  </MechButton>
                </div>
             </div>
          </MechCard>
        </Link>

      </div>
    </div>
  );
};

export default Home;
