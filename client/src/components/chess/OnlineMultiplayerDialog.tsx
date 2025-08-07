import React, { useEffect, useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { useMultiplayer } from '../../lib/stores/useMultiplayer';
import { 
  Wifi, 
  WifiOff,
  Users, 
  Clock,
  Trophy,
  Swords,
  Loader2,
  Play,
  X
} from 'lucide-react';

interface OnlineMultiplayerDialogProps {
  children: React.ReactNode;
}

export function OnlineMultiplayerDialog({ children }: OnlineMultiplayerDialogProps) {
  const {
    isConnected,
    connectionError,
    currentPlayer,
    matchmaking,
    currentGame,
    serverStats,
    connect,
    disconnect,
    joinMatchmaking,
    leaveMatchmaking,
    fetchServerStats
  } = useMultiplayer();

  const [selectedTimeControl, setSelectedTimeControl] = useState(600);

  useEffect(() => {
    // Auto-connect if not connected
    if (!isConnected && !currentPlayer) {
      // For demo purposes, using mock player data
      // In a real app, this would come from user authentication
      const mockPlayerData = {
        userId: Date.now(),
        username: `Player${Math.floor(Math.random() * 1000)}`,
        displayName: `Chess Player ${Math.floor(Math.random() * 1000)}`,
        rating: 1200 + Math.floor(Math.random() * 800)
      };
      connect(mockPlayerData);
    }
  }, [isConnected, currentPlayer, connect]);

  useEffect(() => {
    // Fetch server stats periodically
    fetchServerStats();
    const interval = setInterval(fetchServerStats, 30000);
    return () => clearInterval(interval);
  }, [fetchServerStats]);

  const timeControlOptions = [
    { value: 180, label: '3 min', description: 'Blitz' },
    { value: 300, label: '5 min', description: 'Blitz' },
    { value: 600, label: '10 min', description: 'Rapid' },
    { value: 900, label: '15 min', description: 'Rapid' },
    { value: 1800, label: '30 min', description: 'Classical' }
  ];

  const handleJoinQueue = () => {
    if (!matchmaking.inQueue) {
      joinMatchmaking(selectedTimeControl);
    } else {
      leaveMatchmaking();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden medieval-panel">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl medieval-text">
            <Swords className="w-6 h-6 text-blue-400" />
            Online Multiplayer
            <div className="flex items-center gap-2 ml-4">
              {isConnected ? (
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <Wifi className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-400 border-red-400">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Disconnected
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {connectionError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-4">
            <p className="text-red-400 text-sm">{connectionError}</p>
          </div>
        )}

        <Tabs defaultValue="matchmaking" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="matchmaking">Quick Match</TabsTrigger>
            <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
            <TabsTrigger value="stats">Server Stats</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <TabsContent value="matchmaking" className="mt-0 space-y-4">
              {/* Player Info */}
              {currentPlayer && (
                <Card className="medieval-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Display Name:</span>
                      <span className="font-medium">{currentPlayer.displayName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rating:</span>
                      <Badge variant="outline">{currentPlayer.rating}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge className={
                        currentPlayer.status === 'online' ? 'text-green-400' :
                        currentPlayer.status === 'in-game' ? 'text-blue-400' :
                        'text-yellow-400'
                      }>
                        {currentPlayer.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Game */}
              {currentGame && (
                <Card className="medieval-card border-blue-500/50">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-400">Game in Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Opponent:</span>
                      <span className="font-medium">{currentGame.opponent.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Your Color:</span>
                      <Badge variant="outline" className="capitalize">
                        {currentGame.yourColor}
                      </Badge>
                    </div>
                    <Button 
                      className="w-full medieval-btn"
                      onClick={() => {
                        // Switch to game view - this would be handled by the main app
                        console.log('Resume game:', currentGame.gameId);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Resume Game
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Time Control Selection */}
              {!currentGame && (
                <Card className="medieval-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Time Control</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {timeControlOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={selectedTimeControl === option.value ? "default" : "outline"}
                          className="medieval-btn"
                          onClick={() => setSelectedTimeControl(option.value)}
                          disabled={matchmaking.inQueue}
                        >
                          <div className="text-center">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-400">{option.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Matchmaking */}
              {!currentGame && (
                <Card className="medieval-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Find Match</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {matchmaking.inQueue ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-yellow-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Searching for opponent...</span>
                        </div>
                        
                        {matchmaking.queuePosition && (
                          <div className="text-sm text-gray-400">
                            Queue position: {matchmaking.queuePosition}
                          </div>
                        )}
                        
                        {matchmaking.estimatedWait && (
                          <div className="text-sm text-gray-400">
                            Estimated wait: {matchmaking.estimatedWait}s
                          </div>
                        )}
                        
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={handleJoinQueue}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel Search
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full medieval-btn"
                        onClick={handleJoinQueue}
                        disabled={!isConnected}
                      >
                        <Swords className="w-4 h-4 mr-2" />
                        Find Opponent ({formatTime(selectedTimeControl)})
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="leaderboards" className="mt-0">
              <Card className="medieval-card">
                <CardHeader>
                  <CardTitle className="text-lg">Online Leaderboards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-400">
                      <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Online leaderboards coming soon!</p>
                      <p className="text-sm">Rankings will be based on online match results.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="mt-0">
              <Card className="medieval-card">
                <CardHeader>
                  <CardTitle className="text-lg">Server Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {serverStats ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-gray-800/20">
                        <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                        <div className="text-2xl font-bold text-blue-400">
                          {serverStats.onlinePlayers}
                        </div>
                        <div className="text-sm text-gray-400">Online Players</div>
                      </div>
                      
                      <div className="text-center p-4 rounded-lg bg-gray-800/20">
                        <Swords className="w-6 h-6 mx-auto mb-2 text-green-400" />
                        <div className="text-2xl font-bold text-green-400">
                          {serverStats.activeGames}
                        </div>
                        <div className="text-sm text-gray-400">Active Games</div>
                      </div>
                      
                      <div className="text-center p-4 rounded-lg bg-gray-800/20">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                        <div className="text-xs text-purple-400 font-mono">
                          {new Date(serverStats.serverTime).toLocaleTimeString()}
                        </div>
                        <div className="text-sm text-gray-400">Server Time</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
                      <p>Loading server statistics...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}