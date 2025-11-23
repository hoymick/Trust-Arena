import React from 'react';

interface MechCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  glowing?: boolean;
}

const MechCard: React.FC<MechCardProps> = ({ children, title, className = '', glowing = false }) => {
  return (
    <div className={`relative group ${className}`}>
      {/* Outer Glow & Border */}
      <div className={`
        absolute -inset-[1px] bg-gradient-to-br from-[#00A8FF] to-[#00E5FF] rounded-xl opacity-50 blur-sm transition-opacity duration-500
        ${glowing ? 'opacity-80 blur-md animate-pulse' : 'group-hover:opacity-75'}
      `}></div>

      {/* Main Container */}
      <div className="relative bg-[#0A0A0F]/80 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
        
        {/* Scanline Overlay */}
        <div className="scanlines pointer-events-none absolute inset-0 opacity-20"></div>
        
        {/* Mechanical Corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00A8FF]"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00A8FF]"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00E5FF]"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00E5FF]"></div>

        {/* Header / Title Bar */}
        {title && (
          <div className="bg-black/40 border-b border-white/10 p-4 flex items-center justify-between">
             <h3 className="font-['Quantico'] text-[#00A8FF] uppercase tracking-widest text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse"></span>
                {title}
             </h3>
             <div className="flex gap-1">
                <div className="w-8 h-1 bg-white/10"></div>
                <div className="w-2 h-1 bg-[#00A8FF]"></div>
             </div>
          </div>
        )}

        <div className="p-6 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MechCard;