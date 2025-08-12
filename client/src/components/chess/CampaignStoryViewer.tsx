import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Scroll, Crown, Swords, Shield, BookOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CampaignLevel } from '../../lib/stores/useCampaign';

interface CampaignStoryViewerProps {
  level: CampaignLevel;
  onStart: () => void;
  isPreGame?: boolean;
  isPostGame?: boolean;
  gameWon?: boolean;
}

export function CampaignStoryViewer({ 
  level, 
  onStart, 
  isPreGame = true, 
  isPostGame = false,
  gameWon = false 
}: CampaignStoryViewerProps) {
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  const storyText = isPostGame 
    ? (gameWon ? level.storyContent?.postWinStory : 'The battle is lost, but the war continues...')
    : level.storyContent?.preGameStory || '';

  const characterIntro = !isPostGame && level.storyContent?.characterIntroduction;

  useEffect(() => {
    if (storyText) {
      setIsTyping(true);
      setCurrentText('');
      setShowContinue(false);
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < storyText.length) {
          setCurrentText(prev => prev + storyText[index]);
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
          setShowContinue(true);
        }
      }, 30); // Typing speed

      return () => clearInterval(interval);
    }
  }, [storyText]);

  const getStoryIcon = () => {
    if (level.boardVariant === 'cosmic') return <Sparkles className="w-6 h-6" />;
    if (level.boardVariant === 'castle') return <Crown className="w-6 h-6" />;
    if (level.boardVariant === 'forest') return <Shield className="w-6 h-6" />;
    if (level.difficulty === 'grandmaster') return <Crown className="w-6 h-6" />;
    if (level.difficulty === 'master') return <Swords className="w-6 h-6" />;
    return <Scroll className="w-6 h-6" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-orange-400';
      case 'advanced': return 'text-red-400';
      case 'master': return 'text-purple-400';
      case 'grandmaster': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <Card className="medieval-card max-w-3xl w-full max-h-[90vh] overflow-auto">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`${getDifficultyColor(level.difficulty)}`}>
                  {getStoryIcon()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold cinzel-font">{level.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      AI Strength: {level.aiStrength}/10
                    </Badge>
                  </div>
                </div>
              </div>
              <BookOpen className="w-8 h-8 text-yellow-500/30" />
            </div>

            {/* Story Content */}
            <div className="space-y-6">
              {/* Main Story Text */}
              <div className="bg-black/30 rounded-lg p-6 border border-yellow-500/20">
                <p className="text-lg leading-relaxed text-gray-200 min-h-[100px]">
                  {currentText}
                  {isTyping && <span className="animate-pulse">|</span>}
                </p>
              </div>

              {/* Character Introduction */}
              {characterIntro && !isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30"
                >
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-400 mt-1" />
                    <p className="text-sm text-purple-200 italic">
                      {characterIntro}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Level Description */}
              {!isPostGame && !isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30"
                >
                  <h3 className="font-semibold text-blue-300 mb-2">Challenge:</h3>
                  <p className="text-sm text-blue-200">
                    {level.description}
                  </p>
                </motion.div>
              )}

              {/* Rewards Preview */}
              {!isPostGame && level.rewards && !isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="bg-green-900/20 rounded-lg p-4 border border-green-500/30"
                >
                  <h3 className="font-semibold text-green-300 mb-2">Victory Rewards:</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-800/50 text-green-200">
                      +{level.rewards.experiencePoints} XP
                    </Badge>
                    {level.rewards.unlocksBoardVariant && (
                      <Badge className="bg-blue-800/50 text-blue-200">
                        Unlocks {level.rewards.unlocksBoardVariant} Board
                      </Badge>
                    )}
                    {level.rewards.unlocksStory && (
                      <Badge className="bg-purple-800/50 text-purple-200">
                        Story Progression
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              {showContinue && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center gap-4 mt-8"
                >
                  {isPostGame ? (
                    <Button
                      onClick={onStart}
                      className="medieval-btn px-8 py-3 text-lg"
                    >
                      {gameWon ? 'Continue Journey' : 'Try Again'}
                    </Button>
                  ) : (
                    <Button
                      onClick={onStart}
                      className="medieval-btn px-8 py-3 text-lg group"
                    >
                      <span>Begin Battle</span>
                      <Swords className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                    </Button>
                  )}
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}