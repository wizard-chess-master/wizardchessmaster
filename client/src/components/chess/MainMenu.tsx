import React, { useState, useEffect } from 'react';
import { useChess } from '../../lib/stores/useChess';
import { playButtonClickSound } from '../../lib/audio/buttonSounds';
import '../../lib/audio/globalAudioManager'; // Initialize global audio manager
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';
import { Settings, Sword, Users, Zap, Brain, BarChart3, X, Home, Trophy, Award, Crown } from 'lucide-react';
import { Wand2 } from 'lucide-react';
import { aiTrainer } from '../../lib/chess/aiTraining';
import { aiLearning } from '../../lib/chess/aiLearning';
import { AdBanner } from '../monetization/AdBanner';
import { MassTrainingDialog } from './MassTrainingDialog';
import { CampaignDialog } from './CampaignDialog';
// MULTIPLAYER DISABLED: import { OnlineMultiplayerDialog } from './OnlineMultiplayerDialog';
import { LeaderboardDialog } from './LeaderboardDialog';
import { AIDifficultyVisualization } from './AIDifficultyVisualization';
import { AdminLogin } from './AdminLogin';

import { isAdminFeatureEnabled, isAdminEnabled } from '../../lib/admin';
import { runDebugVerification, runQuickAITest } from '../../lib/chess/runDebugTests';
import { confirmAndResetTraining } from '../../lib/chess/trainingReset';
import { getPaymentManager } from '../../lib/monetization/paymentManager';

interface MainMenuProps {
  onSettings: () => void;
  onAchievements: () => void;
  onCollection: () => void;
}

