import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { massTraining, TrainingProgress } from '../../lib/chess/massTraining';
import { Brain, Zap, TrendingUp } from 'lucide-react';

export function AITrainingPanel() {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [results, setResults] = useState<any>(null);

  const runTraining = useCallback(async (gameCount: number) => {
    console.log(`🚀 Starting training with ${gameCount} games...`);
    setIsTraining(true);
    setProgress(null);
    setResults(null);

    // Show initial progress immediately
    setProgress({
      gamesCompleted: 0,
      totalGames: gameCount,
      currentWinRate: { white: 0, black: 0, draw: 0 },
      avgGameLength: 0,
      strategiesLearned: 0
    });

    try {
      const trainingResults = await massTraining.runMassTraining(
        gameCount,
        (progressUpdate) => {
          console.log(`📊 Progress: ${progressUpdate.gamesCompleted}/${progressUpdate.totalGames}`);
          setProgress(progressUpdate);
        }
      );
      setResults(trainingResults);
      console.log('🎯 Training completed:', trainingResults);
      alert(`✅ Training complete! Trained ${gameCount} games successfully.`);
    } catch (error) {
      console.error('❌ Training failed:', error);
      alert(`❌ Training failed: ${error}`);
    } finally {
      setIsTraining(false);
    }
  }, []);

  const progressPercent = progress 
    ? (progress.gamesCompleted / progress.totalGames) * 100 
    : 0;

  return (
    <Card className="medieval-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Training Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Train the AI by having it play against itself. More games = smarter AI!
        </div>

        {!isTraining && !results && (
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => runTraining(100)}
              className="medieval-btn"
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Train (100 games)
            </Button>
            <Button 
              onClick={() => runTraining(1000)}
              className="medieval-btn"
            >
              <Brain className="w-4 h-4 mr-2" />
              Standard (1,000 games)
            </Button>
            <Button 
              onClick={() => runTraining(10000)}
              className="medieval-btn"
              variant="outline"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Intensive (10,000 games)
            </Button>
            <Button 
              onClick={() => runTraining(50000)}
              className="medieval-btn bg-purple-600 hover:bg-purple-700"
            >
              <Brain className="w-4 h-4 mr-2" />
              Master Training (50,000 games)
            </Button>
          </div>
        )}

        {isTraining && progress && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Training Progress</span>
              <span>{progress.gamesCompleted} / {progress.totalGames}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold">White Wins</div>
                <div>{(progress.currentWinRate.white * 100).toFixed(1)}%</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Black Wins</div>
                <div>{(progress.currentWinRate.black * 100).toFixed(1)}%</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Draws</div>
                <div>{(progress.currentWinRate.draw * 100).toFixed(1)}%</div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Avg game length: {Math.round(progress.avgGameLength)} moves
              • Strategies learned: {progress.strategiesLearned}
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-3 p-3 bg-green-50 rounded-lg">
            <div className="text-sm font-semibold text-green-800">
              ✅ Training Complete!
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Total Games: {results.totalGames}</div>
              <div>Time: {(results.completionTime / 1000 / 60).toFixed(1)} min</div>
              <div>White Wins: {results.whiteWins}</div>
              <div>Black Wins: {results.blackWins}</div>
              <div>Draws: {results.draws}</div>
              <div>Strategies: {results.strategiesLearned}</div>
            </div>
            <div className="text-xs text-green-700">
              AI has been improved! The learning has been saved.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}