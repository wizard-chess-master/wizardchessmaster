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
    if (isLoggedIn && user && !isConnected) {
      // Auto-connect when user logs in
      connect({
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        rating: 1200 // Default rating, should come from user data
      });
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