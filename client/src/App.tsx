import { useEffect, useState } from "react";
import { useAudio } from "./lib/stores/useAudio";
import { useChess } from "./lib/stores/useChess";
import { useAchievements } from "./lib/achievements/achievementSystem";
import { gameEventTracker } from "./lib/achievements/gameEventTracker";
import { MainMenu } from "./components/chess/MainMenu";
import { ChessBoard } from "./components/chess/ChessBoard";
import { GameUI } from "./components/chess/GameUI";
import { SettingsDialog } from "./components/chess/SettingsDialog";
import { GameOverDialog } from "./components/chess/GameOverDialog";
import { AchievementNotificationQueue } from "./components/achievements/AchievementNotification";
import { AchievementPanel } from "./components/achievements/AchievementPanel";
import { AdBanner } from "./components/monetization/AdBanner";
import { initializeAds } from "./lib/monetization/adManager";
import { initializePayments } from "./lib/monetization/paymentManager";
import { ambientManager } from "./lib/audio/ambientManager";
import "@fontsource/inter";
import "./styles/chess.css";

function App() {
  const { gamePhase, ...gameState } = useChess();
  const { setHitSound, setSuccessSound, setBackgroundMusic } = useAudio();
  const { updateProgress } = useAchievements();
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

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

  // Monitor game state for ambient sound intensity changes and achievement tracking
  useEffect(() => {
    if (gamePhase === 'playing') {
      ambientManager.analyzeGameIntensity({ gamePhase, ...gameState });
      
      // Start achievement tracking when game begins
      if (gameState.moveHistory.length === 0) {
        gameEventTracker.startGame();
      }
    } else if (gamePhase === 'menu') {
      ambientManager.reset();
    } else if (gamePhase === 'ended' && gameState.winner) {
      // Track game completion for achievements
      gameEventTracker.trackGameEnd(
        gameState.winner, 
        gameState.isCheckmate, 
        gameState.gameMode
      );
    }
  }, [gamePhase, gameState.board, gameState.moveHistory, gameState.isInCheck, gameState.isCheckmate, gameState.winner, gameState.gameMode]);

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
          <MainMenu 
            onSettings={() => setShowSettings(true)} 
            onAchievements={() => setShowAchievements(true)}
          />
        )}
        
        {(gamePhase === 'playing' || gamePhase === 'ended') && (
          <div className="game-layout flex flex-col lg:flex-row gap-4 w-full max-w-7xl mx-auto px-2">
            {/* Chess Board Section - Mobile First */}
            <div className="board-section flex flex-col items-center gap-4 lg:flex-1">
              {/* Ad Banner Above Chess Board */}
              <AdBanner 
                id="game-banner-above-board" 
                className="w-full max-w-2xl"
                style={{ maxWidth: '600px', width: '100%' }}
              />
              <div className="board-container w-full flex justify-center">
                <ChessBoard />
              </div>
            </div>
            {/* Game Controls - Responsive Sidebar */}
            <div className="controls-section w-full lg:w-96 lg:min-w-96">
              <GameUI onSettings={() => setShowSettings(true)} />
            </div>
            {gamePhase === 'ended' && <GameOverDialog />}
          </div>
        )}

        {showSettings && (
          <SettingsDialog onClose={() => setShowSettings(false)} />
        )}

        {showAchievements && (
          <AchievementPanel onClose={() => setShowAchievements(false)} />
        )}

        <AchievementNotificationQueue onViewAll={() => setShowAchievements(true)} />
      </div>
    </div>
  );
}

export default App;