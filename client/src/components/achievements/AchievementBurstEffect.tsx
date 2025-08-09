import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BurstEffectProps {
  isActive: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  onComplete?: () => void;
}

export function AchievementBurstEffect({ isActive, rarity, onComplete }: BurstEffectProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    life: number;
  }>>([]);

  useEffect(() => {
    if (!isActive) return;

    const colors = {
      legendary: ['#FFD700', '#FFA500', '#FF6B35', '#F7931E'],
      epic: ['#9333EA', '#C084FC', '#A855F7', '#8B5CF6'],
      rare: ['#3B82F6', '#60A5FA', '#2563EB', '#1D4ED8'],
      common: ['#6B7280', '#9CA3AF', '#4B5563', '#374151']
    };

    const particleCount = {
      legendary: 80,
      epic: 60,
      rare: 40,
      common: 20
    };

    const newParticles = Array.from({ length: particleCount[rarity] }, (_, i) => {
      const angle = (i / particleCount[rarity]) * Math.PI * 2;
      const velocity = 200 + Math.random() * 300;
      const colorArray = colors[rarity];
      
      return {
        id: i,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color: colorArray[Math.floor(Math.random() * colorArray.length)],
        size: 3 + Math.random() * 6,
        life: 1.0
      };
    });

    setParticles(newParticles);

    // Animation loop
    const animationFrame = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx * 0.016,
            y: particle.y + particle.vy * 0.016,
            vy: particle.vy + 300 * 0.016, // gravity
            vx: particle.vx * 0.99, // friction
            life: particle.life - 0.016
          }))
          .filter(particle => particle.life > 0)
      );
    }, 16);

    // Cleanup
    const timeout = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 3000);

    return () => {
      clearInterval(animationFrame);
      clearTimeout(timeout);
    };
  }, [isActive, rarity, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 z-[95] pointer-events-none">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: '50%',
                opacity: particle.life,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Firework effect for legendary achievements
export function AchievementFirework({ isActive, onComplete }: { isActive: boolean; onComplete?: () => void }) {
  const [fireworks, setFireworks] = useState<Array<{
    id: number;
    x: number;
    y: number;
    particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
    }>;
  }>>([]);

  useEffect(() => {
    if (!isActive) return;

    const colors = ['#FFD700', '#FF6B35', '#FF1493', '#00CED1', '#32CD32'];
    
    // Create multiple fireworks
    const fireworksData = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 100 + Math.random() * (window.innerWidth - 200),
      y: 100 + Math.random() * (window.innerHeight - 300),
      particles: Array.from({ length: 30 }, (_, j) => {
        const angle = (j / 30) * Math.PI * 2;
        const speed = 100 + Math.random() * 150;
        return {
          x: 0,
          y: 0,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          color: colors[Math.floor(Math.random() * colors.length)]
        };
      })
    }));

    setFireworks(fireworksData);

    const animationFrame = setInterval(() => {
      setFireworks(prev => 
        prev.map(firework => ({
          ...firework,
          particles: firework.particles
            .map(particle => ({
              ...particle,
              x: particle.x + particle.vx * 0.016,
              y: particle.y + particle.vy * 0.016,
              vy: particle.vy + 200 * 0.016,
              vx: particle.vx * 0.98,
              life: particle.life - 0.02
            }))
            .filter(particle => particle.life > 0)
        }))
        .filter(firework => firework.particles.length > 0)
      );
    }, 16);

    const timeout = setTimeout(() => {
      setFireworks([]);
      onComplete?.();
    }, 4000);

    return () => {
      clearInterval(animationFrame);
      clearTimeout(timeout);
    };
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          {fireworks.map(firework => 
            firework.particles.map((particle, i) => (
              <div
                key={`${firework.id}-${i}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: firework.x + particle.x,
                  top: firework.y + particle.y,
                  backgroundColor: particle.color,
                  opacity: particle.life,
                  boxShadow: `0 0 10px ${particle.color}`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))
          )}
        </div>
      )}
    </AnimatePresence>
  );
}