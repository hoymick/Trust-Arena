import React from 'react';
import { soundManager } from '../../utils/sound';
import { SoundType } from '../../types';

interface MechButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  sound?: SoundType;
  fullWidth?: boolean;
}

const MechButton: React.FC<MechButtonProps> = ({ 
  children, 
  variant = 'primary', 
  sound = SoundType.CLICK,
  fullWidth = false,
  className = '',
  onMouseEnter,
  onClick,
  disabled,
  ...props 
}) => {

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) soundManager.play(SoundType.SERVO);
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) soundManager.play(sound);
    if (onClick) onClick(e);
  };

  const baseStyles = `
    relative overflow-hidden group font-['Orbitron'] font-bold uppercase tracking-[2px]
    transition-all duration-200 ease-out transform active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
  `;

  // Angled corners using clip-path for mechanical look
  const shapeStyles = `clip-path-polygon-[10%_0,100%_0,100%_70%,90%_100%,0_100%,0_30%] py-4 px-8`;

  const variants = {
    primary: `
      bg-gradient-to-r from-[#8A2BE2] to-[#00E5FF] 
      text-white 
      border-t border-l border-white/20
      shadow-[0_0_20px_rgba(138,43,226,0.4)]
      hover:shadow-[0_0_30px_rgba(0,229,255,0.6)]
      hover:brightness-110
    `,
    secondary: `
      bg-black/60 backdrop-blur-md
      text-[#00A8FF]
      border border-[#00A8FF]/50
      shadow-[0_0_10px_rgba(0,168,255,0.2)]
      hover:bg-[#00A8FF]/10 hover:border-[#00A8FF] hover:text-white
    `,
    danger: `
      bg-gradient-to-r from-red-900 to-red-600
      text-white
      border border-red-500
      shadow-[0_0_15px_rgba(220,38,38,0.5)]
      hover:brightness-110
    `,
    success: `
      bg-gradient-to-r from-emerald-900 to-emerald-500
      text-white
      border border-emerald-400
      shadow-[0_0_15px_rgba(16,185,129,0.5)]
    `
  };

  return (
    <button
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      disabled={disabled}
      style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
      {...props}
    >
      {/* Internal Tech Detail Overlay */}
      <span className="absolute top-0 left-0 w-full h-[2px] bg-white/30" />
      <span className="absolute bottom-0 right-0 w-full h-[2px] bg-black/30" />
      
      {/* Hover Scan Effect */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
      
      <div className="relative flex items-center justify-center gap-2">
        {children}
      </div>
    </button>
  );
};

export default MechButton;