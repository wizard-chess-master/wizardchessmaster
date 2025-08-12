import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Users, 
  Crown, 
  Clock, 
  Globe, 
  Swords,
  Star,
  Trophy,
  Play,
  Search,
  UserPlus,
  Zap,
  Plus,
  Cpu,
  Shield
} from 'lucide-react';
import { useAuth } from '../../lib/stores/useAuth';
import { useMultiplayer } from '../../lib/stores/useMultiplayer';
import { useChess } from '../../lib/stores/useChess';
import { AdBanner } from '../monetization/AdBanner';
import { LoginDialog } from '../auth/LoginDialog';

interface GameRoom {
  id: string;
  hostPlayer: {
    id: string;
    username: string;
    rating: number;
    isPremium: boolean;
  };
  guestPlayer?: {
    id: string;
    username: string;
    rating: number;
    isPremium: boolean;
  };
  gameMode: 'casual' | 'ranked' | 'tournament';
  timeControl: '5+0' | '10+0' | '15+10' | '30+0';
  isPrivate: boolean;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: Date;
}

interface Player {
  id: string;
  username: string;
  rating: number;
  isPremium: boolean;
  status: 'online' | 'in-game' | 'away';
}

export function MultiplayerLobby() {
  const { user, isLoggedIn } = useAuth();
  const { socket, isConnected, connect, disconnect, currentGame } = useMultiplayer();
  
  // Debug logging
  console.log('🔍 MultiplayerLobby render - socket:', !!socket, 'isConnected:', isConnected, 'isLoggedIn:', isLoggedIn);
  
  const [activeTab, setActiveTab] = useState<'play' | 'watch' | 'players'>('play');
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [selectedTimeControl, setSelectedTimeControl] = useState<string>('10+0');
  const [selectedGameMode, setSelectedGameMode] = useState<string>('casual');
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);
  const [searchOpponent, setSearchOpponent] = useState('');
  const [matchmakingStatus, setMatchmakingStatus] = useState<string>('');

  useEffect(() => {
    if (!socket || !isConnected) {
      // Mock data for demonstration
      setGameRooms([
        {
          id: 'demo-room-1',
          hostPlayer: { id: '1', username: 'ChessMaster99', rating: 1450, isPremium: true },
          gameMode: 'casual',
          timeControl: '10+0',
          isPrivate: false,
          status: 'waiting',
          createdAt: new Date()
        },
        {
          id: 'demo-room-2', 
          hostPlayer: { id: '2', username: 'WizardPlayer', rating: 1200, isPremium: false },
          gameMode: 'ranked',
          timeControl: '15+10',
          isPrivate: false,
          status: 'waiting',
          createdAt: new Date()
        }
      ]);
      
      setOnlinePlayers([
        { id: '1', username: 'ChessMaster99', rating: 1450, isPremium: true, status: 'online' },
        { id: '2', username: 'WizardPlayer', rating: 1200, isPremium: false, status: 'online' },
        { id: '3', username: 'QueenGambit', rating: 1600, isPremium: true, status: 'in-game' },
        { id: '4', username: 'KnightRider', rating: 1350, isPremium: false, status: 'online' }
      ]);
      return;
    }

    // Listen for room creation success
    socket.on('room:created', (response: { success: boolean; room: any; message: string }) => {
      console.log('🏠 Room created successfully:', response);
      if (response.success && response.room) {
        setGameRooms(prev => [...prev, response.room]);
      }
    });

    socket.on('room:error', (error: { message: string }) => {
      console.error('🚫 Room creation error:', error);
    });

    // Listen for new rooms from other players
    socket.on('room:available', (roomData: GameRoom) => {
      console.log('🏠 New room available:', roomData);
      setGameRooms(prev => [...prev, roomData]);
    });

    // Listen for lobby updates
    socket.on('lobby:rooms-updated', (rooms: GameRoom[]) => {
      setGameRooms(rooms);
    });

    socket.on('lobby:players-updated', (players: Player[]) => {
      setOnlinePlayers(players);
    });

    socket.on('game:invitation', (data: any) => {
      // Handle game invitation
      console.log('Game invitation received:', data);
    });

    socket.on('game:started', (gameData: any) => {
      console.log('🎮 Game started:', gameData);
      // Store game data and navigate
      const gameInfo = {
        gameId: gameData.gameId,
        roomId: gameData.roomId,
        opponent: {
          name: gameData.opponent?.name || 'Unknown Player',
          rating: gameData.opponent?.rating || 1200
        },
        yourColor: gameData.yourColor || 'white',
        gameState: gameData.gameState || null,
        timeControl: gameData.timeControl || 600,
        yourTime: gameData.yourTime || 600,
        opponentTime: gameData.opponentTime || 600
      };
      
      // Update multiplayer store with game data  
      useMultiplayer.getState().setCurrentGame(gameInfo as any);
      
      // Navigate to multiplayer game
      console.log('🔄 Navigating to multiplayer game...');
      setTimeout(() => {
        window.location.hash = '#multiplayer-game';
      }, 100);
    });

    socket.on('room:joined', (response: { success: boolean; gameId: string; message: string }) => {
      console.log('🎮 Room joined successfully:', response);
      if (response.success) {
        // Store game data
        const gameInfo = {
          gameId: response.gameId,
          roomId: 'unknown',
          opponent: {
            name: 'Unknown Player',
            rating: 1200
          },
          yourColor: 'white' as const,
          gameState: null,
          timeControl: 600,
          yourTime: 600,
          opponentTime: 600
        };
        
        // Update multiplayer store with game data
        useMultiplayer.getState().setCurrentGame(gameInfo as any);
        
        // Navigate to game
        console.log('🔄 Navigating to multiplayer game...');
        setTimeout(() => {
          window.location.hash = '#multiplayer-game';
        }, 100);
      }
    });

    // Request initial lobby data
    socket.emit('lobby:join');

    return () => {
      socket.off('room:created');
      socket.off('room:error');
      socket.off('room:available');
      socket.off('room:joined');
      socket.off('lobby:rooms-updated');
      socket.off('lobby:players-updated');
      socket.off('game:invitation');
      socket.off('game:started');
    };
  }, [socket, isConnected]);

  const handleCreateRoom = () => {
    if (!socket || !isConnected) return;

    console.log('🏠 Creating game room...');
    const roomData = {
      gameMode: selectedGameMode,
      timeControl: selectedTimeControl,
      isPrivate: isPrivateRoom
    };

    socket.emit('room:create', roomData);
    setShowCreateRoom(false);
  };

  const handleJoinRoom = (roomId: string) => {
    if (!socket || !isConnected) return;
    console.log('🎮 Joining room:', roomId);
    socket.emit('lobby:join-room', { roomId });
  };

  const handleQuickMatch = () => {
    if (!socket || !isConnected) return;
    
    console.log('🎯 Starting quick match...');
    socket.emit('matchmaking:find-opponent', {
      gameMode: 'casual',
      timeControl: '10+0',
      ratingRange: 200 // ±200 rating points
    });
    
    // Set up AI fallback after 5 seconds
    setTimeout(() => {
      if (!currentGame) {
        console.log('🤖 No players found, offering AI opponent...');
        setMatchmakingStatus('No players available - Starting AI match...');
        
        // After showing the message, start AI game
        setTimeout(() => {
          console.log('🎮 Starting AI game from multiplayer quick match');
          
          // Disconnect from multiplayer to avoid conflicts
          const { disconnect } = useMultiplayer.getState();
          disconnect();
          
          // Navigate to game page - the hash handler will start the AI game
          console.log('🎮 Navigating to game page for AI play');
          window.location.hash = '#game';
        }, 2000);
      }
    }, 5000);
  };

  const handleChallengePlayer = (playerId: string) => {
    if (!socket || !isConnected) return;
    
    console.log('⚔️ Challenging player:', playerId);
    socket.emit('lobby:challenge-player', {
      challengedPlayerId: playerId,
      gameMode: selectedGameMode,
      timeControl: selectedTimeControl
    });
  };

  const getTimeControlIcon = (timeControl: string) => {
    switch (timeControl) {
      case '5+0': return <Zap className="w-4 h-4 text-red-500" />;
      case '10+0': return <Clock className="w-4 h-4 text-orange-500" />;
      case '15+10': return <Clock className="w-4 h-4 text-blue-500" />;
      case '30+0': return <Clock className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getGameModeColor = (mode: string) => {
    switch (mode) {
      case 'casual': return 'bg-blue-100 text-blue-800';
      case 'ranked': return 'bg-purple-100 text-purple-800';
      case 'tournament': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl text-blue-900">Join the Arena</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-blue-800 mb-6">
              Play against real players from around the world. Log in to access multiplayer features.
            </p>
            <LoginDialog>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                onClick={(e) => {
                  console.log('🔐 Login to Play Online button clicked in arena');
                  // LoginDialog will handle the modal opening
                }}
              >
                Login to Play Online
              </Button>
            </LoginDialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-2">
                Multiplayer Arena
              </h1>
              <p className="text-blue-700 text-lg">
                Challenge players worldwide • {onlinePlayers.length} players online
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-blue-700">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
        <AdBanner containerId="multiplayer-header-banner" size="leaderboard" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200 bg-green-50 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Swords className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-green-900">Quick Match</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-green-800 mb-4">
                Find an opponent instantly with similar skill level
              </p>
              <Button 
                onClick={handleQuickMatch}
                disabled={!isConnected}
                className={`w-full ${
                  isConnected 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4 mr-2" />
                {isConnected ? 'Play Now' : 'Connecting...'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="text-center">
              <UserPlus className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-blue-900">Create Room</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-blue-800 mb-4">
                Create a custom game room with your preferred settings
              </p>
              <Button 
                onClick={() => setShowCreateRoom(true)}
                disabled={!isConnected}
                className={`w-full ${
                  isConnected 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                <Crown className="w-4 h-4 mr-2" />
                {isConnected ? 'Create Room' : 'Connecting...'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="text-center">
              <Trophy className="w-12 h-12 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-purple-900">Tournaments</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-purple-800 mb-4">
                Join ongoing tournaments and compete for prizes
              </p>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white w-full">
                <Trophy className="w-4 h-4 mr-2" />
                View Tournaments
              </Button>
            </CardContent>
          </Card>
        </div>

        <AdBanner containerId="multiplayer-middle-banner" size="banner" />

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-blue-200">
          {[
            { id: 'play', label: 'Game Rooms', count: gameRooms.length },
            { id: 'watch', label: 'Spectate', count: 0 },
            { id: 'players', label: 'Players Online', count: onlinePlayers.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-blue-700 hover:bg-blue-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'play' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {gameRooms.filter(room => room.status === 'waiting').map((room) => (
              <Card key={room.id} className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-blue-900 flex items-center gap-2">
                        {room.hostPlayer.isPremium && <Crown className="w-4 h-4 text-amber-500" />}
                        {room.hostPlayer.username}
                        <Badge className="text-xs">{room.hostPlayer.rating}</Badge>
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getGameModeColor(room.gameMode)}>
                          {room.gameMode.charAt(0).toUpperCase() + room.gameMode.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getTimeControlIcon(room.timeControl)}
                          {room.timeControl}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-blue-700">Waiting for opponent</div>
                      <div className="text-xs text-blue-600">
                        {new Date(room.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-blue-700">
                      Time: {room.timeControl} • Mode: {room.gameMode}
                    </div>
                    <Button
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={!isConnected}
                      className={`${
                        isConnected 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      }`}
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isConnected ? 'Join Game' : 'Connecting...'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {gameRooms.filter(room => room.status === 'waiting').length === 0 && (
              <div className="col-span-2 text-center py-12">
                <Globe className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-900 mb-2">No games available</h3>
                <p className="text-blue-700 mb-6">Be the first to create a game room or play against AI!</p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => setShowCreateRoom(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Game Room
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log('🤖 Playing against AI from no games available');
                      
                      // Disconnect from multiplayer to avoid conflicts
                      const { disconnect } = useMultiplayer.getState();
                      disconnect();
                      
                      // Navigate to game page - the hash handler will start the AI game
                      console.log('🎮 Navigating to game page for AI play');
                      window.location.hash = '#game';
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Cpu className="w-4 h-4 mr-2" />
                    Play vs AI
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'players' && (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-3 mb-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-blue-400" />
                <Input
                  placeholder="Search players..."
                  value={searchOpponent}
                  onChange={(e) => setSearchOpponent(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {onlinePlayers
              .filter(player => 
                player.username.toLowerCase().includes(searchOpponent.toLowerCase())
              )
              .map((player) => (
              <Card key={player.id} className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {player.isPremium && <Crown className="w-4 h-4 text-amber-500" />}
                        <span className="font-semibold text-blue-900">{player.username}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{player.rating}</Badge>
                        <div className={`w-2 h-2 rounded-full ${
                          player.status === 'online' ? 'bg-green-500' :
                          player.status === 'in-game' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-xs text-blue-600">{player.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  {player.status === 'online' && (
                    <Button
                      onClick={() => handleChallengePlayer(player.id)}
                      disabled={!isConnected}
                      className={`w-full ${
                        isConnected 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      }`}
                      size="sm"
                    >
                      <Swords className="w-4 h-4 mr-2" />
                      Challenge
                    </Button>
                  )}

                  {player.status === 'in-game' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      disabled
                    >
                      In Game
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AdBanner containerId="multiplayer-bottom-banner" size="leaderboard" />
      </div>

      {/* Create Room Dialog */}
      {showCreateRoom && (
        <Dialog open={showCreateRoom} onOpenChange={setShowCreateRoom}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Game Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-blue-900 mb-2 block">
                  Game Mode
                </label>
                <select
                  value={selectedGameMode}
                  onChange={(e) => setSelectedGameMode(e.target.value)}
                  className="w-full p-2 border border-blue-200 rounded-lg"
                >
                  <option value="casual">Casual</option>
                  <option value="ranked">Ranked</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-blue-900 mb-2 block">
                  Time Control
                </label>
                <select
                  value={selectedTimeControl}
                  onChange={(e) => setSelectedTimeControl(e.target.value)}
                  className="w-full p-2 border border-blue-200 rounded-lg"
                >
                  <option value="5+0">5 minutes</option>
                  <option value="10+0">10 minutes</option>
                  <option value="15+10">15+10</option>
                  <option value="30+0">30 minutes</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={isPrivateRoom}
                  onChange={(e) => setIsPrivateRoom(e.target.checked)}
                />
                <label htmlFor="private" className="text-sm text-blue-900">
                  Private room (invite only)
                </label>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateRoom}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Room
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateRoom(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}