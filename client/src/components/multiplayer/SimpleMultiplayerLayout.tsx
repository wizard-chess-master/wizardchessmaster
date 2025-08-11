import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Clock, Users, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { ChessBoard } from '../chess/ChessBoard';
import { useMultiplayer } from '../../lib/stores/useMultiplayer';
import { useChess } from '../../lib/stores/useChess';

interface SimpleMultiplayerLayoutProps {
  onLeaveRoom: () => void;
  onToggleChat: () => void;
  showChat: boolean;
  chatMessages: Array<{
    id: string;
    player: string;
    message: string;
    timestamp: Date;
  }>;
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendChatMessage: () => void;
}

export function SimpleMultiplayerLayout({
  onLeaveRoom,
  onToggleChat,
  showChat,
  chatMessages,
  newMessage,
  setNewMessage,
  sendChatMessage
}: SimpleMultiplayerLayoutProps) {
  const { currentGame } = useMultiplayer();
  const { currentPlayer } = useChess();
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <Card className="p-8">
          <CardContent>
            <div className="text-center text-blue-600">
              No active game found
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Full screen layout
  if (isFullScreen) {
    return (
      <div className="min-h-screen bg-blue-50 p-2 flex flex-col">
        {/* Minimal Top Bar in Full Screen */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-2 mb-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              onClick={onLeaveRoom}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-blue-900 font-medium">
              Turn: {currentPlayer === 'white' ? 'White' : 'Black'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsFullScreen(false)}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Full Screen Chess Board */}
        <div className="flex-1 flex items-center justify-center">
          <div 
            className="bg-white rounded-lg shadow-sm border border-blue-200 p-4"
            style={{ 
              position: 'relative',
              zIndex: 1,
              isolation: 'isolate'
            }}
          >
            <ChessBoard />
          </div>
        </div>
      </div>
    );
  }

  // Normal layout
  return (
    <div className="min-h-screen bg-blue-50 p-4">
      {/* Simple Top Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onLeaveRoom}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Leave Game
            </Button>
            <div className="text-blue-900 font-semibold">
              Multiplayer Game
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsFullScreen(true)}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              title="Full Screen Mode"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 text-blue-700">
              <Users className="w-4 h-4" />
              <span className="text-sm">Online Game</span>
            </div>
            <Button
              onClick={onToggleChat}
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Main Game Area - Simple Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Player Info - Left Side */}
        <div className="lg:col-span-3 space-y-4">
          {/* Opponent Info */}
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-900">Opponent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Name</span>
                  <span className="text-blue-900 font-medium">Opponent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Rating</span>
                  <span className="text-blue-900 font-medium">1200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Color</span>
                  <span className="text-blue-900 font-medium">Black</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Info */}
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-900">You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Name</span>
                  <span className="text-blue-900 font-medium">You</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Rating</span>
                  <span className="text-blue-900 font-medium">1200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Color</span>
                  <span className="text-blue-900 font-medium">White</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Status */}
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-900">Game Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Turn</span>
                  <span className="text-blue-900 font-medium">Your Turn</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Status</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chess Board - Center */}
        <div className="lg:col-span-6">
          <div className="flex justify-center" style={{ marginTop: '-50px' }}>
            <div 
              className="bg-white rounded-lg shadow-sm border border-blue-200 p-4"
              style={{ 
                position: 'relative', 
                zIndex: 1,
                isolation: 'isolate',
                maxWidth: '650px',
                width: '100%',
                overflow: 'visible'
              }}
            >
              <div style={{ transform: 'scale(0.72)', transformOrigin: 'center center' }}>
                <ChessBoard />
              </div>
            </div>
          </div>
        </div>

        {/* Chat - Right Side */}
        <div className="lg:col-span-3">
          {showChat && (
            <Card className="border-blue-200 h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-blue-900 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Game Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-[400px] bg-blue-50 rounded p-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-blue-600 text-sm py-8">
                      No messages yet. Say hello!
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
                        <div className="text-blue-800 bg-white rounded px-2 py-1 shadow-sm">
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
                    className="flex-1 px-3 py-2 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          )}
        </div>
      </div>
    </div>
  );
}