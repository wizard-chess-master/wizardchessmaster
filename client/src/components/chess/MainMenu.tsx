import React, { useState, useEffect } from 'react';
import { useChess } from '../../lib/stores/useChess';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Settings, Sword, Users, Zap, Brain, Eye, BarChart3, X } from 'lucide-react';
import { aiTrainer } from '../../lib/chess/aiTraining';
import { aiLearning } from '../../lib/chess/aiLearning';

interface MainMenuProps {
  onSettings: () => void;
  onTrainingViewer?: () => void;
}

export function MainMenu({ onSettings, onTrainingViewer }: MainMenuProps) {
  const { startGame } = useChess();
  const [isTraining, setIsTraining] = useState(false);
  const [learningStats, setLearningStats] = useState<any>(null);
  const [showStatsDialog, setShowStatsDialog] = useState(false);

  useEffect(() => {
    // Load learning stats on component mount
    setLearningStats(aiLearning.getLearningStats());
  }, []);

  return (
    <div className="main-menu">
      <div className="menu-container">
        <div className="title-section">
          <h1 className="game-title">
            <Zap className="title-icon" />
            Fantasy Chess
          </h1>
          <p className="game-subtitle">
            10x10 Chess with Magical Wizards
          </p>
        </div>

        <div className="menu-cards">
          {/* Game Modes */}
          <Card className="menu-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sword className="w-5 h-5" />
                Play Game
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="game-mode-buttons">
                <Button
                  className="mode-button"
                  onClick={() => startGame('ai', 'easy')}
                >
                  <div className="mode-content">
                    <span>vs AI - Easy</span>
                    <Badge variant="secondary">Random moves</Badge>
                  </div>
                </Button>
                
                <Button
                  className="mode-button"
                  onClick={() => startGame('ai', 'medium')}
                >
                  <div className="mode-content">
                    <span>vs AI - Medium</span>
                    <Badge variant="secondary">Basic strategy</Badge>
                  </div>
                </Button>
                
                <Button
                  className="mode-button"
                  onClick={() => startGame('ai', 'hard')}
                >
                  <div className="mode-content">
                    <span>vs AI - Hard</span>
                    <Badge variant="secondary">Advanced tactics</Badge>
                  </div>
                </Button>
                
                <Button
                  className="mode-button"
                  onClick={() => startGame('ai-vs-ai', 'hard')}
                >
                  <div className="mode-content">
                    <span>AI vs AI - Advanced</span>
                    <Badge variant="secondary">Strategic Battle</Badge>
                  </div>
                </Button>

                <Button
                  className="mode-button"
                  variant="outline"
                  onClick={async () => {
                    if (isTraining) {
                      aiTrainer.stopTraining();
                      setIsTraining(false);
                      return;
                    }
                    
                    setIsTraining(true);
                    try {
                      console.log('🚀 Starting AI training session...');
                      const trainingStats = await aiTrainer.runTrainingSession(25, 'hard');
                      console.log('📊 Training completed, updating learning stats...');
                      
                      // Refresh learning stats after training
                      const updatedStats = aiLearning.getLearningStats();
                      setLearningStats(updatedStats);
                      console.log('✅ AI learning stats updated:', updatedStats);
                    } catch (error) {
                      console.error('❌ Training error:', error);
                    } finally {
                      setIsTraining(false);
                    }
                  }}
                  disabled={false}
                >
                  <div className="mode-content">
                    <Brain className="w-4 h-4" />
                    <span>{isTraining ? 'Stop Training' : 'Train AI Strategy'}</span>
                    <Badge variant="secondary">{isTraining ? 'Running...' : '25 Games'}</Badge>
                  </div>
                </Button>

                {onTrainingViewer && (
                  <Button
                    className="mode-button"
                    variant="outline"
                    onClick={onTrainingViewer}
                  >
                    <div className="mode-content">
                      <Eye className="w-4 h-4" />
                      <span>Watch AI Training</span>
                      <Badge variant="secondary">Visual Mode</Badge>
                    </div>
                  </Button>
                )}

                <Button
                  className="mode-button"
                  variant="outline"
                  onClick={() => {
                    const stats = aiLearning.getLearningStats();
                    console.log('🧠 Raw AI Learning Statistics:', stats);
                    console.log('🧠 Stats type:', typeof stats);
                    console.log('🧠 Stats keys:', stats ? Object.keys(stats) : 'null');
                    console.log('🧠 totalGamesAnalyzed:', stats?.totalGamesAnalyzed);
                    setLearningStats(stats);
                    setShowStatsDialog(true);
                  }}
                >
                  <div className="mode-content">
                    <BarChart3 className="w-4 h-4" />
                    <span>View AI Learning Stats</span>
                    <Badge variant="secondary">
                      {learningStats?.totalGamesAnalyzed || 0} Games
                    </Badge>
                  </div>
                </Button>
                
                <Button
                  className="mode-button"
                  variant="outline"
                  onClick={() => startGame('local')}
                >
                  <div className="mode-content">
                    <Users className="w-4 h-4" />
                    <span>Local Multiplayer</span>
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
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          
          {/* IAP Placeholder */}
          <Card className="iap-placeholder">
            <CardContent className="pt-4">
              <div className="iap-content">
                <p className="text-sm text-muted-foreground">
                  Premium Features Available
                </p>
                <Button variant="outline" size="sm" disabled>
                  Remove Ads - $2.99
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Learning Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Learning Statistics
            </DialogTitle>
          </DialogHeader>
          
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
                  
                  <div className="flex justify-between items-center p-3 bg-slate-100 rounded">
                    <span className="font-medium">Win Rate vs Human:</span>
                    <span className="font-bold text-lg">{Math.round(learningStats.winRateVsHuman * 100)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-100 rounded">
                    <span className="font-medium">Win Rate vs AI:</span>
                    <span className="font-bold text-lg">{Math.round(learningStats.winRateVsAI * 100)}%</span>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    const stats = aiLearning.getLearningStats();
                    setLearningStats(stats);
                    console.log('Debug - Raw stats:', stats);
                  }}
                >
                  Debug: Reload Stats
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
