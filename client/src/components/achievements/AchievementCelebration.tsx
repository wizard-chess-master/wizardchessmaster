import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '../../lib/achievements/types';
import { useAudio } from '../../lib/stores/useAudio';

interface CelebrationEffectsProps {
  achievement: Achievement;
  isVisible: boolean;
}

export function AchievementCelebration({ achievement, isVisible }: CelebrationEffectsProps) {
  const { playGameEvent } = useAudio();
  const [showScreenFlash, setShowScreenFlash] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Trigger screen flash for rare+ achievements
      if (['rare', 'epic', 'legendary'].includes(achievement.rarity)) {
        setShowScreenFlash(true);
        setTimeout(() => setShowScreenFlash(false), 300);
      }

      // Trigger confetti for epic+ achievements
      if (['epic', 'legendary'].includes(achievement.rarity)) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      // Play celebration sound based on rarity
      setTimeout(() => {
        playGameEvent('victory');
      }, 100);

      // Trigger haptic feedback if available
      if ('vibrate' in navigator) {
        const vibrationPattern = getVibrationPattern(achievement.rarity);
        navigator.vibrate(vibrationPattern);
      }
    }
  }, [isVisible, achievement.rarity, playGameEvent]);

  const getVibrationPattern = (rarity: string): number[] => {
    switch (rarity) {
      case 'legendary': return [200, 100, 200, 100, 300];
      case 'epic': return [150, 50, 150, 50, 200];
      case 'rare': return [100, 50, 100];
      default: return [50];
    }
  };

  const getParticleCount = (rarity: string): number => {
    switch (rarity) {
      case 'legendary': return 50;
      case 'epic': return 30;
      case 'rare': return 20;
      default: return 10;
    }
  };

  const getParticleColors = (rarity: string): string[] => {
    switch (rarity) {
      case 'legendary': return ['#FFD700', '#FFA500', '#FF6B35', '#F7931E'];
      case 'epic': return ['#9333EA', '#C084FC', '#A855F7', '#8B5CF6'];
      case 'rare': return ['#3B82F6', '#60A5FA', '#2563EB', '#1D4ED8'];
      default: return ['#6B7280', '#9CA3AF', '#4B5563', '#374151'];
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Screen Flash Effect */}
          {showScreenFlash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[100] pointer-events-none"
              style={{
                background: achievement.rarity === 'legendary' 
                  ? 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0) 70%)'
                  : achievement.rarity === 'epic'
                  ? 'radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(147,51,234,0) 70%)'
                  : 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%)'
              }}
            />
          )}

          {/* Particle Burst Effect */}
          <div className="fixed inset-0 z-[90] pointer-events-none">
            {[...Array(getParticleCount(achievement.rarity))].map((_, i) => {
              const colors = getParticleColors(achievement.rarity);
              const color = colors[i % colors.length];
              const size = Math.random() * 8 + 4;
              const delay = Math.random() * 0.5;
              
              return (
                <motion.div
                  key={`particle-${i}`}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                    rotate: 0
                  }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1, 1, 0],
                    x: window.innerWidth / 2 + (Math.random() - 0.5) * window.innerWidth * 1.2,
                    y: window.innerHeight / 2 + (Math.random() - 0.5) * window.innerHeight * 1.2,
                    rotate: Math.random() * 720
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: delay,
                    ease: "easeOut"
                  }}
                  className="absolute"
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: color,
                    borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                    boxShadow: `0 0 ${size}px ${color}40`
                  }}
                />
              );
            })}
          </div>

          {/* Confetti for Epic+ Achievements */}
          {showConfetti && ['epic', 'legendary'].includes(achievement.rarity) && (
            <div className="fixed inset-0 z-[85] pointer-events-none">
              {[...Array(100)].map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  initial={{
                    opacity: 1,
                    x: Math.random() * window.innerWidth,
                    y: -20,
                    rotate: 0,
                    scale: 1
                  }}
                  animate={{
                    opacity: [1, 1, 0],
                    y: window.innerHeight + 100,
                    rotate: Math.random() * 1080,
                    scale: [1, 1, 0]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    delay: Math.random() * 2,
                    ease: "linear"
                  }}
                  className="absolute w-3 h-3"
                  style={{
                    backgroundColor: getParticleColors(achievement.rarity)[i % getParticleColors(achievement.rarity).length],
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              ))}
            </div>
          )}

          {/* Ripple Effect for Legendary */}
          {achievement.rarity === 'legendary' && (
            <div className="fixed inset-0 z-[80] pointer-events-none flex items-center justify-center">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`ripple-${i}`}
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    ease: "easeOut"
                  }}
                  className="absolute border-4 border-yellow-400 rounded-full"
                  style={{
                    width: '100px',
                    height: '100px',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
                  }}
                />
              ))}
            </div>
          )}

          {/* Magic Sparkle Trail for Epic+ */}
          {['epic', 'legendary'].includes(achievement.rarity) && (
            <div className="fixed inset-0 z-[75] pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: Math.random() * 2,
                    repeat: 2,
                    repeatType: "loop"
                  }}
                  className="absolute"
                >
                  <div 
                    className="w-2 h-2 rotate-45"
                    style={{
                      background: achievement.rarity === 'legendary' 
                        ? 'linear-gradient(45deg, #FFD700, #FFA500)'
                        : 'linear-gradient(45deg, #9333EA, #C084FC)',
                      boxShadow: '0 0 10px currentColor'
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// Enhanced Screen Shake Hook
export function useScreenShake() {
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (isShaking) return;
    
    setIsShaking(true);
    const duration = intensity === 'heavy' ? 800 : intensity === 'medium' ? 500 : 300;
    
    // Apply CSS animation to body
    document.body.style.animation = `screen-shake-${intensity} ${duration}ms ease-in-out`;
    
    setTimeout(() => {
      document.body.style.animation = '';
      setIsShaking(false);
    }, duration);
  };

  return { triggerShake, isShaking };
}