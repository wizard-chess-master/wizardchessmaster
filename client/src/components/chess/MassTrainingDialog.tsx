import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Brain, Play, Square, Zap, RotateCcw } from 'lucide-react';
import { massTraining } from '../../lib/chess/massTraining';

interface MassTrainingDialogProps {
  children: React.ReactNode;
}

export const MassTrainingDialog: React.FC<MassTrainingDialogProps> = ({ children }) => {
  const [gameCount, setGameCount] = useState(1000);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingResults, setTrainingResults] = useState<any>(null);

  const handleStartTraining = async () => {
    console.log('Starting mass training with', gameCount, 'games');
    try {
      setIsTraining(true);
      setTrainingResults(null);
      
      const result = await massTraining.runMassTraining(gameCount, (progress) => {
        console.log('Training progress:', progress);
      });
      
      console.log('Training completed:', result);
      setTrainingResults(result);
      alert(`Training completed! ${result.whiteWins} white wins, ${result.blackWins} black wins, ${result.draws} draws`);
    } catch (error) {
      console.error('Training failed:', error);
      alert(`Training failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTraining(false);
    }
  };

  const handleTestGame = async () => {
    console.log('Testing single game...');
    try {
      setIsTraining(true);
      
      const result = await massTraining.runMassTraining(1, (progress) => {
        console.log('Test progress:', progress);
      });
      
      console.log('Test completed:', result);
      alert(`Test completed! Winner: ${result.whiteWins > 0 ? 'White' : result.blackWins > 0 ? 'Black' : 'Draw'}`);
    } catch (error) {
      console.error('Test failed:', error);
      alert(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTraining(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all training data? This cannot be undone.')) {
      try {
        massTraining.resetTrainingData();
        setTrainingResults(null);
        alert('Training data reset successfully');
      } catch (error) {
        console.error('Reset failed:', error);
        alert('Reset failed');
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative">
          {children}
          <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs">
            Neural Network
          </Badge>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="mass-training-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Mass AI Training System
          </DialogTitle>
          <p id="mass-training-description" className="sr-only">
            Advanced AI training system for running thousands of self-play games with neural network learning.
          </p>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle>Training Configuration</CardTitle>
            <CardDescription>
              Train AI using minimax with alpha-beta pruning across multiple self-play games
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Game Count Input */}
            <div className="flex items-center gap-4">
              <label htmlFor="gameCount" className="text-sm font-medium">
                Number of Games:
              </label>
              <input
                id="gameCount"
                type="number"
                min="1"
                max="10000"
                value={gameCount}
                onChange={(e) => setGameCount(parseInt(e.target.value) || 1000)}
                className="px-3 py-1 border rounded-md w-24"
                disabled={isTraining}
              />
            </div>

            {/* Debug Info */}
            <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
              Status: {isTraining ? 'Training in progress...' : 'Ready to train'} | Games: {gameCount}
            </div>

            {/* Action Buttons */}
            <div 
              className="flex flex-wrap gap-2 p-4 border border-gray-300 rounded-md bg-gray-50"
              style={{ minHeight: '60px' }}
            >
              <Button 
                onClick={handleStartTraining} 
                className="gap-2" 
                disabled={isTraining}
                size="default"
              >
                <Play className="w-4 h-4" />
                {isTraining ? 'Training...' : 'Start Training'}
              </Button>
              
              <Button 
                onClick={handleTestGame}
                variant="secondary" 
                className="gap-2"
                disabled={isTraining}
                size="default"
              >
                <Zap className="w-4 h-4" />
                Test 1 Game
              </Button>
              
              <Button 
                onClick={handleReset}
                variant="outline" 
                className="gap-2"
                disabled={isTraining}
                size="default"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Data
              </Button>
            </div>

            {/* Training Results */}
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
                      <div className="ml-2">Avg Game Length: {trainingResults.avgGameLength?.toFixed(1) || 'N/A'}</div>
                      <div className="ml-2">Time: {trainingResults.completionTime ? (trainingResults.completionTime / 1000).toFixed(1) + 's' : 'N/A'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};