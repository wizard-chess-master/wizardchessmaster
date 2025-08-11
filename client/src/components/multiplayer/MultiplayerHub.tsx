import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/stores/useAuth';
import { useMultiplayer } from '../../lib/stores/useMultiplayer';
import { MultiplayerLobby } from './MultiplayerLobby';
import { MultiplayerGame } from './MultiplayerGame';
import { MatchmakingModal } from './MatchmakingModal';

export function MultiplayerHub() {
  const { user, isLoggedIn } = useAuth();
  const { currentGame, connect, disconnect, isConnected } = useMultiplayer();
  const [showMatchmaking, setShowMatchmaking] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      if (isLoggedIn && user) {
        console.log('🔌 Auto-connecting authenticated user to multiplayer:', user.username);
        // Auto-connect when user logs in
        connect({
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          rating: 1200 // Default rating, should come from user data
        });
      } else {
        console.log('🔌 Auto-connecting guest user to multiplayer');
        // Connect as guest user
        connect({
          userId: Math.floor(Math.random() * 1000000), // Random guest ID
          username: `Guest${Math.floor(Math.random() * 10000)}`,
          displayName: `Guest Player`,
          rating: 1200
        });
      }
    }
  }, [isLoggedIn, user, isConnected, connect]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, []);

  // Show active game if one exists
  if (currentGame) {
    return (
      <MultiplayerGame 
        onBackToLobby={() => setShowMatchmaking(false)}
      />
    );
  }

  return (
    <>
      <MultiplayerLobby />
      
      <MatchmakingModal
        isOpen={showMatchmaking}
        onClose={() => setShowMatchmaking(false)}
        onGameStart={() => setShowMatchmaking(false)}
      />
    </>
  );
}