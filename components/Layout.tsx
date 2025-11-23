
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import TokenDisplay from './ui/TokenDisplay';
import { SoundType } from '../types';
import { soundManager } from '../utils/sound';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const { balance } = useUser();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClass = (path: string, isMobile: boolean = false) => `
    font-['Quantico'] text-sm uppercase tracking-wider transition-colors duration-300 relative block
    ${isMobile ? 'px-3 py-2 rounded-md text-base font-medium' : 'px-4 py-2'}
    ${location.pathname === path 
      ? 'text-[#00E5FF] font-bold bg-white/5 md:bg-transparent' 
      : 'text-gray-400 hover:text-white hover:bg-white/10 md:hover:bg-transparent'}
  `;

  const handleConnect = () => {
    soundManager.play(SoundType.PING);
    alert("Initiating Web3 Connection...");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-[#00A8FF]/30 bg-[#0A0A0F]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          {/* Logo Area */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 group" onMouseEnter={() => soundManager.play(SoundType.SERVO)}>
             <div className="relative w-12 h-12 flex items-center justify-center bg-black/50 rounded-full border border-[#00A8FF] shadow-[0_0_10px_rgba(0,168,255,0.4)]">
                <img src="/assets/trust.svg" alt="TRUST ARENA" className="trust-icon" /> 
             </div>
             <div className="flex flex-col">
               <span className="font-['Orbitron'] font-black text-xl tracking-widest text-white group-hover:text-[#00A8FF] transition-colors">
                 TRUST ARENA
               </span>
               <span className="text-[10px] text-gray-500 font-['Exo_2'] tracking-[0.2em]">SYSTEM.ONLINE</span>
             </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-baseline space-x-1">
              <Link to="/" className={navLinkClass('/')} onMouseEnter={() => soundManager.play(SoundType.SERVO)}>Home</Link>
              <Link to="/trust-fade" className={navLinkClass('/trust-fade')} onMouseEnter={() => soundManager.play(SoundType.SERVO)}>Trust or Fade</Link>
              <Link to="/launch-your-trust" className={navLinkClass('/launch-your-trust')} onMouseEnter={() => soundManager.play(SoundType.SERVO)}>Launch Your Trust</Link>
            </div>

            {/* Banking Controls - Skewed Buttons */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10 h-10">
              {/* Deposit Button */}
              <Link 
                to="/deposit" 
                className="group relative px-5 py-2 overflow-hidden bg-black/40 border border-[#00A8FF] hover:bg-[#00A8FF] transition-all duration-300 skew-x-[-15deg] hover:shadow-[0_0_15px_rgba(0,168,255,0.4)]"
                onMouseEnter={() => soundManager.play(SoundType.SERVO)}
              >
                 <div className="skew-x-[15deg] flex items-center gap-2">
                    <span className="text-[#00A8FF] group-hover:text-black font-['Quantico'] font-bold text-sm tracking-wider transition-colors">
                       DEPOSIT
                    </span>
                 </div>
              </Link>

              {/* Withdraw Button */}
              <Link 
                to="/withdraw" 
                className="group relative px-5 py-2 overflow-hidden bg-black/40 border border-[#00A8FF] hover:bg-[#00A8FF] transition-all duration-300 skew-x-[-15deg] hover:shadow-[0_0_15px_rgba(0,168,255,0.4)]"
                onMouseEnter={() => soundManager.play(SoundType.SERVO)}
              >
                 <div className="skew-x-[15deg] flex items-center gap-2">
                    <span className="text-[#00A8FF] group-hover:text-black font-['Quantico'] font-bold text-sm tracking-wider transition-colors">
                       WITHDRAW
                    </span>
                 </div>
              </Link>
            </div>
          </div>

          {/* User Balance / Connect & Mobile Menu Button */}
          <div className="flex items-center gap-4 ml-8">
            {/* Balance Display */}
            <div className="hidden sm:flex items-center justify-center px-6 py-2 bg-[#00E5FF] border border-[#00E5FF] skew-x-[-15deg] shadow-[0_0_15px_rgba(0,229,255,0.4)] min-w-[140px]">
               <div className="skew-x-[15deg] flex items-center gap-2 font-bold text-black">
                  <span className="font-mono text-base tracking-tight">{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="font-['Quantico'] text-xs tracking-widest uppercase">TRUST</span>
               </div>
            </div>

            {/* Connect Wallet Button */}
            <button 
              onClick={handleConnect}
              onMouseEnter={() => soundManager.play(SoundType.SERVO)}
              className="group relative px-4 py-2 bg-[#00E5FF]/10 border border-[#00E5FF] hover:bg-[#00E5FF] transition-all duration-300 hidden sm:block"
              style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
            >
               <span className="font-['Quantico'] text-xs font-bold text-[#00E5FF] group-hover:text-black tracking-wider uppercase">
                 Connect Wallet
               </span>
            </button>
            
            {/* Mobile Menu Button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-black/50 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none border border-white/10"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0A0A0F]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className={navLinkClass('/', true)} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/trust-fade" className={navLinkClass('/trust-fade', true)} onClick={() => setIsMobileMenuOpen(false)}>Trust or Fade</Link>
            <Link to="/launch-your-trust" className={navLinkClass('/launch-your-trust', true)} onClick={() => setIsMobileMenuOpen(false)}>Launch Your Trust</Link>
            
            <div className="my-2 border-t border-white/10 pt-2">
              <Link to="/deposit" className="block px-3 py-2 text-[#00A8FF] font-['Quantico'] uppercase tracking-wider hover:bg-[#00A8FF]/10 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                 DEPOSIT
              </Link>
              <Link to="/withdraw" className="block px-3 py-2 text-[#00A8FF] font-['Quantico'] uppercase tracking-wider hover:bg-[#00A8FF]/10 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                 WITHDRAW
              </Link>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 sm:hidden">
               <div className="px-2 flex items-center justify-between mb-4">
                  <span className="text-gray-400 font-['Quantico'] text-xs">WALLET:</span>
                  <div className="flex items-center gap-2 text-[#00E5FF]">
                    <span className="font-mono font-bold">{balance.toFixed(2)}</span>
                    <span className="font-['Quantico'] text-xs">TRUST</span>
                  </div>
               </div>
               <button 
                onClick={handleConnect}
                className="w-full py-3 bg-[#00E5FF]/10 border border-[#00E5FF] text-[#00E5FF] font-['Quantico'] font-bold text-sm uppercase tracking-wider rounded"
               >
                 Connect Wallet
               </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen text-white selection:bg-[#00E5FF] selection:text-white relative">
      {/* Global Background System */}
      <div className="custom-bg-image"></div>
      <div className="custom-bg-overlay"></div>
      <div className="mech-grid-bg fixed inset-0 opacity-20 pointer-events-none z-[-30]"></div>

      <Navbar />
      <main className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-100px)] relative z-10">
        {children}
      </main>
      <footer className="border-t border-white/5 py-8 text-center text-gray-600 font-['Exo_2'] text-xs tracking-widest relative z-10">
        <p>TRUST ARENA SYSTEMS v4.2.0 // MECHANIZED TRUST PROTOCOL</p>
      </footer>
    </div>
  );
};

export default Layout;
