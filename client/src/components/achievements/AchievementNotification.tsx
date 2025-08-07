import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '../../lib/achievements/types';
import { ACHIEVEMENTS } from '../../lib/achievements/definitions';
import { useAchievements } from '../../lib/achievements/achievementSystem';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { X, Star, Trophy, Award } from 'lucide-react';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  onViewAll?: () => void;
}

export function AchievementNotification({ achievement, onClose, onViewAll }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { markAchievementAsViewed } = useAchievements();

  useEffect(() => {
    // Auto-close after 8 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    markAchievementAsViewed(achievement.id);
    setTimeout(onClose, 300); // Wait for animation
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'border-gray-400 bg-gray-50',
      rare: 'border-blue-400 bg-blue-50',
      epic: 'border-purple-400 bg-purple-50',
      legendary: 'border-yellow-400 bg-yellow-50'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityIcon = (rarity: string) => {
    const icons = {
      common: <Star className="w-4 h-4" />,
      rare: <Trophy className="w-4 h-4" />,
      epic: <Award className="w-4 h-4" />,
      legendary: <Award className="w-4 h-4 text-yellow-500" />
    };
    return icons[rarity as keyof typeof icons] || icons.common;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
          className="fixed top-4 right-4 z-50 w-96 max-w-[90vw]"
        >
          <Card className={`medieval-panel achievement-notification ${getRarityColor(achievement.rarity)} border-2 shadow-2xl`}>
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize flex items-center gap-1">
                    {getRarityIcon(achievement.rarity)}
                    {achievement.rarity}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {achievement.category}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-6 w-6 p-0 hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Achievement Content */}
              <div className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
                  className="text-6xl mb-2"
                >
                  {achievement.icon}
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="font-bold text-lg medieval-text text-foreground"
                >
                  {achievement.name}
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-muted-foreground mt-1"
                >
                  {achievement.description}
                </motion.p>
              </div>

              {/* Reward Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white/30 rounded-lg p-3 mb-4"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Reward:</span>
                  <span className="text-green-600 font-bold">
                    +{achievement.reward.experiencePoints} XP
                  </span>
                </div>
                {achievement.reward.title && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="font-medium">Title:</span>
                    <Badge variant="outline" className="text-xs">
                      {achievement.reward.title}
                    </Badge>
                  </div>
                )}
              </motion.div>

              {/* Unlock Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center mb-4"
              >
                <p className="text-sm italic text-muted-foreground">
                  "{achievement.reward.unlockMessage}"
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex gap-2"
              >
                <Button
                  onClick={handleClose}
                  variant="outline"
                  size="sm"
                  className="flex-1 medieval-btn"
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
                    className="flex-1 medieval-btn"
                  >
                    View All
                  </Button>
                )}
              </motion.div>
            </CardContent>
          </Card>

          {/* Celebration Effects */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Sparkle effects for epic/legendary */}
            {(achievement.rarity === 'epic' || achievement.rarity === 'legendary') && (
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [0, (Math.random() - 0.5) * 400],
                      y: [0, (Math.random() - 0.5) * 400]
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    className="absolute top-1/2 left-1/2 w-2 h-2"
                  >
                    <div className={`w-full h-full rounded-full ${
                      achievement.rarity === 'legendary' ? 'bg-yellow-400' : 'bg-purple-400'
                    }`} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Queue system for multiple notifications
interface NotificationQueueProps {
  onViewAll?: () => void;
}

export function AchievementNotificationQueue({ onViewAll }: NotificationQueueProps) {
  const { getNewAchievements } = useAchievements();
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);
  const [queue, setQueue] = useState<Achievement[]>([]);

  useEffect(() => {
    const newAchievements = getNewAchievements();
    if (newAchievements.length > 0 && !currentNotification) {
      setQueue(newAchievements);
      setCurrentNotification(newAchievements[0]);
    }
  }, [getNewAchievements]);

  const handleClose = () => {
    setCurrentNotification(null);
    const remainingQueue = queue.slice(1);
    setQueue(remainingQueue);
    
    if (remainingQueue.length > 0) {
      setTimeout(() => {
        setCurrentNotification(remainingQueue[0]);
      }, 500); // Brief delay between notifications
    }
  };

  return currentNotification ? (
    <AchievementNotification
      achievement={currentNotification}
      onClose={handleClose}
      onViewAll={onViewAll}
    />
  ) : null;
}