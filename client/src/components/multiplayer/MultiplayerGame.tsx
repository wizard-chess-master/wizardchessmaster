import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Clock, 
  Crown, 
  User, 
  Flag, 
  MessageCircle,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useMultiplayer } from '../../lib/stores/useMultiplayer';
import { ChessBoard } from '../chess/ChessBoard';
import { useChess } from '../../lib/stores/useChess';
import { useAudio } from '../../lib/stores/useAudio';

interface MultiplayerGameProps {
  onBackToLobby: () => void;
}

export function MultiplayerGame({ onBackToLobby }: MultiplayerGameProps) {
  const { currentGame, makeMove, resignGame } = useMultiplayer();
  const { board, currentPlayer, gamePhase } = useChess();
  const { playPieceMovementSound } = useAudio();
  const [chatMessages, setChatMessages] = useState<Array<{id: string, player: string, message: string, timestamp: Date}>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    if (!currentGame) {
      onBackToLobby();
      return;
    }

    // Start the game if not already started
    const { gamePhase, startGame, setGameMode } = useChess.getState();
    if (gamePhase === 'menu') {
      console.log('🎮 Starting multiplayer game - transitioning from menu to playing');
      startGame('multiplayer', 'medium');
      
      // Set player restriction based on assigned color
      console.log('🎮 Setting player color restriction:', currentGame.yourColor);
      
      // Game state will be managed by server updates
      // Player color assignment is stored in currentGame.yourColor
    }

    // Sync multiplayer game state with local game state
    if (currentGame.gameState) {
      // Update local game state to match multiplayer state
      console.log('🔄 Syncing multiplayer game state');
    }
  }, [currentGame, onBackToLobby]);

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center p-8">
            <p className="text-blue-800 mb-4">No active game found</p>
            <Button onClick={onBackToLobby} className="bg-blue-600 hover:bg-blue-700 text-white">
              Return to Lobby
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleMove = (from: string, to: string) => {
    console.log('🎮 Multiplayer move attempt:', { from, to });
    
    // Send move to server
    if (currentGame) {
      makeMove(currentGame.gameId, {
        from,
        to,
        board,
        currentPlayer
      });
    }

    if (audioEnabled && playPieceMovementSound) {
      playPieceMovementSound();
    }
  };

  const handleResign = () => {
    if (window.confirm('Are you sure you want to resign? This will end the game.')) {
      resignGame(currentGame.gameId);
      onBackToLobby();
    }
  };

  const sendChatMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: `msg_${Date.now()}`,
      player: 'You',
      message: newMessage.trim(),
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const yourTimePercent = currentGame.timeControl > 0 ? (currentGame.yourTime / currentGame.timeControl) * 100 : 100;
  const opponentTimePercent = currentGame.timeControl > 0 ? (currentGame.opponentTime / currentGame.timeControl) * 100 : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Game Header - Not Fixed */}
      <div className="bg-white shadow-sm border-b border-blue-200 px-4 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={onBackToLobby}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              ← Lobby
            </Button>
            <div className="text-lg font-semibold text-blue-900">
              Online Match vs {currentGame.opponent.name}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="border-blue-300"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="border-blue-300"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleResign}
            >
              <Flag className="w-4 h-4 mr-1" />
              Resign
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Players Panel */}
          <div className="space-y-4">
            {/* Opponent Info */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="font-semibold text-red-900">{currentGame.opponent.name}</div>
                      <Badge variant="outline" className="text-xs">{currentGame.opponent.rating}</Badge>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${currentGame.yourColor === 'white' ? 'bg-gray-800' : 'bg-white border-2 border-gray-400'}`}></div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-red-700">
                    <span>Time Remaining</span>
                    <span className="font-mono">{formatTime(currentGame.opponentTime)}</span>
                  </div>
                  <Progress 
                    value={opponentTimePercent} 
                    className="h-2 bg-red-100"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Your Info */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-semibold text-green-900">You</div>
                      <Badge variant="outline" className="text-xs">Your Rating</Badge>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${currentGame.yourColor === 'white' ? 'bg-white border-2 border-gray-400' : 'bg-gray-800'}`}></div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Time Remaining</span>
                    <span className="font-mono">{formatTime(currentGame.yourTime)}</span>
                  </div>
                  <Progress 
                    value={yourTimePercent} 
                    className="h-2 bg-green-100"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Game Info */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-blue-900">Game Info</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Time Control</span>
                  <span className="text-blue-900">{Math.floor(currentGame.timeControl / 60)} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Your Color</span>
                  <span className="text-blue-900 capitalize">{currentGame.yourColor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Turn</span>
                  <span className="text-blue-900">
                    {currentPlayer === currentGame.yourColor ? 'Your Turn' : 'Opponent\'s Turn'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chess Board */}
          <div className="lg:col-span-2">
            <div className="flex justify-center">
              <ChessBoard />
            </div>
          </div>

          {/* Chat Panel (if shown) */}
          {showChat && (
            <div>
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-blue-900 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Game Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-[400px]">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-blue-600 text-sm py-8">
                        No messages yet. Say hello to your opponent!
                      </div>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className="text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-blue-900">{msg.player}</span>
                            <span className="text-xs text-blue-600">
                              {msg.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-blue-800 bg-blue-50 rounded px-2 py-1">
                            {msg.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-blue-300 rounded text-sm"
                    />
                    <Button 
                      onClick={sendChatMessage}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}