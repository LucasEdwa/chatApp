import React from 'react';

interface HeaderGradientProps {
  opacity?: number;
  className?: string;
}

export const HeaderGradient: React.FC<HeaderGradientProps> = ({
  opacity = 0.3,
  className = ''
}) => {
  return (
    <div 
      className={`h-px w-full ${className}`}
      style={{
        background: 'linear-gradient(to right, transparent, var(--color-accent), transparent)',
        opacity: opacity
      }}
    />
  );
};
