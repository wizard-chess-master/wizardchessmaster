import React, { useEffect, useState } from 'react';
import { SimpleMultiplayerLayout } from './SimpleMultiplayerLayout';
import { useChess } from '../../lib/stores/useChess';
import { useMultiplayer } from '../../lib/stores/useMultiplayer';
import { useAudio } from '../../lib/stores/useAudio';

export function MultiplayerGame() {
  const { disconnect, currentGame, setCurrentGame } = useMultiplayer();
  const { gamePhase, startGame, resetGame } = useChess();
  const { playPieceMovementSound } = useAudio();
  
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    player: string;
    message: string;
    timestamp: Date;
  }>>([]);
  const [newMessage, setNewMessage] = useState('');

  // Add multiplayer-active class to body
  useEffect(() => {
    document.body.classList.add('multiplayer-active');
    return () => {
      document.body.classList.remove('multiplayer-active');
    };
  }, []);

  // Initialize game when component loads
  useEffect(() => {
    if (currentGame && gamePhase === 'menu') {
      console.log('🎮 Starting multiplayer game');
      startGame('ai', 'medium');
    }
  }, [currentGame, gamePhase, startGame]);

  const handleLeaveRoom = () => {
    resetGame();
    setCurrentGame(null);
    window.location.hash = '#multiplayer';
  };

  const handleToggleChat = () => {
    setShowChat(!showChat);
  };

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        player: 'You',
        message: newMessage,
        timestamp: new Date()
      };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="multiplayer-game-wrapper" style={{ position: 'relative', zIndex: 1 }}>
      <SimpleMultiplayerLayout
        onLeaveRoom={handleLeaveRoom}
        onToggleChat={handleToggleChat}
        showChat={showChat}
        chatMessages={chatMessages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendChatMessage={sendChatMessage}
      />
    </div>
  );
}