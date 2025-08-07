import { useEffect, useState } from "react";
import { useAudio } from "./lib/stores/useAudio";
import { useChess } from "./lib/stores/useChess";
import { MainMenu } from "./components/chess/MainMenu";
import { ChessBoard } from "./components/chess/ChessBoard";
import { GameUI } from "./components/chess/GameUI";
import { SettingsDialog } from "./components/chess/SettingsDialog";
import { GameOverDialog } from "./components/chess/GameOverDialog";
import { AdBanner } from "./components/monetization/AdBanner";
import { initializeAds } from "./lib/monetization/adManager";
import { initializePayments } from "./lib/monetization/paymentManager";
import { ambientManager } from "./lib/audio/ambientManager";
import "@fontsource/inter";
import "./styles/chess.css";

function App() {
  const { gamePhase, ...gameState } = useChess();
  const { setHitSound, setSuccessSound, setBackgroundMusic } = useAudio();
  const [showSettings, setShowSettings] = useState(false);

  // Initialize audio, monetization, and keyboard shortcuts
  useEffect(() => {
    const hitAudio = new Audio("/sounds/hit.mp3");
    const successAudio = new Audio("/sounds/success.mp3");
    const backgroundMusic = new Audio("/sounds/background.mp3");
    
    setHitSound(hitAudio);
    setSuccessSound(successAudio);
    setBackgroundMusic(backgroundMusic);

    // Initialize monetization and ambient sound systems
    const initSystems = async () => {
      try {
        console.log('💳 Initializing monetization systems...');
        await initializeAds();
        await initializePayments();
        console.log('✅ Monetization systems initialized');
        
        console.log('🎵 Initializing ambient sound system...');
        await ambientManager.initializeAmbientSounds();
        console.log('✅ Ambient sound system initialized');
      } catch (error) {
        console.error('❌ Failed to initialize systems:', error);
      }
    };
    
    initSystems();
  }, [setHitSound, setSuccessSound, setBackgroundMusic]);

  // Monitor game state for ambient sound intensity changes
  useEffect(() => {
    if (gamePhase === 'playing') {
      ambientManager.analyzeGameIntensity({ gamePhase, ...gameState });
    } else if (gamePhase === 'menu') {
      ambientManager.reset();
    }
  }, [gamePhase, gameState.board, gameState.moveHistory, gameState.isInCheck, gameState.isCheckmate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { selectSquare, undoMove, resetGame } = useChess.getState();
      const { toggleMute } = useAudio.getState();
      
      // Ctrl+Z for undo
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        undoMove();
      }
      
      // Ctrl+M for mute toggle
      if (event.ctrlKey && event.key === 'm') {
        event.preventDefault();
        toggleMute();
      }
      
      // Escape to deselect
      if (event.key === 'Escape') {
        const { selectedPosition, selectSquare } = useChess.getState();
        if (selectedPosition) {
          selectSquare(null);
        }
      }
      
      // Ctrl+H for home/menu
      if (event.ctrlKey && event.key === 'h') {
        event.preventDefault();
        resetGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="App">
      <div className="game-container">
        {gamePhase === 'menu' && (
          <MainMenu onSettings={() => setShowSettings(true)} />
        )}
        
        {(gamePhase === 'playing' || gamePhase === 'ended') && (
          <div className="game-layout">
            {/* Ad Banner Above Chess Board */}
            <AdBanner 
              id="game-banner-above-board" 
              className="mb-4"
              style={{ maxWidth: '900px', width: '100%' }}
            />
            <div className="board-container">
              <ChessBoard />
            </div>
            <GameUI onSettings={() => setShowSettings(true)} />
            {gamePhase === 'ended' && <GameOverDialog />}
          </div>
        )}

        {showSettings && (
          <SettingsDialog onClose={() => setShowSettings(false)} />
        )}
      </div>
    </div>
  );
}

export default App;