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
          <div className="game-layout min-h-screen bg-gradient-to-b from-gray-900 to-black">
            
            {/* Compact Header with Ad */}
            <div className="header-section py-2">
              <AdBanner 
                id="game-banner-top" 
                className="w-full max-w-lg mx-auto"
                style={{ maxWidth: '400px', width: '100%' }}
              />
            </div>

            {/* Main Game Grid Layout */}
            <div className="main-game-area flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-7xl mx-auto">
              
              {/* Left Panel - Game Info (Hidden on Mobile) */}
              <div className="hidden lg:block lg:col-span-3">
                <div className="space-y-4">
                  <GameUI onSettings={() => setShowSettings(true)} />
                  
                  {/* Compact Mentor Panel */}
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-purple-800 mb-2 text-center">
                      🧙‍♂️ Merlin the Wise
                    </h3>
                    <MentorIntegration />
                  </div>
                </div>
              </div>
              
              {/* Center - Chess Board */}
              <div className="col-span-1 lg:col-span-6 flex flex-col items-center justify-center">
                <ChessBoard />
              </div>
              
              {/* Right Panel - Controls */}
              <div className="col-span-1 lg:col-span-3 flex flex-col justify-center">
                <BoardControls onSettings={() => setShowSettings(true)} />
              </div>
              
              {/* Mobile-Only Bottom Sections */}
              <div className="lg:hidden col-span-1 space-y-4">
                <GameUI onSettings={() => setShowSettings(true)} />
                
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3">
                  <h3 className="text-sm font-bold text-purple-800 mb-2 text-center">
                    🧙‍♂️ Merlin the Wise
                  </h3>
                  <MentorIntegration />
                </div>
              </div>
              
            </div>
            
            {/* Adaptive Difficulty Wizard Assistant - Floating overlay */}
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