export function MainMenu({ onSettings, onAchievements, onCollection }: MainMenuProps) {
  const { startGame, resetGame } = useChess();
  const [isTraining, setIsTraining] = useState(false);
  const [learningStats, setLearningStats] = useState<any>(null);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [showDebugDialog, setShowDebugDialog] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);
  const [adminRefresh, setAdminRefresh] = useState(0);


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
    const stats = aiLearning.getLearningStats();
    setLearningStats(stats);
    console.log('🔄 AI learning stats refreshed:', stats);
  };

  useEffect(() => {
    // Load existing learning data
    refreshLearningStats();
  }, []);

  return (
    <div className="main-menu">
      {/* Top Menu Ad Banner */}
      <AdBanner 
        id="menu-banner" 
        className="mb-4"
        style={{ maxWidth: '600px', width: '100%' }}
      />

      <div className="menu-container">
        <div className="title-section">
          <div className="title-with-wands">
            <img src="/assets/crossed-wizard-wands.png" alt="Crossed Wizard Wands" className="crossed-wands left-wands" />
            <h1 className="game-title">
              <Zap className="title-icon" />
              Wizard Chess Duel
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
                  className="medieval-btn mode-button"
                  onClick={async () => {
                    console.log('🎮 Player vs AI - Easy clicked - Theme-music2.mp3 dynamic cache busting');
                    
                    // AGGRESSIVE cleanup function - stops ALL audio before starting new
                    async function cleanAudio() { 
                      try {
                        const context = new AudioContext(); 
                        await context.close(); 
                        console.log('✅ AudioContext closed');
                      } catch (e) {
                        console.log('AudioContext already closed or unavailable');
                      }
                      
                      // Stop ALL audio elements
                      document.querySelectorAll('audio').forEach(a => { 
                        a.pause(); 
                        a.currentTime = 0; 
                        a.src = ''; // Clear source
                        a.remove(); 
                      }); 
                      
                      // Stop any global audio manager music
                      if ((window as any).gameAudioManager?.themeMusic) {
                        (window as any).gameAudioManager.themeMusic.pause();
                        (window as any).gameAudioManager.themeMusic.currentTime = 0;
                        (window as any).gameAudioManager.themeMusic.src = '';
                        (window as any).gameAudioManager.themeMusic = null;
                      }
                      
                      // Stop any global theme music
                      if ((window as any).currentTheme) {
                        (window as any).currentTheme.pause();
                        (window as any).currentTheme.currentTime = 0;
                        (window as any).currentTheme.src = '';
                        (window as any).currentTheme = null;
                      }
                      
                      console.log('🛑 AGGRESSIVE audio cleanup completed - all sources stopped'); 
                    }
                    
                    // Execute cleanup before theme.play()
                    await cleanAudio();
                    
                    // Set Theme-music2.mp3 with dynamic cache busting and fallback
                    const theme = new Audio(`/assets/music/Theme-music2.mp3?t=${Date.now()}`);
                    theme.loop = true;
                    theme.volume = 0.42;
                    
                    // Simplified error handling for main menu
                    theme.addEventListener('error', (e) => {
                      console.error('❌ Theme-music2.mp3 failed to load from main menu:', e);
                      console.log('🚫 No automatic fallback - user can use toggle to try again');
                    });
                    
                    theme.play()
                      .then(() => {
                        (window as any).currentTheme = theme; // Store global reference for toggle control
                        console.log('✅ Theme-music2.mp3 dynamic cache FORCED on Player vs AI - Easy click');
                        console.log('Theme forced:', theme.src, theme.paused ? 'Paused' : 'Playing');
                      })
                      .catch((error) => {
                        console.error('❌ Failed to force theme music from main menu:', error);
                        console.log('🚫 No automatic fallback - user can use toggle button to start music');
                      });
                    
                    (window as any).gameAudioManager?.onButtonClick();
                    console.log('🎮 Starting new AI game - easy mode');
                    startGame('ai', 'easy');
                  }}
                >
                  <div className="mode-content">
                    <span>🧙 Player vs AI - Easy</span>
                    <Badge variant="secondary">Beginner</Badge>
                  </div>
                </Button>
                
                <Button
                  className="medieval-btn mode-button"
                  onClick={() => {
                    (window as any).gameAudioManager?.onButtonClick();
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
                  onClick={() => {
                    (window as any).gameAudioManager?.onButtonClick();
                    startGame('ai', 'hard');
                  }}
                >
                  <div className="mode-content">
                    <span>🏰 Player vs AI - Hard</span>
                    <Badge variant="secondary">Expert</Badge>
                  </div>
                </Button>
                
                <Button
                  className="medieval-btn mode-button"
                  onClick={() => {
                    (window as any).gameAudioManager?.onButtonClick();
                    startGame('ai-vs-ai', 'hard');
                  }}
                >
                  <div className="mode-content">
                    <span>🤖 AI vs AI Battle</span>
                    <Badge variant="secondary">Training</Badge>
                  </div>
                </Button>
                

                <CampaignDialog>
                  <Button className="medieval-btn mode-button">
                    <div className="mode-content">
                      <span>🏆 Campaign Mode</span>
                      <Badge variant="secondary">Progressive AI</Badge>
                    </div>
                  </Button>
                </CampaignDialog>

                {/* MULTIPLAYER TEMPORARILY DISABLED - Will be re-enabled later
                <OnlineMultiplayerDialog>
                  <Button className="medieval-btn mode-button">
                    <div className="mode-content">
                      <span>🌐 Online Multiplayer</span>
                      <Badge variant="secondary">Player vs Player</Badge>
                    </div>
                  </Button>
                </OnlineMultiplayerDialog>
                */}

{/* Admin-only features */}
                {isAdminFeatureEnabled('training') && (
                  <MassTrainingDialog onTrainingComplete={refreshLearningStats}>
                    <Button
                      className="medieval-btn mode-button"
                      variant="outline"
                    >
                      <div className="mode-content">
                        <span>🧙 Mass AI Training</span>
                        <Badge variant="secondary">1-10000 Games</Badge>
                      </div>
                    </Button>
                  </MassTrainingDialog>
                )}


                
                {isAdminFeatureEnabled('reset') && (
                  <Button
                    className="medieval-btn mode-button"
                    variant="outline"
                    onClick={() => {
                      console.log('🔄 Training reset requested...');
                      try {
                        confirmAndResetTraining();
                      } catch (error) {
                        console.error('❌ Training reset failed:', error);
                      }
                    }}
                  >
                    <div className="mode-content">
                      <span>🔄 Reset AI Training</span>
                      <Badge variant="destructive">Clear All Data</Badge>
                    </div>
                  </Button>
                )}
                
                {isAdminFeatureEnabled('stats') && (
                  <Button
                    className="medieval-btn mode-button"
                    variant="outline"
                    onClick={() => {
                      refreshLearningStats();
                      setShowStatsDialog(true);
                    }}
                  >
                    <div className="mode-content">
                      <span>📊 View AI Learning Stats</span>
                      <Badge variant="secondary">
                        {learningStats?.totalGamesAnalyzed || 0} Games
                      </Badge>
                    </div>
                  </Button>
                )}
                
                <Button
                  className="medieval-btn mode-button"
                  variant="outline"
                  onClick={() => {
                    (window as any).gameAudioManager?.onButtonClick();
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
          <Button
            variant="outline"
            onClick={() => {
              (window as any).gameAudioManager?.onButtonClick();
              onSettings();
            }}
            className="medieval-btn"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              (window as any).gameAudioManager?.onButtonClick();
              onAchievements();
            }}
            className="medieval-btn"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Achievements
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              (window as any).gameAudioManager?.onButtonClick();
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
          
          <AIDifficultyVisualization>
            <Button
              variant="outline"
              className="medieval-btn"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Difficulty
            </Button>
          </AIDifficultyVisualization>
          
          <Button
            variant="default"
            onClick={() => {
              (window as any).gameAudioManager?.onButtonClick();
              console.log('💳 Remove Ads button clicked');
              const paymentManager = getPaymentManager();
              if (paymentManager.isUserPremium()) {
                alert('🎉 You already have Premium! All ads are removed and premium features are unlocked.');
              } else {
                paymentManager.showPlanSelector();
              }
            }}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0"
          >
            <Crown className="w-4 h-4 mr-2" />
            Remove Ads - $5/month
          </Button>

          <AdminLogin 
            onAuthChange={(isAuthenticated) => {
              console.log('🔐 MainMenu: AdminLogin onAuthChange called with:', isAuthenticated);
              console.log('🔐 MainMenu: Incrementing admin refresh counter');
              setAdminRefresh(prev => {
                const newValue = prev + 1;
                console.log('🔐 MainMenu: Admin refresh counter updated:', prev, '->', newValue);
                return newValue;
              });
            }}
          />
        </div>
      </div>

      {/* AI Learning Stats Dialog - Admin Only */}
      {isAdminFeatureEnabled('stats') && (
        <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Learning Statistics
            </DialogTitle>
          </DialogHeader>
          
          {/* Navigation button at top */}
          <div className="flex gap-2 mb-4 pb-4 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🏠 Back to Menu clicked - closing dialog');
                setShowStatsDialog(false);
                console.log('✅ setShowStatsDialog(false) called');
              }}
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          </div>
          
          <div className="space-y-4 p-1">
            {learningStats && learningStats.totalGamesAnalyzed >= 0 ? (
              <div className="space-y-4">
                <div className="text-lg font-semibold mb-4">Learning Statistics</div>
                
                {/* Core Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex justify-between items-center p-3 bg-slate-100 rounded">
                    <span className="font-medium">Total Games:</span>
                    <span className="font-bold text-lg">{learningStats.totalGamesAnalyzed}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-100 rounded">
                    <span className="font-medium">Recent Games:</span>
                    <span className="font-bold text-lg">{learningStats.recentGames}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-100 rounded">
                    <span className="font-medium">Human Games:</span>
                    <span className="font-bold text-lg">{learningStats.humanGames}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-100 rounded">
                    <span className="font-medium">AI Games:</span>
                    <span className="font-bold text-lg">{learningStats.aiGames}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded">
                    <span className="font-medium text-green-800">Win vs Human:</span>
                    <span className="font-bold text-lg text-green-700">{Math.round(learningStats.winRateVsHuman)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded">
                    <span className="font-medium text-blue-800">Win vs AI:</span>
                    <span className="font-bold text-lg text-blue-700">{Math.round(learningStats.winRateVsAI)}%</span>
                  </div>
                </div>

                {/* Learning Patterns */}
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">Learning Patterns</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-purple-700">Move Patterns:</span>
                      <span className="font-bold text-lg text-purple-800">{learningStats.movePatterns}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-purple-700">Position Patterns:</span>
                      <span className="font-bold text-lg text-purple-800">{learningStats.positionalPatterns}</span>
                    </div>
                  </div>
                </div>

                {/* Advanced Stats */}
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-3">Advanced Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-amber-700">Proficiency:</span>
                      <span className="font-bold text-amber-800 capitalize">{learningStats.proficiencyLevel || 'Novice'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-amber-700">Experience:</span>
                      <span className="font-bold text-amber-800">{learningStats.experiencePoints || 0} XP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-amber-700">Progress:</span>
                      <span className="font-bold text-amber-800">{learningStats.learningProgress || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Preferred Strategies */}
                {learningStats.preferredStrategies && learningStats.preferredStrategies.length > 0 && (
                  <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <h3 className="font-semibold text-indigo-800 mb-3">Preferred Strategies</h3>
                    <div className="flex flex-wrap gap-2">
                      {learningStats.preferredStrategies.map((strategy: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-indigo-200 text-indigo-800 rounded-full text-sm font-medium">
                          {strategy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🏠 Back to Menu clicked - closing dialog');
                      setShowStatsDialog(false);
                      console.log('✅ setShowStatsDialog(false) called');
                    }}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Back to Menu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('🔄 Resetting AI learning data...');
                      aiLearning.resetLearning();
                      const freshStats = aiLearning.getLearningStats();
                      setLearningStats(freshStats);
                      console.log('✅ Learning data reset completed:', freshStats);
                    }}
                  >
                    Reset Learning Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const stats = aiLearning.getLearningStats();
                      setLearningStats(stats);
                    }}
                  >
                    Refresh Stats
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">No learning data available yet.</p>
                <p className="text-sm text-muted-foreground">
                  Play games against AI or run training sessions to see statistics.
                </p>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const stats = aiLearning.getLearningStats();
                      setLearningStats(stats);
                    }}
                  >
                    Reload Stats
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
        </Dialog>
      )}



    </div>
  );
}
