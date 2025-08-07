import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Trophy, 
  Medal, 
  Crown,
  TrendingUp,
  Users,
  Calendar,
  Timer,
  Target,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';

interface CampaignLeaderboardEntry {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  currentLevel: number;
  totalWins: number;
  totalGames: number;
  winRate: number;
  highestLevel: number;
  averageGameTime: number;
  campaignScore: number;
  lastUpdated: string;
}

interface PvpLeaderboardEntry {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  rating: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  fastestWin?: number;
  lastUpdated: string;
}

interface OnlineLeaderboardsData {
  campaign: CampaignLeaderboardEntry[];
  pvp: PvpLeaderboardEntry[];
}

export function OnlineLeaderboard() {
  const [leaderboards, setLeaderboards] = useState<OnlineLeaderboardsData>({ campaign: [], pvp: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/leaderboards');
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboards');
      }
      
      const data = await response.json();
      setLeaderboards(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to fetch online leaderboards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboards();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchLeaderboards, 30000);
    return () => clearInterval(interval);
  }, []);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-400">#{position}</span>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatGameTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && leaderboards.campaign.length === 0) {
    return (
      <Card className="medieval-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Online Leaderboards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            <span className="ml-2">Loading leaderboards...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="medieval-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-red-400" />
            Online Leaderboards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <div className="text-red-400">
              <p className="font-medium">Connection Error</p>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
            <Button 
              onClick={fetchLeaderboards}
              variant="outline"
              className="medieval-btn"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="medieval-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-green-400" />
            Online Leaderboards
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Updated {formatTimeAgo(lastUpdated.toISOString())}
              </span>
            )}
            <Button
              onClick={fetchLeaderboards}
              variant="ghost"
              size="sm"
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="campaign" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="campaign" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Campaign ({leaderboards.campaign.length})
            </TabsTrigger>
            <TabsTrigger value="pvp" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              PvP ({leaderboards.pvp.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaign">
            <ScrollArea className="h-[400px]">
              {leaderboards.campaign.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No campaign rankings yet</p>
                  <p className="text-sm">Complete campaign levels to appear on the leaderboard!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboards.campaign.map((entry, index) => (
                    <div 
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/20 hover:bg-gray-800/40 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getRankIcon(index + 1)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{entry.displayName}</span>
                          <Badge variant="outline" className="text-xs">
                            Level {entry.currentLevel}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>{entry.totalWins}W/{entry.totalGames}G</span>
                          <span>{entry.winRate}% WR</span>
                          <span>Avg: {formatGameTime(entry.averageGameTime)}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-400">
                          {entry.campaignScore}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatTimeAgo(entry.lastUpdated)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="pvp">
            <ScrollArea className="h-[400px]">
              {leaderboards.pvp.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No PvP rankings yet</p>
                  <p className="text-sm">Play online matches to earn a rating!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboards.pvp.map((entry, index) => (
                    <div 
                      key={entry.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/20 hover:bg-gray-800/40 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getRankIcon(index + 1)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{entry.displayName}</span>
                          {entry.currentStreak > 2 && (
                            <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400">
                              🔥 {entry.currentStreak}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>{entry.totalWins}W/{entry.totalLosses}L/{entry.totalDraws}D</span>
                          <span>{entry.winRate}% WR</span>
                          {entry.fastestWin && (
                            <span>⚡ {formatGameTime(entry.fastestWin)}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-400">
                          {entry.rating}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatTimeAgo(entry.lastUpdated)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}