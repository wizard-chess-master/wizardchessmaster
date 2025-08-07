import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { useCampaign, CampaignLevel } from '../../lib/stores/useCampaign';
import { useChess } from '../../lib/stores/useChess';
import { 
  Trophy, 
  Star, 
  Lock, 
  Play, 
  Target, 
  Zap, 
  Crown,
  Sword,
  Shield,
  Wand2
} from 'lucide-react';

interface CampaignDialogProps {
  children: React.ReactNode;
}

export function CampaignDialog({ children }: CampaignDialogProps) {
  const { 
    levels, 
    playerStats, 
    initializeCampaign, 
    startCampaignLevel,
    resetCampaign 
  } = useCampaign();
  const { startGame } = useChess();

  useEffect(() => {
    initializeCampaign();
  }, [initializeCampaign]);

  const handleStartLevel = (level: CampaignLevel) => {
    startCampaignLevel(level.id);
    // Map campaign difficulty to AI difficulty
    const aiDifficultyMap: Record<string, 'easy' | 'medium' | 'hard' | 'advanced'> = {
      'easy': 'easy',
      'medium': 'medium', 
      'hard': 'hard',
      'advanced': 'advanced',
      'master': 'advanced', // Map to advanced for now
      'grandmaster': 'advanced' // Map to advanced for now
    };
    const aiDifficulty = aiDifficultyMap[level.difficulty] || 'medium';
    startGame('ai', aiDifficulty);
  };

  const getLevelIcon = (level: CampaignLevel) => {
    switch (level.aiStrength) {
      case 1:
      case 2:
        return <Wand2 className="w-5 h-5" />;
      case 3:
      case 4:
        return <Shield className="w-5 h-5" />;
      case 5:
      case 6:
        return <Sword className="w-5 h-5" />;
      case 7:
      case 8:
        return <Crown className="w-5 h-5" />;
      case 9:
      case 10:
        return <Trophy className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
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

  const renderStars = (count: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${
          i < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
        }`} 
      />
    ));
  };

  const getSkillLevel = (rating: number) => {
    if (rating < 1200) return { name: 'Novice', color: 'text-gray-400' };
    if (rating < 1400) return { name: 'Apprentice', color: 'text-green-400' };
    if (rating < 1600) return { name: 'Journeyman', color: 'text-blue-400' };
    if (rating < 1800) return { name: 'Expert', color: 'text-purple-400' };
    if (rating < 2000) return { name: 'Master', color: 'text-orange-400' };
    if (rating < 2200) return { name: 'Grandmaster', color: 'text-red-400' };
    return { name: 'Legendary', color: 'text-pink-400' };
  };

  const skillLevel = getSkillLevel(playerStats.skillRating);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto medieval-panel">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl medieval-text">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Campaign Mode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Player Stats Overview */}
          <Card className="medieval-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 medieval-text">
                <Target className="w-5 h-5" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {playerStats.totalWins}
                  </div>
                  <div className="text-sm text-gray-400">Victories</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${skillLevel.color}`}>
                    {playerStats.skillRating}
                  </div>
                  <div className="text-sm text-gray-400">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {playerStats.winStreak}
                  </div>
                  <div className="text-sm text-gray-400">Win Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.round(playerStats.campaignProgress)}%
                  </div>
                  <div className="text-sm text-gray-400">Campaign</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Skill Level:</span>
                  <Badge className={`${skillLevel.color} border-current`}>
                    {skillLevel.name}
                  </Badge>
                </div>
                <Progress 
                  value={playerStats.campaignProgress} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Campaign Levels */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold medieval-text flex items-center gap-2">
              <Sword className="w-5 h-5" />
              Campaign Levels
            </h3>
            
            <div className="grid gap-4">
              {levels.map((level, index) => {
                const winRate = level.attempts > 0 ? (level.wins / level.attempts) * 100 : 0;
                
                return (
                  <Card 
                    key={level.id} 
                    className={`medieval-card ${
                      !level.unlocked ? 'opacity-50' : 
                      level.completed ? 'border-green-500/50 bg-green-500/5' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {!level.unlocked ? (
                              <Lock className="w-6 h-6 text-gray-500" />
                            ) : (
                              getLevelIcon(level)
                            )}
                            <div>
                              <h4 className="font-bold medieval-text">{level.name}</h4>
                              <p className="text-sm text-gray-400">{level.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={getDifficultyColor(level.difficulty)}>
                              {level.difficulty}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {renderStars(level.stars)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {level.attempts > 0 && (
                            <div className="text-right text-sm">
                              <div className="text-gray-400">
                                {level.wins}W - {level.losses}L
                              </div>
                              <div className={`font-semibold ${
                                winRate >= level.requiredWinRate * 100 ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                {winRate.toFixed(0)}% win rate
                              </div>
                              {level.requiredWinRate && (
                                <div className="text-xs text-gray-500">
                                  Need {(level.requiredWinRate * 100).toFixed(0)}%
                                </div>
                              )}
                            </div>
                          )}
                          
                          <Button
                            className="medieval-btn"
                            disabled={!level.unlocked}
                            onClick={() => handleStartLevel(level)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {level.completed ? 'Replay' : 'Start'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Reset Campaign */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Progress is automatically saved. Reset to start over.
            </div>
            <Button
              variant="outline"
              className="medieval-btn"
              onClick={resetCampaign}
            >
              Reset Campaign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}