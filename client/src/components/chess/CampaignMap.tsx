import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Trophy, 
  Star, 
  Lock, 
  Play, 
  Crown,
  Sword,
  Shield,
  Wand2,
  Zap,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { CampaignLevel } from '../../lib/stores/useCampaign';

interface CampaignMapProps {
  levels: CampaignLevel[];
  onStartLevel: (level: CampaignLevel) => void;
  playerProgress: number;
}

export function CampaignMap({ levels, onStartLevel, playerProgress }: CampaignMapProps) {
  const getLevelIcon = (level: CampaignLevel) => {
    if (!level.unlocked) return <Lock className="w-6 h-6 text-gray-500" />;
    if (level.completed) return <CheckCircle className="w-6 h-6 text-green-400" />;
    
    switch (level.aiStrength) {
      case 1:
      case 2:
        return <Wand2 className="w-6 h-6 text-blue-400" />;
      case 3:
      case 4:
        return <Shield className="w-6 h-6 text-green-400" />;
      case 5:
      case 6:
        return <Sword className="w-6 h-6 text-yellow-400" />;
      case 7:
      case 8:
        return <Crown className="w-6 h-6 text-purple-400" />;
      case 9:
      case 10:
        return <Trophy className="w-6 h-6 text-red-400" />;
      default:
        return <Zap className="w-6 h-6 text-pink-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-orange-500';
      case 'advanced': return 'bg-red-500';
      case 'master': return 'bg-purple-500';
      case 'grandmaster': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 3 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${
          i < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
        }`} 
      />
    ));
  };

  const getWinRate = (level: CampaignLevel) => {
    return level.attempts > 0 ? (level.wins / level.attempts) * 100 : 0;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Campaign Progress Overview */}
      <Card className="medieval-card">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base sm:text-lg font-medium">Campaign Progress</span>
            <span className="text-sm sm:text-base text-gray-400">{Math.round(playerProgress)}% Complete</span>
          </div>
          <Progress value={playerProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Campaign Map */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {levels.map((level, index) => {
          const winRate = getWinRate(level);
          const isCurrentLevel = level.unlocked && !level.completed;
          
          return (
            <Card 
              key={level.id}
              className={`medieval-card transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                !level.unlocked ? 'opacity-50' : 
                level.completed ? 'border-green-500/50 bg-green-500/5' :
                isCurrentLevel ? 'border-yellow-500/50 bg-yellow-500/5 shadow-lg shadow-yellow-500/10' : ''
              }`}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="space-y-3 sm:space-y-4">
                  {/* Level Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getLevelIcon(level)}
                      <div className="text-xs sm:text-sm font-medium">Level {index + 1}</div>
                    </div>
                    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${getDifficultyColor(level.difficulty)}`} />
                  </div>
                  
                  {/* Level Info */}
                  <div className="min-h-[3.5rem] sm:min-h-[4rem]">
                    <h4 className="font-bold text-sm sm:text-base medieval-text mb-2 leading-tight">{level.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-400 line-clamp-3 leading-relaxed">{level.description}</p>
                  </div>
                  
                  {/* Level Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      {renderStars(level.stars)}
                    </div>
                    {level.attempts > 0 && (
                      <div className="text-xs text-gray-400">
                        {winRate.toFixed(0)}%
                      </div>
                    )}
                  </div>
                  
                  {/* Difficulty Badge */}
                  <Badge 
                    variant="outline" 
                    className="text-xs capitalize w-full justify-center"
                  >
                    {level.difficulty}
                  </Badge>
                  
                  {/* Action Button */}
                  <Button
                    className="w-full mx-auto medieval-btn text-sm sm:text-base h-11 font-bold flex items-center justify-center mt-4"
                    size="default"
                    disabled={!level.unlocked}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🎯 Campaign level button clicked:', level.name, 'unlocked:', level.unlocked);
                      if (level.unlocked) {
                        onStartLevel(level);
                      }
                    }}
                  >
                    {level.unlocked ? (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        {level.completed ? 'Replay' : 'Start'}
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </>
                    )}
                  </Button>
                  
                  {/* Unlock Requirements */}
                  {!level.unlocked && index > 0 && (
                    <div className="text-xs text-gray-500 text-center leading-tight">
                      Complete previous level
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}