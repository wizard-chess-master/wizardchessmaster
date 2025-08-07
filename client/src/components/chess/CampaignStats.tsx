import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Target, 
  Trophy,
  Star,
  Clock,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { PlayerStats } from '../../lib/stores/useCampaign';

interface CampaignStatsProps {
  playerStats: PlayerStats;
}

export function CampaignStats({ playerStats }: CampaignStatsProps) {
  const getSkillLevel = (rating: number) => {
    if (rating < 1200) return { name: 'Novice', color: 'text-gray-400', icon: Star };
    if (rating < 1400) return { name: 'Apprentice', color: 'text-green-400', icon: Star };
    if (rating < 1600) return { name: 'Journeyman', color: 'text-blue-400', icon: Award };
    if (rating < 1800) return { name: 'Expert', color: 'text-purple-400', icon: Award };
    if (rating < 2000) return { name: 'Master', color: 'text-orange-400', icon: Trophy };
    if (rating < 2200) return { name: 'Grandmaster', color: 'text-red-400', icon: Trophy };
    return { name: 'Legendary', color: 'text-pink-400', icon: Zap };
  };

  const skillLevel = getSkillLevel(playerStats.skillRating);
  const winRate = playerStats.totalGames > 0 ? (playerStats.totalWins / playerStats.totalGames) * 100 : 0;
  const avgGameTime = playerStats.totalGames > 0 ? (playerStats.totalPlayTime / playerStats.totalGames) / 1000 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color = "text-blue-400",
    subtitle 
  }: {
    icon: any;
    label: string;
    value: string | number;
    color?: string;
    subtitle?: string;
  }) => (
    <div className="text-center p-3 rounded-lg bg-gray-800/20">
      <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
      <div className={`text-lg font-bold ${color}`}>
        {value}
      </div>
      <div className="text-xs text-gray-400">{label}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  );

  return (
    <Card className="medieval-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg medieval-text">
          <Target className="w-5 h-5" />
          Your Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skill Level & Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <skillLevel.icon className={`w-5 h-5 ${skillLevel.color}`} />
              <span className="font-medium">Skill Level</span>
            </div>
            <Badge className={`${skillLevel.color} border-current`}>
              {skillLevel.name}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Rating: {playerStats.skillRating}</span>
              <span>Progress: {Math.round(playerStats.campaignProgress)}%</span>
            </div>
            <Progress value={playerStats.campaignProgress} className="h-2" />
          </div>
        </div>

        {/* Core Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={Trophy}
            label="Victories"
            value={playerStats.totalWins}
            color="text-yellow-400"
          />
          
          <StatCard
            icon={TrendingUp}
            label="Win Rate"
            value={`${winRate.toFixed(0)}%`}
            color={winRate >= 70 ? "text-green-400" : winRate >= 50 ? "text-yellow-400" : "text-red-400"}
          />
          
          <StatCard
            icon={Zap}
            label="Win Streak"
            value={playerStats.winStreak}
            color="text-blue-400"
            subtitle={`Best: ${playerStats.bestWinStreak}`}
          />
          
          <StatCard
            icon={Clock}
            label="Avg Time"
            value={formatTime(avgGameTime)}
            color="text-purple-400"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-700">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-300">
              {playerStats.totalGames}
            </div>
            <div className="text-xs text-gray-500">Total Games</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-300">
              {playerStats.averageMovesPerGame.toFixed(0)}
            </div>
            <div className="text-xs text-gray-500">Avg Moves</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-300">
              {formatTime((playerStats.totalPlayTime || 0) / 1000)}
            </div>
            <div className="text-xs text-gray-500">Play Time</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}