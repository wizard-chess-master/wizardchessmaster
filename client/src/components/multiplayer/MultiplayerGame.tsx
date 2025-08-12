import React, { useEffect, useState, useRef } from 'react';
import { SimpleMultiplayerLayout } from './SimpleMultiplayerLayout';
import { useChess } from '../../lib/stores/useChess';
import { useMultiplayer } from '../../lib/stores/useMultiplayer';
import { useAudio } from '../../lib/stores/useAudio';
import { getAIChatInstance } from '../../lib/ai/multiplayerAIChat';

export function MultiplayerGame() {
  const { disconnect, currentGame, setCurrentGame } = useMultiplayer();
  const { gamePhase, startGame, resetGame, board, moveHistory } = useChess();
  const { playPieceMovementSound } = useAudio();
  const aiChat = useRef(getAIChatInstance('coach'));
  const lastMoveCount = useRef(0);
  
  const [showChat, setShowChat] = useState(true); // Default to showing chat
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    player: string;
    message: string;
    timestamp: Date;
    isAI?: boolean;
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
      startGame('multiplayer', 'medium');
      
      // Add AI greeting
      const greeting = aiChat.current.getGreeting();
      setChatMessages([{
        id: 'ai-greeting',
        player: '🤖 AI Coach',
        message: greeting,
        timestamp: new Date(),
        isAI: true
      }]);
    }
  }, [currentGame, gamePhase, startGame]);
  
  // Monitor moves and generate AI commentary
  useEffect(() => {
    if (moveHistory.length > lastMoveCount.current) {
      const lastMove = moveHistory[moveHistory.length - 1];
      if (lastMove) {
        // Generate AI comment for the move
        aiChat.current.analyzeMove(lastMove, board, lastMove.piece.color).then(comment => {
          if (comment) {
            setChatMessages(prev => [...prev, {
              id: `ai-${Date.now()}`,
              player: '🤖 AI Coach',
              message: comment,
              timestamp: new Date(),
              isAI: true
            }]);
          }
        });
      }
      lastMoveCount.current = moveHistory.length;
    }
  }, [moveHistory, board]);
  
  // Add idle commentary (less frequently)
  useEffect(() => {
    const idleTimer = setInterval(() => {
      const idleComment = aiChat.current.getIdleComment();
      if (idleComment && chatMessages.length > 0) {
        setChatMessages(prev => [...prev, {
          id: `ai-idle-${Date.now()}`,
          player: '🤖 AI Coach',
          message: idleComment,
          timestamp: new Date(),
          isAI: true
        }]);
      }
    }, 125000); // Check every 125 seconds (but AI will only comment if 120s have passed since last comment)
    
    return () => clearInterval(idleTimer);
  }, [chatMessages.length]);

  const handleLeaveRoom = () => {
    resetGame();
    setCurrentGame(null);
    window.location.hash = '#multiplayer';
  };

  const handleToggleChat = () => {
    setShowChat(!showChat);
  };

  const sendChatMessage = async () => {
    if (newMessage.trim()) {
      const playerMessage = {
        id: Date.now().toString(),
        player: 'You',
        message: newMessage,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, playerMessage]);
      
      // Get AI response
      const aiResponse = await aiChat.current.respondToMessage(newMessage);
      if (aiResponse) {
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: `ai-response-${Date.now()}`,
            player: '🤖 AI Coach',
            message: aiResponse,
            timestamp: new Date(),
            isAI: true
          }]);
        }, 500); // Small delay to make it feel more natural
      }
      
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