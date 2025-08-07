import React, { useState, useEffect } from 'react';
import { useChess } from '../../lib/stores/useChess';
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
import { OnlineMultiplayerDialog } from './OnlineMultiplayerDialog';
import { LeaderboardDialog } from './LeaderboardDialog';
import { AIDifficultyVisualization } from './AIDifficultyVisualization';
import { AdminLogin } from './AdminLogin';
import { MagicalSoundTestPanel } from '../audio/MagicalSoundTestPanel';
import { isAdminFeatureEnabled, isAdminEnabled } from '../../lib/admin';
import { runDebugVerification, runQuickAITest } from '../../lib/chess/runDebugTests';
import { confirmAndResetTraining } from '../../lib/chess/trainingReset';

interface MainMenuProps {
  onSettings: () => void;
  onAchievements: () => void;
  onCollection: () => void;
  onAudioTest?: () => void;
}

export function MainMenu({ onSettings, onAchievements, onCollection, onAudioTest }: MainMenuProps) {
  const { startGame, resetGame } = useChess();
  const [isTraining, setIsTraining] = useState(false);
  const [learningStats, setLearningStats] = useState<any>(null);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [showDebugDialog, setShowDebugDialog] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);
  const [adminRefresh, setAdminRefresh] = useState(0);
  const [showSoundTestPanel, setShowSoundTestPanel] = useState(false);

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
                  onClick={() => {
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
                  onClick={() => startGame('ai', 'medium')}
                >
                  <div className="mode-content">
                    <span>🪄 Player vs AI - Medium</span>
                    <Badge variant="secondary">Intermediate</Badge>
                  </div>
                </Button>
                
                <Button
                  className="medieval-btn mode-button"
                  onClick={() => startGame('ai', 'hard')}
                >
                  <div className="mode-content">
                    <span>🏰 Player vs AI - Hard</span>
                    <Badge variant="secondary">Expert</Badge>
                  </div>
                </Button>
                
                <Button
                  className="medieval-btn mode-button"
                  onClick={() => startGame('ai-vs-ai', 'hard')}
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

                <OnlineMultiplayerDialog>
                  <Button className="medieval-btn mode-button">
                    <div className="mode-content">
                      <span>🌐 Online Multiplayer</span>
                      <Badge variant="secondary">Player vs Player</Badge>
                    </div>
                  </Button>
                </OnlineMultiplayerDialog>

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

                {isAdminFeatureEnabled('debug') && (
                  <Button
                    className="medieval-btn mode-button"
                    variant="outline"
                    onClick={() => {
                      console.log('🧪 Running functionality verification...');
                      try {
                        runDebugVerification();
                        // Show results dialog after verification completes
                        setTimeout(() => {
                          setDebugResults({
                            completed: true,
                            message: 'Debug verification completed successfully!',
                            details: 'All core systems tested and verified. Check console for detailed results.',
                            nextStep: 'System ready for mass AI training. Click "Mass AI Training" to begin 10000-game session.'
                          });
                          setShowDebugDialog(true);
                        }, 2000); // Give verification time to complete
                      } catch (error) {
                        console.error('❌ Debug verification failed:', error);
                        setDebugResults({
                          completed: false,
                          message: 'Debug verification encountered issues',
                          details: `Error: ${error}`,
                          nextStep: 'Check console for details and try again.'
                        });
                        setShowDebugDialog(true);
                      }
                    }}
                  >
                    <div className="mode-content">
                      <span>🧪 Debug & Verify System</span>
                      <Badge variant="secondary">Test All</Badge>
                    </div>
                  </Button>
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
                  onClick={() => startGame('local')}
                >
                  <div className="mode-content">
                    <span>👥 Local Multiplayer</span>
                    <Badge variant="outline">Pass & Play</Badge>
                  </div>
                </Button>
                
                {/* Magical Sound Test Panel */}
                <Button
                  className="medieval-btn mode-button"
                  variant="outline"
                  onClick={() => setShowSoundTestPanel(true)}
                >
                  <div className="mode-content">
                    <span>🎵 Test Magical Sounds</span>
                    <Badge variant="outline">43 Fantasy Audio Effects</Badge>
                  </div>
                </Button>

                {/* Immersive 3D Audio Test Panel */}
                {onAudioTest && (
                  <Button
                    className="medieval-btn mode-button"
                    variant="outline"
                    onClick={onAudioTest}
                  >
                    <div className="mode-content">
                      <span>🎭 Test 3D Spatial Audio</span>
                      <Badge variant="outline">Web Audio API + 3D Chess Sounds</Badge>
                    </div>
                  </Button>
                )}
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
            onClick={onSettings}
            className="medieval-btn"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          
          <Button
            variant="outline"
            onClick={onAchievements}
            className="medieval-btn"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Achievements
          </Button>
          
          <Button
            variant="outline"
            onClick={onCollection}
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
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
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
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-100 rounded">
                    <span className="font-medium">Total Games Analyzed:</span>
                    <span className="font-bold text-lg">{learningStats.totalGamesAnalyzed}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-100 rounded">
                    <span className="font-medium">Recent Games (last 100):</span>
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
                  
                  <div className="flex justify-between items-center p-3 bg-slate-100 rounded">
                    <span className="font-medium">Win Rate vs Human:</span>
                    <span className="font-bold text-lg">{Math.round(learningStats.winRateVsHuman)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-100 rounded">
                    <span className="font-medium">Win Rate vs AI:</span>
                    <span className="font-bold text-lg">{Math.round(learningStats.winRateVsAI)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-100 rounded">
                    <span className="font-medium">Move Patterns:</span>
                    <span className="font-bold text-lg">{learningStats.movePatterns}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-100 rounded">
                    <span className="font-medium">Position Patterns:</span>
                    <span className="font-bold text-lg">{learningStats.positionalPatterns}</span>
                  </div>
                </div>

                {learningStats.preferredStrategies && learningStats.preferredStrategies.length > 0 && (
                  <div className="mt-4">
                    <div className="font-medium mb-2">Preferred Strategies:</div>
                    <div className="flex flex-wrap gap-2">
                      {learningStats.preferredStrategies.map((strategy: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
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
                      console.log('Debug - Raw stats:', stats);
                    }}
                  >
                    Debug: Reload Stats
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
        </Dialog>
      )}

      {/* Debug Verification Results Dialog - Admin Only */}
      {isAdminFeatureEnabled('debug') && (
        <Dialog open={showDebugDialog} onOpenChange={setShowDebugDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Debug Verification Results
            </DialogTitle>
          </DialogHeader>
          
          {/* Navigation button at top */}
          <div className="flex gap-2 mb-4 pb-4 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebugDialog(false)}
              className="medieval-btn"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          </div>
          
          {debugResults && (
            <div className="space-y-4 p-4">
              <div className={`text-lg font-semibold ${debugResults.completed ? 'text-green-600' : 'text-orange-600'}`}>
                {debugResults.completed ? '✅ Verification Complete' : '⚠️ Verification Issues'}
              </div>
              
              <div className="p-4 bg-slate-100 rounded">
                <p className="font-medium mb-2">{debugResults.message}</p>
                <p className="text-sm text-gray-600">{debugResults.details}</p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="font-medium text-blue-800 mb-1">Next Steps:</p>
                <p className="text-sm text-blue-700">{debugResults.nextStep}</p>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDebugDialog(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                {debugResults.completed && (
                  <Button 
                    onClick={() => {
                      setShowDebugDialog(false);
                      console.log('🚀 Ready for mass training - use Mass AI Training button');
                    }}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
        </Dialog>
      )}
      
      {/* Magical Sound Test Panel Dialog */}
      {showSoundTestPanel && (
        <Dialog open={showSoundTestPanel} onOpenChange={setShowSoundTestPanel}>
          <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Magical Sound Test Panel
              </DialogTitle>
              <DialogClose />
            </DialogHeader>
            
            {/* Navigation button */}
            <div className="flex gap-2 mb-4 pb-4 border-b">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSoundTestPanel(false)}
                className="medieval-btn"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
            </div>
            
            <div className="pr-2">
              <MagicalSoundTestPanel />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
