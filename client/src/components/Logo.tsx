import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'gradient';
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl', 
  xl: 'text-4xl'
};

export function Logo({ size = 'md', variant = 'default', showText = true, className = '' }: LogoProps) {
  const sizeClass = sizeClasses[size];
  const textSizeClass = textSizeClasses[size];

  const getLogoSrc = () => {
    // Use the dark logo for light backgrounds, regular logo for dark backgrounds
    switch (variant) {
      case 'white':
        return '/logo/flowdex-logo.png'; // Use regular logo on dark backgrounds
      default:
        return '/logo/flowdex-logo-dark.webp'; // Use dark logo on light backgrounds
    }
  };

  const getTextClass = () => {
    switch (variant) {
      case 'white':
        return 'text-white';
      case 'gradient':
        return 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent';
      default:
        return 'bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent';
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Image */}
      <div className="relative group">
        <div className={`${sizeClass} flex items-center justify-center transition-all duration-300 group-hover:scale-105`}>
          <img 
            src={getLogoSrc()}
            alt="FlowdeX Logo"
            className={`${sizeClass} object-contain`}
            style={{ filter: variant === 'white' ? 'brightness(0) invert(1)' : 'none' }}
          />
        </div>
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl blur-xl opacity-40 animate-pulse"></div>
        )}
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClass} font-bold font-display leading-none ${getTextClass()}`}>
            FlowdeX
          </span>
          {size !== 'sm' && (
            <span className={`text-xs ${variant === 'white' ? 'text-white/70' : 'text-primary/70'} font-medium tracking-wider uppercase mt-0.5`}>
              Elite Trading
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ size = 'md', variant = 'default', className = '' }: Omit<LogoProps, 'showText'>) {
  return <Logo size={size} variant={variant} showText={false} className={className} />;
}