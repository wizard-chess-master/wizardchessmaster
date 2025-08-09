import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '../../lib/achievements/types';
import { useAchievements } from '../../lib/achievements/achievementSystem';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { X, Star, Trophy, Award, Crown, Zap } from 'lucide-react';
import { AchievementCelebration, useScreenShake } from './AchievementCelebration';
import { AchievementBurstEffect, AchievementFirework } from './AchievementBurstEffect';

interface EnhancedAchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  onViewAll?: () => void;
}

export function EnhancedAchievementNotification({ 
  achievement, 
  onClose, 
  onViewAll 
}: EnhancedAchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showMainCard, setShowMainCard] = useState(false);
  const [showBurstEffect, setShowBurstEffect] = useState(false);
  const [showFirework, setShowFirework] = useState(false);
  const { markAchievementAsViewed } = useAchievements();
  const { triggerShake } = useScreenShake();

  useEffect(() => {
    // Trigger screen shake for epic+ achievements
    if (['epic', 'legendary'].includes(achievement.rarity)) {
      const intensity = achievement.rarity === 'legendary' ? 'heavy' : 'medium';
      triggerShake(intensity);
    }

    // Trigger burst effects based on rarity
    if (['rare', 'epic', 'legendary'].includes(achievement.rarity)) {
      setTimeout(() => setShowBurstEffect(true), 200);
    }

    // Trigger firework for legendary
    if (achievement.rarity === 'legendary') {
      setTimeout(() => setShowFirework(true), 1000);
    }

    // Delay showing main card for dramatic effect
    setTimeout(() => setShowMainCard(true), 500);

    // Auto-close after 10 seconds for better user experience
    const timer = setTimeout(() => {
      handleClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [achievement.rarity, triggerShake]);

  const handleClose = () => {
    setIsVisible(false);
    markAchievementAsViewed(achievement.id);
    setTimeout(onClose, 500); // Wait for exit animation
  };

  const getRarityConfig = (rarity: string) => {
    const configs = {
      common: { 
        color: 'border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100',
        glow: 'shadow-lg',
        icon: Star,
        iconColor: 'text-gray-500'
      },
      rare: { 
        color: 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100',
        glow: 'shadow-blue-500/30 shadow-xl',
        icon: Trophy,
        iconColor: 'text-blue-500'
      },
      epic: { 
        color: 'border-purple-400 bg-gradient-to-br from-purple-50 to-purple-100',
        glow: 'shadow-purple-500/40 shadow-2xl',
        icon: Award,
        iconColor: 'text-purple-500'
      },
      legendary: { 
        color: 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100',
        glow: 'shadow-yellow-500/50 shadow-2xl',
        icon: Crown,
        iconColor: 'text-yellow-500'
      }
    };
    return configs[rarity as keyof typeof configs] || configs.common;
  };

  const config = getRarityConfig(achievement.rarity);
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Celebration Effects */}
          <AchievementCelebration achievement={achievement} isVisible={isVisible} />
          
          {/* Burst Effects */}
          <AchievementBurstEffect 
            isActive={showBurstEffect} 
            rarity={achievement.rarity}
            onComplete={() => setShowBurstEffect(false)}
          />
          
          {/* Firework Effects for Legendary */}
          <AchievementFirework 
            isActive={showFirework}
            onComplete={() => setShowFirework(false)}
          />
          
          {/* Main Achievement Card */}
          <AnimatePresence>
            {showMainCard && (
              <motion.div
                initial={{ opacity: 0, scale: 0.3, y: -200 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  rotate: [0, -1, 1, 0]
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.8, 
                  y: -100,
                  transition: { duration: 0.5 }
                }}
                transition={{ 
                  type: "spring", 
                  duration: 0.8, 
                  bounce: 0.6,
                  rotate: { duration: 0.2, delay: 0.8 }
                }}
                className="fixed top-4 left-4 right-4 z-[110] w-full max-w-md mx-auto sm:left-auto sm:right-4 sm:w-96"
              >
                <Card className={`medieval-panel achievement-notification ${config.color} border-2 ${config.glow} overflow-hidden relative`}>
                  {/* Animated Border Glow */}
                  <motion.div
                    animate={{
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-lg border-2"
                    style={{
                      borderColor: achievement.rarity === 'legendary' ? '#FFD700' :
                                   achievement.rarity === 'epic' ? '#9333EA' :
                                   achievement.rarity === 'rare' ? '#3B82F6' : '#6B7280',
                      filter: 'blur(1px)'
                    }}
                  />

                  <CardContent className="p-6 relative z-10">
                    {/* Header with enhanced animations */}
                    <motion.div 
                      className="flex items-start justify-between mb-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                    >
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3
                          }}
                        >
                          <Badge variant="outline" className={`capitalize flex items-center gap-1 ${config.iconColor}`}>
                            <IconComponent className="w-3 h-3" />
                            {achievement.rarity}
                          </Badge>
                        </motion.div>
                        
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1.2, type: "spring" }}
                        >
                          <Badge variant="secondary" className="text-xs">
                            {achievement.category}
                          </Badge>
                        </motion.div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="h-6 w-6 p-0 hover:bg-white/20 opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>

                    {/* Achievement Content with Enhanced Animations */}
                    <div className="text-center mb-6">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ 
                          scale: [0, 1.3, 1],
                          rotate: [0, 360, 360]
                        }}
                        transition={{ 
                          delay: 0.3, 
                          type: "spring", 
                          duration: 1.2,
                          scale: { times: [0, 0.8, 1] }
                        }}
                        className="text-8xl mb-3 relative"
                      >
                        {/* Pulsing glow effect for legendary */}
                        {achievement.rarity === 'legendary' && (
                          <motion.div
                            animate={{
                              opacity: [0, 0.8, 0],
                              scale: [0.8, 1.2, 0.8]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="absolute inset-0 text-8xl"
                            style={{
                              filter: 'blur(20px)',
                              color: '#FFD700'
                            }}
                          >
                            {achievement.icon}
                          </motion.div>
                        )}
                        
                        <span className="relative z-10">{achievement.icon}</span>
                      </motion.div>
                      
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="font-bold text-xl medieval-text text-foreground mb-2"
                      >
                        {achievement.name}
                      </motion.h3>
                      
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="text-sm text-muted-foreground"
                      >
                        {achievement.description}
                      </motion.p>
                    </div>

                    {/* Enhanced Reward Display */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 }}
                      className="bg-white/30 rounded-lg p-3 mb-4 border border-white/20"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          Reward:
                        </span>
                        <motion.span 
                          className="text-green-600 font-bold"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ delay: 1.4, duration: 0.3 }}
                        >
                          +{achievement.reward.experiencePoints} XP
                        </motion.span>
                      </div>
                      {achievement.reward.title && (
                        <motion.div 
                          className="flex items-center justify-between text-sm mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.6 }}
                        >
                          <span className="font-medium">Title Unlocked:</span>
                          <Badge variant="outline" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100">
                            {achievement.reward.title}
                          </Badge>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Unlock Message */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.8 }}
                      className="text-center mb-6"
                    >
                      <p className="text-sm italic text-muted-foreground font-medium">
                        "{achievement.reward.unlockMessage}"
                      </p>
                    </motion.div>

                    {/* Enhanced Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2 }}
                      className="flex gap-3"
                    >
                      <Button
                        onClick={handleClose}
                        variant="outline"
                        size="sm"
                        className="flex-1 medieval-btn hover:scale-105 transition-transform"
                      >
                        Continue Playing
                      </Button>
                      {onViewAll && (
                        <Button
                          onClick={() => {
                            onViewAll();
                            handleClose();
                          }}
                          variant="default"
                          size="sm"
                          className="flex-1 medieval-btn hover:scale-105 transition-transform"
                        >
                          View All
                        </Button>
                      )}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}