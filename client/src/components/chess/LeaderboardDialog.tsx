import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Trophy, Medal, Award, Crown, Swords, Target, Clock, Zap, User, Edit } from 'lucide-react';
import { useLeaderboard, CampaignStats, PvPStats, LeaderboardEntry } from '../../lib/stores/useLeaderboard';

interface LeaderboardDialogProps {
  children: React.ReactNode;
}

const formatTime = (ms: number): string => {
  if (ms === Infinity) return 'N/A';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatRating = (rating: number): string => {
  if (rating >= 2200) return 'Grandmaster';
  if (rating >= 2000) return 'Master';
  if (rating >= 1800) return 'Expert';
  if (rating >= 1600) return 'Advanced';
  if (rating >= 1400) return 'Intermediate';
  return 'Beginner';
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-orange-500" />;
  return <Award className="w-4 h-4 text-gray-300" />;
};

const getRankColor = (rank: number): string => {
  if (rank === 1) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (rank === 2) return 'text-gray-600 bg-gray-50 border-gray-200';
  if (rank === 3) return 'text-orange-600 bg-orange-50 border-orange-200';
  if (rank <= 10) return 'text-blue-600 bg-blue-50 border-blue-200';
  return 'text-gray-600 bg-gray-50 border-gray-200';
};

function CampaignLeaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <ScrollArea className="h-[400px] w-full">
      <div className="space-y-2 p-2">
        {entries.map((entry) => {
          const stats = entry.stats as CampaignStats;
          return (
            <Card 
              key={stats.playerId} 
              className={`transition-all duration-200 ${
                entry.isCurrentPlayer 
                  ? 'ring-2 ring-purple-500 bg-purple-50' 
                  : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${getRankColor(entry.rank)}`}>
                      {entry.rank <= 3 ? getRankIcon(entry.rank) : (
                        <span className="text-sm font-bold">#{entry.rank}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{stats.playerName}</span>
                        {entry.isCurrentPlayer && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Level {stats.currentLevel} • {stats.totalCampaignWins} Campaign Wins
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      {stats.campaignScore.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Score</div>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-sm font-medium">{stats.campaignWinRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">Win Rate</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Level {stats.highestLevelReached}</div>
                    <div className="text-xs text-gray-500">Highest</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{formatTime(stats.bestGameTime)}</div>
                    <div className="text-xs text-gray-500">Best Time</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{stats.totalExperience.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">XP</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function PvPLeaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <ScrollArea className="h-[400px] w-full">
      <div className="space-y-2 p-2">
        {entries.map((entry) => {
          const stats = entry.stats as PvPStats;
          return (
            <Card 
              key={stats.playerId} 
              className={`transition-all duration-200 ${
                entry.isCurrentPlayer 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${getRankColor(entry.rank)}`}>
                      {entry.rank <= 3 ? getRankIcon(entry.rank) : (
                        <span className="text-sm font-bold">#{entry.rank}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{stats.playerName}</span>
                        {entry.isCurrentPlayer && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {stats.totalWins}W-{stats.totalLosses}L-{stats.totalDraws}D
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {stats.pvpRating}
                    </div>
                    <div className="text-sm text-gray-500">{formatRating(stats.pvpRating)}</div>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-sm font-medium">{stats.winRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">Win Rate</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{stats.bestStreak}</div>
                    <div className="text-xs text-gray-500">Best Streak</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{formatTime(stats.fastestWin)}</div>
                    <div className="text-xs text-gray-500">Fastest Win</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{stats.totalGames}</div>
                    <div className="text-xs text-gray-500">Games</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function PlayerSetup() {
  const { currentPlayerName, setPlayerName } = useLeaderboard();
  const [name, setName] = useState(currentPlayerName);
  const [isEditing, setIsEditing] = useState(!currentPlayerName);

  const handleSubmit = () => {
    if (name.trim()) {
      setPlayerName(name.trim());
      setIsEditing(false);
    }
  };

  if (!isEditing && currentPlayerName) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="font-medium">Playing as: {currentPlayerName}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsEditing(true)}
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4" />
        <span className="font-medium">Enter your player name:</span>
      </div>
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter player name..."
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          className="flex-1"
        />
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          Save
        </Button>
      </div>
    </div>
  );
}

export function LeaderboardDialog({ children }: LeaderboardDialogProps) {
  const { 
    getCampaignLeaderboard, 
    getPvPLeaderboard,
    campaignStats,
    pvpStats 
  } = useLeaderboard();
  
  const [campaignEntries, setCampaignEntries] = useState<LeaderboardEntry[]>([]);
  const [pvpEntries, setPvPEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setCampaignEntries(getCampaignLeaderboard());
    setPvPEntries(getPvPLeaderboard());
  }, [getCampaignLeaderboard, getPvPLeaderboard, campaignStats, pvpStats]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboards
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <PlayerSetup />

          <Tabs defaultValue="campaign" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="campaign" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Campaign
              </TabsTrigger>
              <TabsTrigger value="pvp" className="flex items-center gap-2">
                <Swords className="w-4 h-4" />
                Player vs Player
              </TabsTrigger>
            </TabsList>

            <TabsContent value="campaign" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Campaign Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {campaignEntries.length > 0 ? (
                    <CampaignLeaderboard entries={campaignEntries} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Crown className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No campaign data yet. Complete campaign levels to appear on the leaderboard!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pvp" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Swords className="w-5 h-5" />
                    PvP Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pvpEntries.length > 0 ? (
                    <PvPLeaderboard entries={pvpEntries} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Swords className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No PvP data yet. Play local multiplayer games to appear on the leaderboard!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}