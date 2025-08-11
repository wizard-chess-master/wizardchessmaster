import React, { useEffect, useState } from 'react';
import { SimpleMultiplayerLayout } from './SimpleMultiplayerLayout';
import { useChess } from '../../lib/stores/useChess';
import { useMultiplayer } from '../../lib/stores/useMultiplayer';
import { useAudio } from '../../lib/stores/useAudio';

export function MultiplayerGame() {
  const { disconnect, currentGame, players } = useMultiplayer();
  const { gamePhase, startGame } = useChess();
  const { playPieceMovementSound } = useAudio();
  
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    player: string;
    message: string;
    timestamp: Date;
  }>>([]);
  const [newMessage, setNewMessage] = useState('');

  // Initialize game when component loads
  useEffect(() => {
    if (currentGame && gamePhase === 'menu') {
      console.log('🎮 Starting multiplayer game');
      startGame('multiplayer', 'medium');
    }
  }, [currentGame, gamePhase, startGame]);

  const handleLeaveRoom = () => {
    disconnect();
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
    <SimpleMultiplayerLayout
      onLeaveRoom={handleLeaveRoom}
      onToggleChat={handleToggleChat}
      showChat={showChat}
      chatMessages={chatMessages}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
      sendChatMessage={sendChatMessage}
    />
  );
}