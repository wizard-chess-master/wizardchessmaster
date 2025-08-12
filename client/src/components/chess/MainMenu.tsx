import React, { useState, useEffect } from 'react';
import { useChess } from '../../lib/stores/useChess';
import { useAuth } from '../../lib/stores/useAuth';
import { playButtonClickSound } from '../../lib/audio/buttonSounds';
import '../../lib/audio/globalAudioManager'; // Initialize global audio manager
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';
import { Settings, Sword, Users, Zap, Brain, BarChart3, X, Home, Trophy, Award, Crown, User, Cloud, LogOut, LogIn } from 'lucide-react';
import { Wand2 } from 'lucide-react';
import { aiTrainer } from '../../lib/chess/aiTraining';
import { aiLearning } from '../../lib/chess/aiLearning';
import { AdBanner } from '../monetization/AdBanner';
import { MassTrainingDialog } from './MassTrainingDialog';
import { CampaignDialog } from './CampaignDialog';
import { CampaignMode } from '../campaign/CampaignMode';
// MULTIPLAYER DISABLED: import { OnlineMultiplayerDialog } from './OnlineMultiplayerDialog';
import { LeaderboardDialog } from './LeaderboardDialog';
import { LoginDialog } from '../auth/LoginDialog';
import { CloudSaveDialog } from '../auth/CloudSaveDialog';
import cloudSaveManager from '../../lib/saves/cloudSaveManager';

import { AdminLogin } from './AdminLogin';

import { isAdminFeatureEnabled, isAdminEnabled } from '../../lib/admin';
import { runDebugVerification, runQuickAITest } from '../../lib/chess/runDebugTests';
import { confirmAndResetTraining } from '../../lib/chess/trainingReset';
import { getPaymentManager } from '../../lib/monetization/paymentManager';
import { MonetizationTester } from '../monetization/MonetizationTester';
import { PremiumComparisonModal, usePremiumComparison } from '../monetization/PremiumComparisonModal';
import { AchievementTestPanel } from '../achievements/AchievementTestPanel';

interface MainMenuProps {
  onSettings: () => void;
  onAchievements: () => void;
  onCollection: () => void;
}

