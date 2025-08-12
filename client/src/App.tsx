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
import { AuthProvider } from "./components/auth/AuthProvider";
import { ResponsiveLayout } from "./components/layout/ResponsiveLayout";
import { MobileGameLayout } from "./components/mobile/MobileGameLayout";
import { MarketingRouter } from "./components/marketing/MarketingRouter";
import { LandingPage } from "./components/marketing/LandingPage";
import { BlogPost } from "./components/blog/BlogPost";
import { BlogRouter, BlogPageType } from "./components/blog";
import { ContextualHintOverlay } from "./components/hints/ContextualHintOverlay";
import { useMultiplayer } from "./lib/stores/useMultiplayer";
import { GlobalNavigation } from "./components/layout/GlobalNavigation";
import { MultiplayerHub } from "./components/multiplayer/MultiplayerHub";
import { ResetPasswordForm } from "./components/auth/ResetPasswordForm";
import { PremiumTestButton } from "./components/debug/PremiumTestButton";

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
import { useCampaignRewardCelebration } from "./components/campaign/CampaignRewardCelebration";

import ChessAudioController from "./components/audio/ChessAudioController";

import "@fontsource/inter";
import "./styles/chess.css";
import "./styles/animations.css";
import "./debug";
import ErrorBoundary from "./components/ErrorBoundary";

