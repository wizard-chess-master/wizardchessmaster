import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Achievement } from '../../lib/achievements/types';
import { ACHIEVEMENTS } from '../../lib/achievements/definitions';
import { useAchievements } from '../../lib/achievements/achievementSystem';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Trophy, 
  Star, 
  Award, 
  User, 
  Target, 
  Clock, 
  Gamepad2,
  Filter,
  X,
  Crown,
  Zap
} from 'lucide-react';

interface AchievementPanelProps {
  onClose: () => void;
}

export function AchievementPanel({ onClose }: AchievementPanelProps) {
  const { 
    unlockedAchievements, 
    totalExperience, 
    currentLevel, 
    currentTitle,
    getProgressForAchievement,
    getNextLevelProgress
  } = useAchievements();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  const unlockedAchievementIds = Object.keys(unlockedAchievements);
  const unlockedCount = unlockedAchievementIds.length;
  const totalCount = ACHIEVEMENTS.filter(a => !a.hidden).length;
  
  const categories = ['all', 'gameplay', 'strategic', 'collection', 'mastery', 'special'];
  const rarities = ['all', 'common', 'rare', 'epic', 'legendary'];

  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    if (achievement.hidden && !unlockedAchievements[achievement.id]) return false;
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
    if (selectedRarity !== 'all' && achievement.rarity !== selectedRarity) return false;
    return true;
  });

  const levelProgress = getNextLevelProgress();

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'border-gray-300 bg-gray-50/50',
      rare: 'border-blue-300 bg-blue-50/50',
      epic: 'border-purple-300 bg-purple-50/50',
      legendary: 'border-yellow-300 bg-yellow-50/50'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityIcon = (rarity: string) => {
    const icons = {
      common: <Star className="w-4 h-4" />,
      rare: <Trophy className="w-4 h-4" />,
      epic: <Award className="w-4 h-4" />,
      legendary: <Crown className="w-4 h-4 text-yellow-500" />
    };
    return icons[rarity as keyof typeof icons] || icons.common;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      gameplay: <Gamepad2 className="w-4 h-4" />,
      strategic: <Target className="w-4 h-4" />,
      collection: <Clock className="w-4 h-4" />,
      mastery: <Zap className="w-4 h-4" />,
      special: <Crown className="w-4 h-4" />
    };
    return icons[category as keyof typeof icons] || <Star className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-background rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Trophy className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Achievements</h2>
                <p className="text-blue-100">
                  {unlockedCount} of {totalCount} unlocked • Level {currentLevel} {currentTitle}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Experience Progress</span>
              <span>{Math.round(levelProgress.current)} / {Math.round(levelProgress.next)} XP</span>
            </div>
            <Progress value={levelProgress.progress * 100} className="h-2" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <Tabs defaultValue="achievements" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="achievements">
              {/* Filters */}
              <div className="flex gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="all">All Rarities</option>
                  {rarities.slice(1).map(rarity => (
                    <option key={rarity} value={rarity}>
                      {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Achievements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAchievements.map((achievement) => {
                  const isUnlocked = !!unlockedAchievements[achievement.id];
                  const progress = getProgressForAchievement(achievement);
                  const progressPercent = (progress / achievement.criteria.target) * 100;

                  return (
                    <motion.div
                      key={achievement.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative ${isUnlocked ? '' : 'opacity-60'}`}
                    >
                      <Card className={`h-full ${getRarityColor(achievement.rarity)} ${
                        isUnlocked ? 'border-2' : 'border-dashed'
                      }`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="text-4xl">{achievement.icon}</div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="outline" className="capitalize flex items-center gap-1">
                                {getRarityIcon(achievement.rarity)}
                                {achievement.rarity}
                              </Badge>
                              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                {getCategoryIcon(achievement.category)}
                                {achievement.category}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{achievement.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {achievement.description}
                            </p>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          {/* Progress */}
                          {!isUnlocked && (
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{progress} / {achievement.criteria.target}</span>
                              </div>
                              <Progress value={progressPercent} className="h-1" />
                            </div>
                          )}

                          {/* Reward */}
                          <div className="bg-white/30 rounded-lg p-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span>Reward:</span>
                              <span className="font-bold text-green-600">
                                +{achievement.reward.experiencePoints} XP
                              </span>
                            </div>
                            {achievement.reward.title && (
                              <div className="flex justify-between items-center mt-1">
                                <span>Title:</span>
                                <Badge variant="outline" className="text-xs">
                                  {achievement.reward.title}
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Unlock Date */}
                          {isUnlocked && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Unlocked: {new Date(unlockedAchievements[achievement.id].unlockedAt).toLocaleDateString()}
                            </div>
                          )}
                        </CardContent>

                        {/* Unlocked Overlay */}
                        {isUnlocked && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-green-500 text-white rounded-full p-1">
                              <Trophy className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <AchievementStats />
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}

// Statistics Component
function AchievementStats() {
  const { progress, unlockedAchievements, totalExperience } = useAchievements();

  const stats = [
    { label: 'Games Played', value: progress.gamesPlayed, icon: <Gamepad2 className="w-5 h-5" /> },
    { label: 'Games Won', value: progress.gamesWon, icon: <Trophy className="w-5 h-5" /> },
    { label: 'Win Rate', value: `${progress.gamesPlayed > 0 ? Math.round((progress.gamesWon / progress.gamesPlayed) * 100) : 0}%`, icon: <Target className="w-5 h-5" /> },
    { label: 'Checkmates', value: progress.checkmates, icon: <Crown className="w-5 h-5" /> },
    { label: 'Pieces Captured', value: progress.totalCaptures, icon: <Zap className="w-5 h-5" /> },
    { label: 'Win Streak', value: progress.winStreak, icon: <Star className="w-5 h-5" /> },
    { label: 'Wizard Teleports', value: progress.wizardTeleports, icon: <User className="w-5 h-5" /> },
    { label: 'Total Experience', value: totalExperience, icon: <Award className="w-5 h-5" /> }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-blue-600">{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}