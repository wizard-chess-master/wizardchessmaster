import React, { useEffect, useState } from 'react';
import { Crown, Zap } from 'lucide-react';

interface AnimatedHeroBannerProps {
  backgroundImage?: string; // Path to background image (1920x1080)
  backgroundVideo?: string; // Path to background MP4 video (1920x1080)
  chessBoardImage?: string; // Path to transparent chess board PNG (800x800)
  className?: string;
  children?: React.ReactNode;
}

export function AnimatedHeroBanner({ 
  backgroundImage,
  backgroundVideo, 
  chessBoardImage, 
  className = "", 
  children 
}: AnimatedHeroBannerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Animated Background Layer */}
      <div className="absolute inset-0 -z-20">
        {backgroundVideo ? (
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover transform transition-transform duration-3000 ease-out"
            style={{ 
              transform: isLoaded ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <source src={backgroundVideo} type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            <div className="w-full h-full bg-gradient-to-br from-amber-900/40 via-purple-900/30 to-amber-800/40 animate-gradient-shift" />
          </video>
        ) : backgroundImage ? (
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat transform transition-transform duration-3000 ease-out"
            style={{ 
              backgroundImage: `url(${backgroundImage})`,
              transform: isLoaded ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : (
          // Fallback animated gradient background
          <div className="w-full h-full bg-gradient-to-br from-amber-900/40 via-purple-900/30 to-amber-800/40 animate-gradient-shift" />
        )}
        
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-amber-300/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Content Area */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Animated Chess Board Layer */}
      {chessBoardImage ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
          <div 
            className={`transition-all duration-2000 ease-out ${
              isLoaded 
                ? 'opacity-70 transform translate-y-0 scale-100' 
                : 'opacity-0 transform translate-y-8 scale-95'
            }`}
          >
            <img 
              src={chessBoardImage}
              alt="Wizard Chess Board"
              className="w-[500px] h-[500px] object-contain animate-gentle-float animate-chess-glow hero-chess-board"
            />
          </div>
        </div>
      ) : (
        // Fallback animated chess elements
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
          <div className={`grid grid-cols-2 gap-8 transition-all duration-2000 ease-out ${
            isLoaded ? 'opacity-40 transform translate-y-0' : 'opacity-0 transform translate-y-8'
          }`}>
            <div className="w-24 h-24 bg-amber-200/30 rounded-full flex items-center justify-center animate-gentle-float">
              <Crown className="w-12 h-12 text-amber-300" />
            </div>
            <div className="w-24 h-24 bg-purple-200/30 rounded-full flex items-center justify-center animate-gentle-float" 
                 style={{ animationDelay: '1s' }}>
              <Zap className="w-12 h-12 text-purple-300" />
            </div>
          </div>
        </div>
      )}

      {/* Floating UI Accent Elements */}
      <div className={`absolute top-8 right-8 transition-all duration-1500 ease-out ${
        isLoaded ? 'opacity-80 transform translate-x-0' : 'opacity-0 transform translate-x-4'
      }`}>
        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 animate-pulse-gentle">
          <Crown className="w-8 h-8 text-amber-300" />
        </div>
      </div>

      <div className={`absolute bottom-8 left-8 transition-all duration-1500 ease-out ${
        isLoaded ? 'opacity-80 transform translate-x-0' : 'opacity-0 transform -translate-x-4'
      }`} style={{ animationDelay: '0.5s' }}>
        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 animate-pulse-gentle">
          <Zap className="w-8 h-8 text-purple-300" />
        </div>
      </div>
    </div>
  );
}