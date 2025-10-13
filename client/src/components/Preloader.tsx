import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete?: () => void;
  minDuration?: number; // Minimum duration in milliseconds
}

export function Preloader({ onComplete, minDuration = 2000 }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Smooth progress curve - faster at start, slower at end
        const increment = prev < 50 ? Math.random() * 15 + 5 : Math.random() * 5 + 1;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    // Complete after minimum duration
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsComplete(true);
        setTimeout(() => {
          onComplete?.();
        }, 500); // Allow fade out animation
      }, 300);
    }, minDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [minDuration, onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background/98 to-background/95 transition-opacity duration-500 ${isComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-secondary/8"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/15 to-secondary/15 rounded-full blur-3xl animate-pulse opacity-60"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-l from-secondary/20 to-primary/20 rounded-full blur-3xl animate-pulse delay-1000 opacity-40"></div>

      <div className="relative flex flex-col items-center">
        {/* Logo with Animation */}
        <div className="relative mb-12">
          <div className="w-24 h-24 flex items-center justify-center animate-pulse">
            <img 
              src="/logo/flowdex-logo.png"
              alt="FlowdeX"
              className="w-full h-full object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
          
          {/* Rotating Ring */}
          <div className="absolute inset-0 w-24 h-24">
            <svg className="w-full h-full animate-spin" style={{ animationDuration: '3s' }}>
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="url(#gradient)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * progress) / 100}
                className="transition-all duration-300 ease-out"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Glow Effect */}
          <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-xl animate-pulse"></div>
        </div>

        {/* Brand Text */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent mb-2">
            FlowdeX
          </h1>
          <p className="text-primary/80 text-sm font-medium tracking-wider uppercase">
            Elite Trading Platform
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Text */}
        <div className="text-center">
          <p className="text-muted-foreground/80 text-sm">
            {progress < 30 ? 'Initializing...' :
             progress < 60 ? 'Loading market data...' :
             progress < 90 ? 'Preparing your dashboard...' :
             'Almost ready...'}
          </p>
          <p className="text-primary/60 text-xs mt-1">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/40 rounded-full animate-ping"
              style={{
                left: `${20 + (i * 15)}%`,
                top: `${30 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple loading spinner for smaller components
export function LoadingSpinner({ size = 'md', className = '', withLogo = false }: { size?: 'sm' | 'md' | 'lg', className?: string, withLogo?: boolean }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  if (withLogo) {
    return (
      <div className={`${sizeClasses[size]} ${className} relative`}>
        <img 
          src="/logo/flowdex-logo.png"
          alt="Loading..."
          className={`${sizeClasses[size]} object-contain animate-pulse`}
          style={{ filter: 'brightness(0) invert(1)' }}
        />
        <div className="absolute inset-0 animate-spin">
          <svg className="w-full h-full" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              strokeDasharray="62.8"
              strokeDashoffset="47.1"
              strokeLinecap="round"
              className="text-primary/50"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg className="animate-spin w-full h-full" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeDasharray="62.8"
          strokeDashoffset="15.7"
          className="opacity-25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeDasharray="62.8"
          strokeDashoffset="47.1"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}