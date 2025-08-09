import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Gift, Sparkles } from 'lucide-react';
import { useCampaign } from '../../lib/stores/useCampaign';

interface RewardData {
  levelName: string;
  experiencePoints?: number;
  unlocksBoardVariant?: string;
  unlocksStory?: boolean;
  levelId: string;
}

interface CampaignRewardCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  rewardData: RewardData | null;
}

export function CampaignRewardCelebration({ isOpen, onClose, rewardData }: CampaignRewardCelebrationProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!rewardData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotateY: -180 }}
            transition={{ 
              type: "spring", 
              damping: 15, 
              stiffness: 200,
              duration: 0.8 
            }}
            className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-xl shadow-2xl border-4 border-amber-300 p-8 max-w-md mx-4 text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background sparkles */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>

            {/* Main content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={showContent ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="mb-4"
              >
                <Trophy className="w-16 h-16 mx-auto text-amber-600" />
              </motion.div>

              <h2 className="text-2xl font-bold text-amber-800 mb-2">
                Level Complete!
              </h2>
              
              <p className="text-lg text-amber-700 mb-6">
                🎉 {rewardData.levelName} conquered! 🎉
              </p>

              {/* Rewards display */}
              <div className="space-y-4">
                {rewardData.experiencePoints && (
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={showContent ? { x: 0, opacity: 1 } : { x: -50, opacity: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-3 bg-amber-100 rounded-lg p-3 border border-amber-200"
                  >
                    <Star className="w-6 h-6 text-yellow-600" />
                    <span className="text-amber-800 font-semibold">
                      +{rewardData.experiencePoints} Experience Points
                    </span>
                  </motion.div>
                )}

                {rewardData.unlocksBoardVariant && (
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={showContent ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center justify-center gap-3 bg-green-100 rounded-lg p-3 border border-green-200"
                  >
                    <Gift className="w-6 h-6 text-green-600" />
                    <span className="text-green-800 font-semibold">
                      Unlocked: {rewardData.unlocksBoardVariant.charAt(0).toUpperCase() + rewardData.unlocksBoardVariant.slice(1)} Board
                    </span>
                  </motion.div>
                )}

                {rewardData.unlocksStory && (
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={showContent ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex items-center justify-center gap-3 bg-purple-100 rounded-lg p-3 border border-purple-200"
                  >
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    <span className="text-purple-800 font-semibold">
                      New Story Content Unlocked
                    </span>
                  </motion.div>
                )}
              </div>

              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={showContent ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ delay: 1.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
              >
                Continue Adventure
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage campaign reward celebrations
export function useCampaignRewardCelebration() {
  const [isOpen, setIsOpen] = useState(false);
  const [rewardData, setRewardData] = useState<RewardData | null>(null);

  const showCelebration = (data: RewardData) => {
    setRewardData(data);
    setIsOpen(true);
  };

  const hideCelebration = () => {
    setIsOpen(false);
    setTimeout(() => setRewardData(null), 300);
  };

  return {
    isOpen,
    rewardData,
    showCelebration,
    hideCelebration,
    CelebrationComponent: () => (
      <CampaignRewardCelebration
        isOpen={isOpen}
        onClose={hideCelebration}
        rewardData={rewardData}
      />
    ),
  };
}