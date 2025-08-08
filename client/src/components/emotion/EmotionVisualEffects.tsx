/**
 * Emotion Visual Effects Component
 * Creates visual effects on the chess board based on detected player emotions
 */

import React, { useRef, useEffect, useState } from 'react';
import { type PlayerEmotion } from '../../lib/emotion/emotionRecognition';

interface EmotionVisualEffectsProps {
  emotion: PlayerEmotion;
  confidence: number;
  triggerEffect?: boolean;
  onEffectComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  alpha: number;
}

export function EmotionVisualEffects({ 
  emotion, 
  confidence, 
  triggerEffect = false,
  onEffectComplete 
}: EmotionVisualEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Emotion-specific effect configurations
  const getEffectConfig = (emotion: PlayerEmotion) => {
    const configs: Record<PlayerEmotion, {
      colors: string[];
      particleCount: number;
      speed: number;
      duration: number;
      pattern: 'burst' | 'spiral' | 'wave' | 'glow' | 'sparkle';
    }> = {
      confident: {
        colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
        particleCount: 30,
        speed: 2,
        duration: 2000,
        pattern: 'glow'
      },
      frustrated: {
        colors: ['#ef4444', '#f87171', '#fca5a5'],
        particleCount: 40,
        speed: 3,
        duration: 1500,
        pattern: 'burst'
      },
      focused: {
        colors: ['#10b981', '#34d399', '#6ee7b7'],
        particleCount: 20,
        speed: 1.5,
        duration: 3000,
        pattern: 'spiral'
      },
      excited: {
        colors: ['#f59e0b', '#fbbf24', '#fde047'],
        particleCount: 50,
        speed: 4,
        duration: 1800,
        pattern: 'sparkle'
      },
      anxious: {
        colors: ['#f97316', '#fb923c', '#fdba74'],
        particleCount: 25,
        speed: 2.5,
        duration: 2200,
        pattern: 'wave'
      },
      satisfied: {
        colors: ['#a855f7', '#c084fc', '#d8b4fe'],
        particleCount: 35,
        speed: 1.8,
        duration: 2500,
        pattern: 'glow'
      },
      curious: {
        colors: ['#6366f1', '#818cf8', '#a5b4fc'],
        particleCount: 30,
        speed: 2.2,
        duration: 2800,
        pattern: 'spiral'
      },
      determined: {
        colors: ['#374151', '#6b7280', '#9ca3af'],
        particleCount: 40,
        speed: 1.5,
        duration: 3000,
        pattern: 'wave'
      }
    };

    return configs[emotion];
  };

  // Create particles based on emotion and pattern
  const createParticles = (emotion: PlayerEmotion, confidence: number): Particle[] => {
    const config = getEffectConfig(emotion);
    const centerX = 150; // Canvas center
    const centerY = 150;
    const particles: Particle[] = [];
    const particleCount = Math.round(config.particleCount * confidence);

    for (let i = 0; i < particleCount; i++) {
      let x = centerX;
      let y = centerY;
      let vx = 0;
      let vy = 0;

      switch (config.pattern) {
        case 'burst':
          const angle = (i / particleCount) * Math.PI * 2;
          vx = Math.cos(angle) * config.speed * (0.5 + Math.random() * 0.5);
          vy = Math.sin(angle) * config.speed * (0.5 + Math.random() * 0.5);
          break;

        case 'spiral':
          const spiralAngle = (i / particleCount) * Math.PI * 4;
          const radius = (i / particleCount) * 50;
          x = centerX + Math.cos(spiralAngle) * radius;
          y = centerY + Math.sin(spiralAngle) * radius;
          vx = -Math.sin(spiralAngle) * config.speed;
          vy = Math.cos(spiralAngle) * config.speed;
          break;

        case 'wave':
          x = (i / particleCount) * 300;
          y = centerY + Math.sin((i / particleCount) * Math.PI * 4) * 30;
          vx = config.speed * (Math.random() - 0.5);
          vy = config.speed * (Math.random() - 0.5);
          break;

        case 'glow':
          const glowRadius = 20 + Math.random() * 40;
          const glowAngle = Math.random() * Math.PI * 2;
          x = centerX + Math.cos(glowAngle) * glowRadius;
          y = centerY + Math.sin(glowAngle) * glowRadius;
          vx = Math.cos(glowAngle) * config.speed * 0.3;
          vy = Math.sin(glowAngle) * config.speed * 0.3;
          break;

        case 'sparkle':
          x = centerX + (Math.random() - 0.5) * 100;
          y = centerY + (Math.random() - 0.5) * 100;
          vx = (Math.random() - 0.5) * config.speed * 2;
          vy = (Math.random() - 0.5) * config.speed * 2;
          break;
      }

      particles.push({
        x,
        y,
        vx,
        vy,
        life: config.duration,
        maxLife: config.duration,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        size: 2 + Math.random() * 4,
        alpha: confidence * 0.8 + 0.2
      });
    }

    return particles;
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with slight trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setParticles(currentParticles => {
      const updatedParticles = currentParticles
        .map(particle => {
          // Update position
          particle.x += particle.vx;
          particle.y += particle.vy;
          
          // Update life
          particle.life -= 16; // Assuming 60fps
          
          // Apply gravity for some effects
          if (particle.vy > -5) {
            particle.vy += 0.1;
          }
          
          // Fade alpha based on life
          particle.alpha = (particle.life / particle.maxLife) * confidence;
          
          return particle;
        })
        .filter(particle => particle.life > 0);

      // Draw particles
      updatedParticles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = particle.size * 2;
        ctx.fill();
        ctx.restore();
      });

      // Continue animation if particles exist
      if (updatedParticles.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return updatedParticles;
      } else {
        // Animation complete
        setIsAnimating(false);
        onEffectComplete?.();
        return [];
      }
    });
  };

  // Trigger effect when needed
  useEffect(() => {
    if (triggerEffect && !isAnimating) {
      setIsAnimating(true);
      const newParticles = createParticles(emotion, confidence);
      setParticles(newParticles);
      
      // Start animation
      animationFrameRef.current = requestAnimationFrame(animate);
      
      console.log(`🎭 Triggering ${emotion} emotion effect with ${newParticles.length} particles`);
    }
  }, [triggerEffect, emotion, confidence]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      className="emotion-effects-canvas absolute top-0 left-0 pointer-events-none z-10"
      style={{ 
        opacity: isAnimating ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    />
  );
}

export default EmotionVisualEffects;