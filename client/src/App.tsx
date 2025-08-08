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
import { DiagnosticsPanel } from "./components/diagnostics/DiagnosticsPanel";
import { useDiagnostics } from "./lib/stores/useDiagnostics";
import { AdBanner } from "./components/monetization/AdBanner";
import { RewardsScreen } from "./components/rewards/RewardsScreen";
import { useGameSettings } from "./stores/gameSettings";
import { initializeAds } from "./lib/monetization/adManager";
import { initializePayments } from "./lib/monetization/paymentManager";
import { ambientManager } from "./lib/audio/ambientManager";
import ChessAudioController from "./components/audio/ChessAudioController";
import ImmersiveAudioTestPanel from "./components/audio/ImmersiveAudioTestPanel";
import "@fontsource/inter";
import "./styles/chess.css";
import "./styles/animations.css";
import "./debug";

function App() {
  const { gamePhase, ...gameState } = useChess();
  const { setHitSound, setSuccessSound, setBackgroundMusic, setMusicTracks, initializeAudio } = useAudio();
  const { updateProgress } = useAchievements();
  const { showDiagnostics, setShowDiagnostics } = useDiagnostics();
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [showAudioTest, setShowAudioTest] = useState(false);
  const { selectedPieceSet, selectedBoardTheme, setSelectedPieceSet, setSelectedBoardTheme } = useGameSettings();

  // Initialize audio, monetization, and keyboard shortcuts
  useEffect(() => {
    const hitAudio = new Audio("/sounds/hit.mp3");
    const successAudio = new Audio("/sounds/success.mp3");
    const backgroundMusic = new Audio("/sounds/background.mp3");
    
    setHitSound(hitAudio);
    setSuccessSound(successAudio);
    setBackgroundMusic(backgroundMusic);
    
    // Initialize multiple music tracks for dynamic music experience
    const tracks = {
      main_theme: new Audio("/sounds/background.mp3"),
      battle_theme: new Audio("/sounds/background.mp3"), // Will use variations or same track
      victory_theme: new Audio("/sounds/background.mp3"),
      tension_theme: new Audio("/sounds/background.mp3"),
      wizard_theme: new Audio("/sounds/background.mp3")
    };
    
    // Set different playback rates for variety
    tracks.battle_theme.playbackRate = 1.1; // Slightly faster for battle
    tracks.tension_theme.playbackRate = 0.9; // Slower for tension
    tracks.wizard_theme.playbackRate = 1.05; // Slightly faster for wizard theme
    
    setMusicTracks(tracks);
    
    // Ensure audio starts unmuted and start background music
    initializeAudio();
    
    // Initialize game audio manager
    import('./lib/initialization/audioInitialization').then(({ initializeAudioSystem }) => {
      initializeAudioSystem();
    });
    
    // Start background music automatically with a small delay for browser autoplay policies
    setTimeout(() => {
      const { playBackgroundMusic } = useAudio.getState();
      playBackgroundMusic();
    }, 1000);

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
        
        console.log('✨ Initializing Magical Sound Library...');
        const { initializeMagicalSounds } = useAudio.getState();
        await initializeMagicalSounds();
        console.log('✅ Magical Sound Library initialized');
      } catch (error) {
        console.error('❌ Failed to initialize systems:', error);
      }
    };
    
    initSystems();
  }, [setHitSound, setSuccessSound, setBackgroundMusic, setMusicTracks]);

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
        {/* Immersive Audio Controller - manages 3D spatial audio for chess game */}
        <ChessAudioController />
        
        {gamePhase === 'menu' && (
          <MainMenu 
            onSettings={() => setShowSettings(true)} 
            onAchievements={() => setShowAchievements(true)}
            onCollection={() => setShowCollection(true)}
            onAudioTest={() => setShowAudioTest(true)}
          />
        )}
        
        {(gamePhase === 'playing' || gamePhase === 'ended') && (
          <div className="game-layout min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
            <div className="max-w-6xl mx-auto">
              
              {/* Top Ad Banner */}
              <AdBanner 
                id="game-banner-top" 
                className="mb-4 w-full max-w-2xl mx-auto"
                style={{ maxWidth: '600px', width: '100%' }}
              />
              
              {/* Game Content - Board with Side Controls */}
              <div className="flex gap-6 items-start justify-center">
                
                {/* Chess Board Section - Main Center */}
                <div className="board-section flex justify-center">
                  <ChessBoard />
                </div>
                
                {/* Board Controls - Right Side Menu */}
                <div className="board-controls-section">
                  <BoardControls onSettings={() => setShowSettings(true)} />
                </div>
                
              </div>
              
              {/* Game UI Below - Status and History */}
              <div className="game-info-section w-full max-w-4xl mt-6">
                <GameUI onSettings={() => setShowSettings(true)} />
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

        {showAudioTest && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] overflow-auto">
              <button
                onClick={() => setShowAudioTest(false)}
                className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                ✕ Close Audio Test
              </button>
              <ImmersiveAudioTestPanel />
            </div>
          </div>
        )}

        <AchievementNotificationQueue onViewAll={() => setShowAchievements(true)} />
      </div>
    </div>
  );
}

export default App;