function AppContent() {
  const { gamePhase, ...gameState } = useChess();
  const { isConnected: isMultiplayerConnected } = useMultiplayer();
  const { initializeAudio } = useAudio();
  const { updateProgress } = useAchievements();
  const { showDiagnostics, setShowDiagnostics } = useDiagnostics();
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [currentPage, setCurrentPage] = useState<'game' | 'landing' | 'strategy' | 'ai-training' | 'tournaments' | 'blog' | 'multiplayer' | 'multiplayer-game' | 'reset-password' | BlogPageType>('landing');
  const [showLanding, setShowLanding] = useState(true);

  const { selectedPieceSet, selectedBoardTheme, setSelectedPieceSet, setSelectedBoardTheme } = useGameSettings();

  // Campaign reward celebration
  const { showCelebration, CelebrationComponent } = useCampaignRewardCelebration();

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
        // Don't let initialization failures break the app
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

  // Campaign reward event listener
  useEffect(() => {
    const handleCampaignReward = (event: CustomEvent) => {
      console.log('🎉 Campaign reward event received:', event.detail);
      showCelebration(event.detail);
    };

    window.addEventListener('campaignRewardEarned', handleCampaignReward as EventListener);
    return () => window.removeEventListener('campaignRewardEarned', handleCampaignReward as EventListener);
  }, [showCelebration]);

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

  const handleStartGame = () => {
    console.log('🎮 Play Now clicked - starting game directly');
    
    // Get player's skill level from local storage or default to easy
    const playerStats = JSON.parse(localStorage.getItem('playerStats') || '{}');
    const winRate = playerStats.winRate || 0;
    const gamesPlayed = playerStats.gamesPlayed || 0;
    
    // Determine AI difficulty based on player performance
    let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
    if (gamesPlayed >= 3) {
      if (winRate > 0.7) {
        difficulty = 'hard';
        console.log('🎯 Player win rate > 70%, setting AI to hard');
      } else if (winRate > 0.4) {
        difficulty = 'medium';
        console.log('🎯 Player win rate 40-70%, setting AI to medium');
      } else {
        console.log('🎯 Player win rate < 40%, keeping AI on easy');
      }
    } else {
      console.log('🎯 New player, starting with easy AI');
    }
    
    // Start the game immediately BEFORE changing page
    const { startGame } = useChess.getState();
    console.log('🎮 Starting game with adaptive difficulty:', difficulty);
    startGame('ai', difficulty);
    
    // Force a re-render by updating the page
    setCurrentPage('game');
    setShowLanding(false);
    
    // Verify game started
    const { gamePhase: newPhase } = useChess.getState();
    console.log('✅ Game phase after start:', newPhase);
  };
  
  // Listen for hash changes to handle navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the '#'
      console.log('🔄 Hash changed to:', hash);
      if (hash === 'game' || hash === 'play') {
        // Simply navigate to game page
        setCurrentPage('game');
      } else if (hash === 'multiplayer') {
        setCurrentPage('multiplayer');
      } else if (hash === 'multiplayer-game') {
        setCurrentPage('multiplayer-game');
      } else if (hash === 'reset-password' || window.location.pathname === '/reset-password') {
        setCurrentPage('reset-password');
      } else if (hash) {
        setCurrentPage(hash as any);
      } else {
        setCurrentPage('landing');
      }
    };
    
    // Check initial hash
    handleHashChange();
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as any);
  };

  // Show marketing/content pages with global navigation
  if (currentPage !== 'game') {
    return (
      <AuthProvider>
        <div className="App">
          <GlobalNavigation 
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onStartGame={handleStartGame}
          />
          
          {currentPage === 'landing' && (
            <LandingPage 
              onJoinFree={() => {
                console.log('🆓 Join Free button clicked - starting game directly');
                handleStartGame();
              }}
              onPlayNow={handleStartGame}
            />
          )}
          
          {(currentPage === 'strategy' || currentPage === 'ai-training' || currentPage === 'tournaments') && (
            <MarketingRouter 
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onStartGame={handleStartGame}
            />
          )}
          
          {currentPage === 'blog' && (
            <BlogPost onBack={() => setCurrentPage('game')} />
          )}

          {(currentPage as BlogPageType) && [
            'chess-training', 'advanced-chess', 'strategy-game', 'interactive-chess',
            '10x10-chess-board', 'magical-wizards', 'real-time-multiplayer', 'ai-opponents',
            'adaptive-learning', 'campaign-mode', 'story-progression', 'hint-system',
            'move-analysis', 'live-tournaments', 'chess-rankings', 'cross-device-synchronization',
            'chess-gameplay', 'online-chess-tools', 'chess-mastery', 'multiplayer-chess'
          ].includes(currentPage as BlogPageType) && (
            <BlogRouter currentPage={currentPage as BlogPageType} />
          )}
          
          {currentPage === 'multiplayer' && (
            <MultiplayerHub />
          )}

          {currentPage === 'multiplayer-game' && (
            <MultiplayerHub />
          )}

          {currentPage === 'reset-password' && (
            <ResetPasswordForm />
          )}



          <PremiumTestButton email="tokingteepee@gmail.com" />
        </div>
      </AuthProvider>
    );
  }

  return (
    <ResponsiveLayout>
      <AuthProvider>
        <div className="App">
          <GlobalNavigation 
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onStartGame={() => setCurrentPage('game')}
          />

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
          <>
            {/* Contextual Hint Overlay for New Players - but not in multiplayer */}
            {!isMultiplayerConnected && (() => {
              // Calculate once per render cycle
              const playerStats = JSON.parse(localStorage.getItem('playerStats') || '{}');
              const gamesPlayed = playerStats.gamesPlayed || 0;
              const hasSeenWelcome = localStorage.getItem('wizard-chess-seen-welcome') === 'true';
              const isNewPlayer = gamesPlayed <= 2 && !hasSeenWelcome;
              
              // Don't render if player has seen welcome or played too many games
              if (!isNewPlayer) {
                return null;
              }
              
              return <ContextualHintOverlay 
                isNewPlayer={true}
                showHints={true}
                onHintDismiss={(hintId) => {
                  if (hintId === 'welcome') {
                    localStorage.setItem('wizard-chess-seen-welcome', 'true');
                  }
                }}
              />;
            })()}
            
            <MobileGameLayout
              onSettings={() => setShowSettings(true)}
              onAchievements={() => setShowAchievements(true)}
              onMenu={() => {
                const { resetGame } = useChess.getState();
                resetGame();
              }}
            >
            <div className="desktop-game-layout hidden md:block min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
              <div className="max-w-7xl mx-auto">
                
                {/* Top Ad Banner */}
                <AdBanner 
                  containerId="game-top-banner"
                  className="mb-4 w-full max-w-2xl mx-auto"
                  style={{ maxWidth: '600px', width: '100%' }}
                />
                
                {/* Game Content - Side by Side Layout */}
                <div className="game-content flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
                  
                  {/* Chess Board - Left Side */}
                  <div className="board-section flex-shrink-0">
                    <ChessBoard />
                  </div>
                  
                  {/* Controls Panel - Right Side */}
                  <div className="controls-section flex-shrink-0 flex flex-col gap-4">
                    <BoardControls onSettings={() => setShowSettings(true)} />
                    
                    {/* Merlin Messages Window - Below Controls */}
                    {gamePhase === 'playing' && (
                      <div className="merlin-messages-panel w-56 h-72 bg-purple-900/90 border-2 border-purple-400 rounded-lg shadow-2xl backdrop-blur-sm">
                        <div className="bg-purple-800 text-purple-100 px-3 py-2 rounded-t-md border-b border-purple-400">
                          <h3 className="text-sm font-bold text-center">🧙‍♂️ Merlin the Wise</h3>
                        </div>
                        <div className="p-3 h-60 overflow-y-auto">
                          <MentorNotification />
                        </div>
                      </div>
                    )}
                  </div>
                  
                </div>
              </div>
              
              {gamePhase === 'ended' && <GameOverDialog />}
            </div>
            
            {/* Mobile game layout is handled by MobileGameLayout wrapper */}
            {gamePhase === 'ended' && <GameOverDialog />}
          </MobileGameLayout>
          </>
        )}

        <SettingsDialog 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
        />

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
        
        {/* Campaign Reward Celebration */}
        <CelebrationComponent />
        
        <PremiumTestButton email="tokingteepee@gmail.com" />
        </div>
      </div>
      </AuthProvider>
    </ResponsiveLayout>
  );
}

// Main App component wrapped with ErrorBoundary
function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('App-level error:', error, errorInfo);
        // Log to server in production
        if (process.env.NODE_ENV === 'production') {
          fetch('/api/log/error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: error.message,
              stack: error.stack,
              componentStack: errorInfo.componentStack,
              timestamp: new Date().toISOString(),
            }),
          }).catch(err => console.error('Failed to log error:', err));
        }
      }}
    >
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;