import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Brain, Zap, Download, Upload, RotateCcw, Play, Pause, Square } from 'lucide-react';
import { massTraining } from '../../lib/chess/massTraining';
import { advancedAI } from '../../lib/chess/advancedAI';

interface TrainingProgress {
  gamesCompleted: number;
  totalGames: number;
  currentWinRate: {
    white: number;
    black: number;
    draw: number;
  };
  avgGameLength: number;
  strategiesLearned: number;
}

export function MassTrainingDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [trainingResults, setTrainingResults] = useState<any>(null);
  const [gameCount, setGameCount] = useState(1000);
  const abortRef = useRef<boolean>(false);

  const handleStartTraining = async () => {
    console.log('🚀 Starting mass training with', gameCount, 'games...');
    setIsTraining(true);
    setProgress(null);
    setTrainingResults(null);
    abortRef.current = false;

    try {
      console.log('📊 Mass training object check:', massTraining);
      console.log('📊 runMassTraining method exists:', typeof massTraining.runMassTraining);
      
      if (!massTraining.runMassTraining) {
        throw new Error('runMassTraining method not found on massTraining object');
      }
      
      const results = await massTraining.runMassTraining(gameCount, (progressData) => {
        if (abortRef.current) return;
        console.log('📈 Training progress update:', progressData);
        setProgress(progressData);
      });
      
      if (!abortRef.current) {
        console.log('✅ Training completed, results:', results);
        setTrainingResults(results);
      }
    } catch (error) {
      console.error('❌ Training failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Training failed: ${errorMessage}`);
    } finally {
      setIsTraining(false);
    }
  };

  const handleStopTraining = () => {
    abortRef.current = true;
    setIsTraining(false);
  };

  const handleResetTraining = () => {
    massTraining.resetTrainingData();
    setProgress(null);
    setTrainingResults(null);
  };

  const handleExportData = () => {
    const data = massTraining.exportTrainingData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fantasy-chess-training-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (massTraining.importTrainingData(content)) {
          alert('Training data imported successfully!');
        } else {
          alert('Failed to import training data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const trainingStats = massTraining.getTrainingStats();
  const strategyPatterns = massTraining.getStrategyPatterns();
  const neuralWeights = advancedAI.getNeuralWeights();

  const progressPercentage = progress ? (progress.gamesCompleted / progress.totalGames) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mode-button gap-2">
          <div className="mode-content">
            <Brain className="w-4 h-4" />
            <span>Mass AI Training</span>
            <Badge variant="secondary">Neural Network</Badge>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="mass-training-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Advanced AI Training System
          </DialogTitle>
          <p id="mass-training-description" className="sr-only">
            Advanced AI training system for running thousands of self-play games with neural network learning and strategy pattern recognition.
          </p>
        </DialogHeader>

        <Tabs defaultValue="training" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="neural">Neural Network</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mass Training Configuration</CardTitle>
                <CardDescription>
                  Train AI using minimax with alpha-beta pruning across thousands of self-play games
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <label htmlFor="gameCount" className="text-sm font-medium">
                    Number of Games:
                  </label>
                  <input
                    id="gameCount"
                    type="number"
                    min="10"
                    max="10000"
                    value={gameCount || 1000}
                    onChange={(e) => setGameCount(parseInt(e.target.value) || 1000)}
                    className="px-3 py-1 border rounded-md w-24"
                    disabled={isTraining}
                  />
                </div>

                <div className="flex gap-2">
                  {!isTraining ? (
                    <Button onClick={handleStartTraining} className="gap-2">
                      <Play className="w-4 h-4" />
                      Start Training
                    </Button>
                  ) : (
                    <Button onClick={handleStopTraining} variant="destructive" className="gap-2">
                      <Square className="w-4 h-4" />
                      Stop Training
                    </Button>
                  )}
                  
                  <Button 
                    onClick={async () => {
                      console.log('🧪 Testing single game training...');
                      try {
                        setIsTraining(true);
                        const result = await massTraining.runMassTraining(1, (progress) => {
                          console.log('📈 Test progress:', progress);
                        });
                        console.log('✅ Single game test completed:', result);
                        alert(`Test completed! Winner: ${result.whiteWins > 0 ? 'White' : result.blackWins > 0 ? 'Black' : 'Draw'}, Game length: ${result.avgGameLength} moves`);
                      } catch (error) {
                        console.error('❌ Test failed:', error);
                        alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      } finally {
                        setIsTraining(false);
                      }
                    }}
                    variant="secondary" 
                    className="gap-2"
                    disabled={isTraining}
                  >
                    <Zap className="w-4 h-4" />
                    Test 1 Game
                  </Button>
                  
                  <Button onClick={handleResetTraining} variant="outline" className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reset All Data
                  </Button>
                </div>

                {isTraining && progress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {progress.gamesCompleted} / {progress.totalGames}</span>
                      <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="w-full" />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div>Win Rates:</div>
                        <div className="ml-2">
                          White: {(progress.currentWinRate.white * 100).toFixed(1)}%
                        </div>
                        <div className="ml-2">
                          Black: {(progress.currentWinRate.black * 100).toFixed(1)}%
                        </div>
                        <div className="ml-2">
                          Draw: {(progress.currentWinRate.draw * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div>Statistics:</div>
                        <div className="ml-2">
                          Avg Game Length: {progress.avgGameLength.toFixed(1)}
                        </div>
                        <div className="ml-2">
                          Strategies Learned: {progress.strategiesLearned}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {trainingResults && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Training Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Game Results:</div>
                          <div className="ml-2">White Wins: {trainingResults.whiteWins}</div>
                          <div className="ml-2">Black Wins: {trainingResults.blackWins}</div>
                          <div className="ml-2">Draws: {trainingResults.draws}</div>
                        </div>
                        <div>
                          <div className="font-medium">Performance:</div>
                          <div className="ml-2">Avg Game Length: {trainingResults.avgGameLength.toFixed(1)}</div>
                          <div className="ml-2">Strategies Learned: {trainingResults.strategiesLearned}</div>
                          <div className="ml-2">Time: {(trainingResults.completionTime / 1000).toFixed(1)}s</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Training Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Total Training Games:</div>
                    <div className="text-2xl font-bold">{trainingStats.totalTrainingGames}</div>
                  </div>
                  <div>
                    <div className="font-medium">Total Training Time:</div>
                    <div className="text-2xl font-bold">
                      {(trainingStats.totalTrainingTime / 1000 / 60).toFixed(1)}m
                    </div>
                  </div>
                </div>
                {trainingStats.lastTrainingDate && (
                  <div className="mt-2 text-sm text-gray-600">
                    Last Training: {new Date(trainingStats.lastTrainingDate).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="neural" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Neural Network Weights</CardTitle>
                <CardDescription>
                  Current weights used by the advanced AI for position evaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Material Weight:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(neuralWeights.materialWeight / 2) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono">{neuralWeights.materialWeight.toFixed(3)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Position Weight:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(neuralWeights.positionWeight / 2) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono">{neuralWeights.positionWeight.toFixed(3)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>King Safety Weight:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(neuralWeights.kingSafetyWeight / 2) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono">{neuralWeights.kingSafetyWeight.toFixed(3)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Mobility Weight:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${(neuralWeights.mobilityWeight / 2) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono">{neuralWeights.mobilityWeight.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
                  <div className="font-medium mb-1">Learning Progress:</div>
                  <div>These weights are automatically adjusted based on game outcomes and AI performance patterns.</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Learned Strategy Patterns</CardTitle>
                <CardDescription>
                  AI-discovered strategies from self-play training
                </CardDescription>
              </CardHeader>
              <CardContent>
                {strategyPatterns.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No strategy patterns learned yet. Run training to discover strategies.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {strategyPatterns.map((pattern, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium capitalize">
                            {pattern.name.replace(/-/g, ' ')}
                          </span>
                          <div className="flex gap-2">
                            <Badge variant="secondary">
                              {pattern.frequency} uses
                            </Badge>
                            <Badge 
                              variant={pattern.successRate > 0.6 ? "default" : pattern.successRate > 0.4 ? "secondary" : "destructive"}
                            >
                              {(pattern.successRate * 100).toFixed(1)}% success
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Average game length: {pattern.avgGameLength.toFixed(1)} moves
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Export, import, and manage training data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleExportData} className="gap-2">
                    <Download className="w-4 h-4" />
                    Export Training Data
                  </Button>
                  
                  <Button asChild variant="outline" className="gap-2">
                    <label htmlFor="importFile" className="cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Import Training Data
                    </label>
                  </Button>
                  <input
                    id="importFile"
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </div>
                
                <div className="p-3 bg-blue-50 rounded-md text-sm">
                  <div className="font-medium mb-1">Data Format:</div>
                  <div>Training data is exported as JSON containing neural network weights, strategy patterns, game statistics, and recent game logs for analysis and sharing.</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}