export function MainMenu({ onSettings, onAchievements, onCollection }: MainMenuProps) {
  const chessStore = useChess();
  const { startGame, resetGame, gamePhase } = chessStore;
  const { user, isLoggedIn, isPremium, logout, checkSession } = useAuth();
  
  // Debug premium status and listen for updates
  useEffect(() => {
    if (user) {
      console.log('🔍 MainMenu: User premium status:', {
        username: user.username,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        authStorePremium: isPremium()
      });
      console.log('🔍 MainMenu: Rendering conditions:', {
        isLoggedIn,
        userExists: !!user,
        userIsPremium: user?.isPremium,
        shouldShowUpgrade: !user?.isPremium,
        shouldShowPremiumBadge: !!user?.isPremium
      });
    }
    
    // Listen for premium status updates
    const handlePremiumUpdate = (event: CustomEvent) => {
      console.log('🔄 MainMenu: Received premium status update', event.detail);
      // Force re-render by updating state
      setAdminRefresh(prev => prev + 1);
    };
    
    window.addEventListener('premium-status-updated', handlePremiumUpdate as EventListener);
    
    return () => {
      window.removeEventListener('premium-status-updated', handlePremiumUpdate as EventListener);
    };
  }, [user, isPremium, isLoggedIn]);
  const [isTraining, setIsTraining] = useState(false);
  const [learningStats, setLearningStats] = useState<any>(null);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [showDebugDialog, setShowDebugDialog] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);
  const [adminRefresh, setAdminRefresh] = useState(0);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [showCampaignMode, setShowCampaignMode] = useState(false);
  const { showComparison, openComparison, closeComparison } = usePremiumComparison();


  // Debug admin state on every render
  useEffect(() => {
    console.log('🔐 MainMenu: Checking admin state on render');
    console.log('🔐 MainMenu: Admin refresh counter:', adminRefresh);
    
    // Check current admin status
    const adminStatus = {
      isEnabled: isAdminEnabled(),
      trainingEnabled: isAdminFeatureEnabled('training'),
      debugEnabled: isAdminFeatureEnabled('debug'),
      statsEnabled: isAdminFeatureEnabled('stats'),
      resetEnabled: isAdminFeatureEnabled('reset')
    };
    
    console.log('🔐 MainMenu: Current admin status:', adminStatus);
  }, [adminRefresh]);

  const refreshLearningStats = () => {
    // Only run expensive AI learning stats in development mode to save resources
    if (import.meta.env.DEV) {
      const stats = aiLearning.getLearningStats();
      setLearningStats(stats);
      console.log('🔄 AI learning stats refreshed:', stats);
    }
  };

  useEffect(() => {
    // Load existing learning data
    refreshLearningStats();
  }, []);

  // Campaign Mode View
  if (showCampaignMode) {
    return (
      <CampaignMode onBackToMenu={() => setShowCampaignMode(false)} />
    );
  }

  return (
    <div className="main-menu flex flex-col items-center justify-center min-h-screen">
      {/* Top Menu Ad Banner */}
      <AdBanner 
        containerId="menu-top-banner"
        className="mb-4"
        style={{ maxWidth: '600px', width: '100%' }}
      />

      <div className="menu-container max-w-4xl mx-auto">
        <div className="title-section">
          <div className="title-with-wands">
            <img src="/assets/crossed-wizard-wands.png" alt="Crossed Wizard Wands" className="crossed-wands left-wands" />
            <h1 className="game-title">
              <Zap className="title-icon" />
              Wizard Chess Master
            </h1>
            <img src="/assets/crossed-wizard-wands.png" alt="Crossed Wizard Wands" className="crossed-wands right-wands" />
          </div>
          <p className="game-subtitle">
            10x10 Chess with Magical Wizards
          </p>
        </div>

        <div className="menu-cards">
          {/* Game Modes */}
          <Card className="menu-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Play Game
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="game-mode-buttons">
                <Button
                  className="medieval-btn mode-button adaptive-ai-button"
                  onClick={(e) => {
                    console.log('🎮 Adaptive AI button clicked');
                    // Get adaptive difficulty
                    const playerStats = JSON.parse(localStorage.getItem('playerStats') || '{}');
                    const winRate = playerStats.winRate || 0;
                    const gamesPlayed = playerStats.gamesPlayed || 0;
                    
                    let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
                    if (gamesPlayed >= 3) {
                      if (winRate > 0.7) {
                        difficulty = 'hard';
                      } else if (winRate > 0.4) {
                        difficulty = 'medium';
                      }
                    }
                    
                    console.log(`🎯 Starting adaptive AI (${difficulty}) based on ${(winRate * 100).toFixed(0)}% win rate`);
                    startGame('ai', difficulty);
                  }}
                >
                  <div className="mode-content">
                    <span>🎯 Adaptive AI</span>
                    <Badge variant="secondary" className="adaptive-badge">
                      {(() => {
                        const stats = JSON.parse(localStorage.getItem('playerStats') || '{}');
                        if (!stats.gamesPlayed || stats.gamesPlayed < 3) {
                          return 'Learning Your Style';
                        }
                        const winRate = stats.winRate || 0;
                        if (winRate > 0.7) return 'Challenging You';
                        if (winRate > 0.4) return 'Matched to You';
                        return 'Supporting You';
                      })()}
                    </Badge>
                  </div>
                </Button>
                
                <Button
                  className="medieval-btn mode-button"
                  onClick={(e) => {
                    console.log('🎮 Easy AI button clicked');
                    startGame('ai', 'easy');
                  }}
                >
                  <div className="mode-content">
                    <span>⚡ Player vs AI - Easy</span>
                    <Badge variant="secondary">Beginner</Badge>
                  </div>
                </Button>
                
                <Button
                  className="medieval-btn mode-button"
                  onClick={(e) => {
                    console.log('🎮 Medium AI button clicked');
                    startGame('ai', 'medium');
                  }}
                >
                  <div className="mode-content">
                    <span>🪄 Player vs AI - Medium</span>
                    <Badge variant="secondary">Intermediate</Badge>
                  </div>
                </Button>
                
                <Button
                  className="medieval-btn mode-button"
                  onClick={(e) => {
                    console.log('🎮 Hard AI button clicked');
                    startGame('ai', 'hard');
                  }}
                >
                  <div className="mode-content">
                    <span>🏰 Player vs AI - Hard</span>
                    <Badge variant="secondary">Advanced</Badge>
                  </div>
                </Button>
                
                <Button
                  className="medieval-btn mode-button"
                  onClick={(e) => {
                    console.log('🎮 Expert AI button clicked');
                    startGame('ai', 'expert');
                  }}
                >
                  <div className="mode-content">
                    <span>⚔️ Player vs AI - Expert</span>
                    <Badge variant="secondary">Professional</Badge>
                  </div>
                </Button>
                
                <Button
                  className="medieval-btn mode-button"
                  onClick={(e) => {
                    console.log('🎮 Master AI button clicked');
                    startGame('ai', 'master');
                  }}
                >
                  <div className="mode-content">
                    <span>👑 Player vs AI - Master</span>
                    <Badge variant="secondary">Grandmaster</Badge>
                  </div>
                </Button>
                
                <Button
                  className="medieval-btn mode-button"
                  onClick={(e) => {
                    console.log('🎮 AI vs AI button clicked');
                    startGame('ai-vs-ai', 'hard');
                  }}
                >
                  <div className="mode-content">
                    <span>🤖 AI vs AI Battle</span>
                    <Badge variant="secondary">Training</Badge>
                  </div>
                </Button>
                

                <Button
                  className="medieval-btn mode-button"
                  onClick={() => setShowCampaignMode(true)}
                >
                  <div className="mode-content">
                    <span>🏆 Campaign Mode</span>
                    <Badge variant="secondary">Story & Progression</Badge>
                  </div>
                </Button>

                {/* Temporary access to multiplayer area for testing */}
                <Button 
                  className="medieval-btn mode-button"
                  onClick={() => {
                    console.log('🌐 Navigating to multiplayer area');
                    window.location.hash = '#multiplayer';
                  }}
                >
                  <div className="mode-content">
                    <span>🌐 Multiplayer Arena</span>
                    <Badge variant="secondary">Play vs AI Available</Badge>
                  </div>
                </Button>


                
                <Button
                  className="medieval-btn mode-button"
                  variant="outline"
                  onClick={(e) => {
                    console.log('🎮 Local multiplayer button clicked');
                    startGame('local');
                  }}
                >
                  <div className="mode-content">
                    <span>👥 Local Multiplayer</span>
                    <Badge variant="outline">Pass & Play</Badge>
                  </div>
                </Button>

              </div>
            </CardContent>
          </Card>

          {/* Game Rules */}
          <Card className="menu-card">
            <CardHeader>
              <CardTitle>Game Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rules-content">
                <div className="rule-item">
                  <h4>Board Size</h4>
                  <p>10x10 squares instead of traditional 8x8</p>
                </div>
                
                <div className="rule-item">
                  <h4>Standard Pieces</h4>
                  <p>All traditional chess pieces with standard movement</p>
                </div>
                
                <div className="rule-item">
                  <h4>🧙‍♂️ Wizard Pieces</h4>
                  <p>
                    <strong>Position:</strong> Two wizards per side in corners (a1/j1 for white, a10/j10 for black)<br/>
                    <strong>Teleport:</strong> Move to any unoccupied square within 2 spaces<br/>
                    <strong>Ranged Attack:</strong> Attack enemies within 2 squares without moving
                  </p>
                </div>
                
                <div className="rule-item">
                  <h4>🏰 Castling Rules</h4>
                  <p>
                    <strong>King Movement:</strong> Moves 3 squares towards rook (to c1 or g1)<br/>
                    <strong>Rook Movement:</strong> Moves to square next to king (d1 or f1)<br/>
                    <strong>Requirements:</strong> No pieces between king and rook, king not in check, neither piece has moved before
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card className="menu-card">
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="controls-content">
                <div className="control-item">
                  <span className="control-key">Mouse Click</span>
                  <span>Select piece / Make move</span>
                </div>
                
                <div className="control-item">
                  <span className="control-key">Ctrl+Z</span>
                  <span>Undo last move</span>
                </div>
                
                <div className="control-item">
                  <span className="control-key">Escape</span>
                  <span>Deselect piece</span>
                </div>
                
                <div className="control-item">
                  <span className="control-key">Ctrl+M</span>
                  <span>Toggle sound</span>
                </div>
                
                <div className="control-item">
                  <span className="control-key">Ctrl+H</span>
                  <span>Return to menu</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="menu-footer">
          {/* Authentication Section */}
          <div className="flex gap-2 mb-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg border border-green-300">
                  <User className="w-4 h-4 text-green-700" />
                  <span className="text-sm text-green-700">
                    Welcome, {user?.displayName}
                    {user?.isPremium && (
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <Crown className="w-4 h-4 inline ml-2 text-amber-600" data-testid="premium-crown" style={{ color: '#d97706' }} />
                        <span style={{ color: '#d97706', fontSize: '12px', fontWeight: 'bold', marginLeft: '4px' }}>PREMIUM</span>
                      </span>
                    )}
                  </span>
                </div>
                
                <CloudSaveDialog>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <Cloud className="w-4 h-4 mr-1" />
                    Save Data
                  </Button>
                </CloudSaveDialog>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async (e) => {
                    console.log('🚪 Logout button clicked');
                    await logout();
                    console.log('🚪 User logged out from MainMenu');
                  }}
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <LoginDialog
                onSuccess={async () => {
                  console.log('🎉 Auth success - refreshing session and UI');
                  // Force session refresh to update UI state
                  await checkSession();
                  console.log('✅ Session refreshed after auth success');
                }}
              >
                <Button
                  variant="outline"
                  className="border-amber-300 text-amber-600 hover:bg-amber-50 flex-1"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login / Register
                </Button>
              </LoginDialog>
            )}
          </div>

          <Button
            variant="outline"
            onClick={(e) => {
              console.log('⚙️ Settings button clicked');
              onSettings();
            }}
            className="medieval-btn"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          
          <Button
            variant="outline"
            onClick={(e) => {
              console.log('🏆 Achievements button clicked');
              onAchievements();
            }}
            className="medieval-btn"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Achievements
          </Button>
          
          <Button
            variant="outline"
            onClick={(e) => {
              console.log('👑 Collection button clicked');
              onCollection();
            }}
            className="medieval-btn"
          >
            <Crown className="w-4 h-4 mr-2" />
            Collection
          </Button>
          
          <LeaderboardDialog>
            <Button
              variant="outline"
              className="medieval-btn"
            >
              <Award className="w-4 h-4 mr-2" />
              Leaderboards
            </Button>
          </LeaderboardDialog>
          

          
          {(!user?.isPremium && isLoggedIn) && (
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={(e) => {
                  console.log('💳 Premium upgrade button clicked');
                  const paymentManager = getPaymentManager();
                  paymentManager.showPlanSelector();
                }}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0 flex-1"
                data-testid="upgrade-button"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            
              <Button
                variant="outline"
                onClick={() => {
                  (window as any).gameAudioManager?.onButtonClick();
                  openComparison();
                }}
                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
              >
                Compare
              </Button>
            </div>
          )}
          
          {(user?.isPremium || isLoggedIn) && (
            <div className="premium-status-container">
              {user?.isPremium ? (
                <div 
                  className="flex items-center gap-2 p-3 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg border border-amber-300" 
                  data-testid="premium-badge"
                >
                  <Crown className="w-5 h-5 text-amber-600" />
                  <div>
                    <div className="text-sm font-semibold text-amber-800">Premium Member</div>
                    <div className="text-xs text-amber-700">Ad-free • Unlimited hints • Full campaign</div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-600">Logged in as free user</div>
              )}
            </div>
          )}


        </div>
      </div>

      {/* Premium Comparison Modal */}
      <PremiumComparisonModal 
        open={showComparison}
        onClose={closeComparison}
      />
    </div>
  );
}
