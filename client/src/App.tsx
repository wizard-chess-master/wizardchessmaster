import { useEffect, useState } from "react";
import { useAudio } from "./lib/stores/useAudio";
import { useChess } from "./lib/stores/useChess";
import { useAchievements } from "./lib/achievements/achievementSystem";
import { gameEventTracker } from "./lib/achievements/gameEventTracker";
import { MainMenu } from "./components/chess/MainMenu";
import { ChessBoard } from "./components/chess/ChessBoard";
import { GameUI } from "./components/chess/GameUI";
import { BoardControls } from "./components/chess/BoardControls";
import { SettingsDialog } from "./components/chess/SettingsDialog";
import { GameOverDialog } from "./components/chess/GameOverDialog";
import { AdaptiveDifficultyWizardAssistant } from "./components/chess/AdaptiveDifficultyWizardAssistant";
import { AchievementNotificationQueue } from "./components/achievements/AchievementNotification";
import { AchievementPanel } from "./components/achievements/AchievementPanel";
import { MentorIntegration } from "./components/mentor/MentorIntegration";
import { MentorNotification } from "./components/mentor/MentorNotification";
import { DiagnosticsPanel } from "./components/diagnostics/DiagnosticsPanel";
import { useDiagnostics } from "./lib/stores/useDiagnostics";
import { AdBanner } from "./components/monetization/AdBanner";
import { RewardsScreen } from "./components/rewards/RewardsScreen";
import { useGameSettings } from "./stores/gameSettings";
import { initializeAds } from "./lib/monetization/adManager";
import { initializePayments } from "./lib/monetization/paymentManager";

import ChessAudioController from "./components/audio/ChessAudioController";

import "@fontsource/inter";
import "./styles/chess.css";
import "./styles/animations.css";
import "./debug";

function App() {
  const { gamePhase, ...gameState } = useChess();
  const { initializeAudio } = useAudio();
  const { updateProgress } = useAchievements();
  const { showDiagnostics, setShowDiagnostics } = useDiagnostics();
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCollection, setShowCollection] = useState(false);

  const { selectedPieceSet, selectedBoardTheme, setSelectedPieceSet, setSelectedBoardTheme } = useGameSettings();

  // Initialize audio and monetization systems
  useEffect(() => {
    const initSystems = async () => {
      try {
        // Initialize audio system first
        console.log('🎵 Initializing audio system...');
        await initializeAudio();
        console.log('✅ Audio system initialized');
        
        // Initialize monetization systems
        console.log('💳 Initializing monetization systems...');
        await initializeAds();
        await initializePayments();
        console.log('✅ Monetization systems initialized');
      } catch (error) {
        console.error('❌ Failed to initialize systems:', error);
      }
    };
    
    initSystems();
  }, [initializeAudio]);

  // Monitor game state for achievement tracking only
  useEffect(() => {
    if (gamePhase === 'playing') {
      // Start achievement tracking when game begins
      if (gameState.moveHistory.length === 0) {
        gameEventTracker.startGame();
      }
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
        {/* Immersive Audio Controller - manages 3D spatial audio for chess game */}
        <ChessAudioController />
        
        {gamePhase === 'menu' && (
          <MainMenu 
            onSettings={() => setShowSettings(true)} 
            onAchievements={() => setShowAchievements(true)}
            onCollection={() => setShowCollection(true)}

          />
        )}
        
        {(gamePhase === 'playing' || gamePhase === 'ended') && (
          <div className="game-layout min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
            <div className="max-w-6xl mx-auto">
              
              {/* Top Ad Banner */}
              <AdBanner 
                id="game-banner-top" 
                className="mb-4 w-full max-w-lg mx-auto"
                style={{ maxWidth: '500px', width: '100%' }}
              />
              
              {/* Main Game Content */}
              <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
                
                {/* Left Side - Game Info & Controls */}
                <div className="w-full lg:w-80 space-y-4 order-2 lg:order-1">
                  <GameUI onSettings={() => setShowSettings(true)} />
                  <BoardControls onSettings={() => setShowSettings(true)} />
                </div>
                
                {/* Center - Chess Board */}
                <div className="flex-1 flex justify-center order-1 lg:order-2">
                  <ChessBoard />
                </div>
                
                {/* Right Side - Mentor Panel */}
                <div className="w-full lg:w-80 order-3">
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-purple-800 mb-3 text-center">
                      🧙‍♂️ Merlin the Wise
                    </h3>
                    <MentorIntegration />
                  </div>
                </div>
                
              </div>
            </div>
            
            {/* Floating Elements */}
            <AdaptiveDifficultyWizardAssistant />
            {gamePhase === 'ended' && <GameOverDialog />}
          </div>
        )}

        {showSettings && (
          <SettingsDialog onClose={() => setShowSettings(false)} />
        )}

        {showAchievements && (
          <AchievementPanel onClose={() => setShowAchievements(false)} />
        )}

        {showCollection && (
          <RewardsScreen 
            onClose={() => setShowCollection(false)}
            selectedPieceSet={selectedPieceSet}
            selectedBoardTheme={selectedBoardTheme}
            onSelectPieceSet={setSelectedPieceSet}
            onSelectBoardTheme={setSelectedBoardTheme}
          />
        )}

        {showDiagnostics && (
          <DiagnosticsPanel onClose={() => setShowDiagnostics(false)} />
        )}



        <AchievementNotificationQueue onViewAll={() => setShowAchievements(true)} />
        
        {/* Floating Mentor Notifications */}
        <MentorNotification />
      </div>
    </div>
  );
}

export default App;