import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, Star, Trophy, Crown, Zap, Shield } from 'lucide-react';
import { useCampaign } from '@/lib/stores/useCampaign';
import type { CampaignLevel } from '@/lib/stores/useCampaign';

interface MapNode {
  level: CampaignLevel;
  position: { x: number; y: number };
  connections: string[];
}

interface CampaignMapViewProps {
  onLevelSelect: (levelId: string) => void;
  onShowStory: (level: CampaignLevel, type: 'pre-game' | 'character-intro') => void;
}

export function CampaignMapView({ onLevelSelect, onShowStory }: CampaignMapViewProps) {
  const { levels, playerStats } = useCampaign();
  const [selectedLevel, setSelectedLevel] = useState<CampaignLevel | null>(null);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  // Create map layout with positioned nodes
  const mapNodes: MapNode[] = [
    { level: levels[0], position: { x: 10, y: 80 }, connections: ['level2'] },
    { level: levels[1], position: { x: 25, y: 65 }, connections: ['level3'] },
    { level: levels[2], position: { x: 40, y: 50 }, connections: ['level4'] },
    { level: levels[3], position: { x: 55, y: 35 }, connections: ['level5'] },
    { level: levels[4], position: { x: 70, y: 20 }, connections: [] },
  ];

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Shield className="w-4 h-4 text-green-500" />;
      case 'medium': return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'hard': return <Crown className="w-4 h-4 text-red-500" />;
      case 'advanced': return <Trophy className="w-4 h-4 text-purple-500" />;
      default: return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'from-green-400 to-green-600';
      case 'medium': return 'from-yellow-400 to-yellow-600';
      case 'hard': return 'from-red-400 to-red-600';
      case 'advanced': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const renderStars = (stars: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleLevelClick = (level: CampaignLevel) => {
    if (!level.unlocked) return;
    
    setSelectedLevel(level);
    
    // Show story if available
    if (level.storyContent?.preGameStory && !level.completed) {
      onShowStory(level, 'pre-game');
    } else {
      onLevelSelect(level.id);
    }
  };

  return (
    <div className="campaign-map-container relative">
      {/* Map Background */}
      <div className="relative w-full h-[600px] bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 rounded-lg border-2 border-amber-300 overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 to-yellow-200/20" />
        </div>

        {/* Path Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {mapNodes.map((node) =>
            node.connections.map((targetId) => {
              const targetNode = mapNodes.find(n => n.level.id === targetId);
              if (!targetNode) return null;
              
              const isUnlocked = targetNode.level.unlocked;
              
              return (
                <motion.line
                  key={`${node.level.id}-${targetId}`}
                  x1={`${node.position.x}%`}
                  y1={`${node.position.y}%`}
                  x2={`${targetNode.position.x}%`}
                  y2={`${targetNode.position.y}%`}
                  stroke={isUnlocked ? '#d97706' : '#d1d5db'}
                  strokeWidth="3"
                  strokeDasharray={isUnlocked ? '0' : '5,5'}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              );
            })
          )}
        </svg>

        {/* Level Nodes */}
        {mapNodes.map((node, index) => (
          <motion.div
            key={node.level.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
              !node.level.unlocked ? 'cursor-not-allowed' : ''
            }`}
            style={{
              left: `${node.position.x}%`,
              top: `${node.position.y}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            onMouseEnter={() => setHoveredLevel(node.level.id)}
            onMouseLeave={() => setHoveredLevel(null)}
            onClick={() => handleLevelClick(node.level)}
          >
            {/* Level Circle */}
            <div
              className={`w-16 h-16 rounded-full border-4 flex items-center justify-center relative ${
                node.level.unlocked
                  ? `bg-gradient-to-br ${getDifficultyColor(node.level.difficulty)} border-white shadow-lg hover:scale-110`
                  : 'bg-gray-400 border-gray-300 opacity-50'
              } transition-all duration-200`}
            >
              {node.level.unlocked ? (
                <div className="text-white font-bold text-lg">
                  {node.level.completed ? (
                    <Trophy className="w-6 h-6" />
                  ) : (
                    index + 1
                  )}
                </div>
              ) : (
                <Lock className="w-6 h-6 text-gray-600" />
              )}

              {/* Premium Badge */}
              {node.level.isPremiumLevel && (
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  P
                </div>
              )}

              {/* Stars */}
              {node.level.completed && node.level.stars > 0 && (
                <div className="absolute -bottom-8 flex gap-1">
                  {renderStars(node.level.stars)}
                </div>
              )}
            </div>

            {/* Level Info Tooltip */}
            {hoveredLevel === node.level.id && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-20 z-10"
                style={{
                  left: node.position.x > 70 ? 'auto' : '50%',
                  right: node.position.x > 70 ? '0' : 'auto',
                  transform: node.position.x > 70 ? 'translateX(0)' : 'translateX(-50%)'
                }}
              >
                <Card className="w-64 shadow-xl border-2 border-amber-300">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-amber-900">{node.level.name}</h3>
                        {getDifficultyIcon(node.level.difficulty)}
                      </div>
                      
                      <p className="text-sm text-amber-700">{node.level.description}</p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline" className="text-amber-700">
                          AI Level {node.level.aiStrength}
                        </Badge>
                        {node.level.boardVariant !== 'classic' && (
                          <Badge variant="secondary" className="text-purple-700">
                            {node.level.boardVariant}
                          </Badge>
                        )}
                      </div>

                      {node.level.completed && (
                        <div className="pt-2 border-t border-amber-200">
                          <div className="flex justify-between text-xs text-amber-600">
                            <span>Wins: {node.level.wins}</span>
                            <span>Attempts: {node.level.attempts}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Campaign Progress Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Campaign Progress</p>
                <p className="text-2xl font-bold text-amber-900">
                  {Math.round(playerStats.campaignProgress)}%
                </p>
              </div>
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>
            <Progress 
              value={playerStats.campaignProgress} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Total Victories</p>
                <p className="text-2xl font-bold text-green-900">{playerStats.totalWins}</p>
              </div>
              <Crown className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">
              Win Streak: {playerStats.winStreak}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Skill Rating</p>
                <p className="text-2xl font-bold text-purple-900">{playerStats.skillRating}</p>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-purple-600 mt-2">
              Level {playerStats.currentLevel}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}