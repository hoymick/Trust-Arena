
import React from 'react';

interface TokenDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({ amount, size = 'md', animated = false }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl'
  };

  const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <span className={`trust-display inline-flex items-center font-mono font-bold text-[#00A8FF] ${sizeClasses[size]} ${animated ? 'animate-pulse' : ''}`}>
      <img 
        src="/assets/trust.svg" 
        alt="TRUST currency logo" 
        className="trust-icon"
      />
      {formattedAmount} <span className="ml-1 font-serif text-[#00E5FF] tracking-wider">TRUST</span>
    </span>
  );
};

export default TokenDisplay;
