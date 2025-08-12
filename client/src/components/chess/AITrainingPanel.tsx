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
  const [statusMessage, setStatusMessage] = useState<string>('');

  const runTraining = useCallback(async (gameCount: number) => {
    setIsTraining(true);
    setProgress(null);
    setResults(null);
    setStatusMessage(`🚀 Starting ${gameCount.toLocaleString()} game training session...`);

    // Show initial progress immediately
    setProgress({
      gamesCompleted: 0,
      totalGames: gameCount,
      currentWinRate: { white: 0, black: 0, draw: 0 },
      avgGameLength: 0,
      strategiesLearned: 0
    });

    // Add a small delay to show the UI has responded
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const trainingResults = await massTraining.runMassTraining(
        gameCount,
        (progressUpdate) => {
          setProgress(progressUpdate);
          // Update status message with estimated time
          const percentComplete = (progressUpdate.gamesCompleted / progressUpdate.totalGames) * 100;
          const gamesPerSecond = progressUpdate.gamesCompleted > 0 ? progressUpdate.gamesCompleted / 10 : 0;
          const remainingGames = progressUpdate.totalGames - progressUpdate.gamesCompleted;
          const estimatedSeconds = gamesPerSecond > 0 ? remainingGames / gamesPerSecond : 0;
          const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
          
          if (progressUpdate.gamesCompleted % 100 === 0) {
            setStatusMessage(`🎮 Training in progress... ${percentComplete.toFixed(1)}% complete. Est. ${estimatedMinutes} min remaining.`);
          }
        }
      );
      setResults(trainingResults);
      setStatusMessage(`✅ Training complete! ${gameCount.toLocaleString()} games finished.`);
    } catch (error) {
      setStatusMessage(`❌ Training failed: ${error}`);
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

        {/* Status Message */}
        {statusMessage && (
          <div className={`p-3 rounded-lg text-sm font-semibold ${
            statusMessage.includes('✅') ? 'bg-green-100 text-green-800' :
            statusMessage.includes('❌') ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {statusMessage}
          </div>
        )}

        {!isTraining && !results && (
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => runTraining(100)}
              className="medieval-btn"
              disabled={isTraining}
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Train (100 games)
            </Button>
            <Button 
              onClick={() => runTraining(1000)}
              className="medieval-btn"
              disabled={isTraining}
            >
              <Brain className="w-4 h-4 mr-2" />
              Standard (1,000 games)
            </Button>
            <Button 
              onClick={() => runTraining(10000)}
              className="medieval-btn"
              variant="outline"
              disabled={isTraining}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Intensive (10,000 games)
            </Button>
            <Button 
              onClick={() => runTraining(50000)}
              className="medieval-btn bg-purple-600 hover:bg-purple-700"
              disabled={isTraining}
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
              <div>White Wins: {results.whiteWins} ({((results.whiteWins / results.totalGames) * 100).toFixed(1)}%)</div>
              <div>Black Wins: {results.blackWins} ({((results.blackWins / results.totalGames) * 100).toFixed(1)}%)</div>
              <div>Draws: {results.draws} ({((results.draws / results.totalGames) * 100).toFixed(1)}%)</div>
              <div>Strategies: {results.strategiesLearned}</div>
            </div>
            
            {/* Win rate analysis */}
            <div className="mt-2 p-2 bg-amber-50 rounded text-xs">
              <div className="font-semibold mb-1">Training Quality Analysis:</div>
              {results.draws / results.totalGames > 0.8 && (
                <div className="text-amber-700">⚠️ High draw rate ({((results.draws / results.totalGames) * 100).toFixed(1)}%) - Games may be ending too early</div>
              )}
              {Math.abs(results.whiteWins - results.blackWins) / results.totalGames > 0.2 && (
                <div className="text-amber-700">⚠️ Color imbalance detected - White: {((results.whiteWins / results.totalGames) * 100).toFixed(1)}% vs Black: {((results.blackWins / results.totalGames) * 100).toFixed(1)}%</div>
              )}
              {results.draws / results.totalGames < 0.8 && Math.abs(results.whiteWins - results.blackWins) / results.totalGames < 0.2 && (
                <div className="text-green-700">✓ Balanced training results - AI learning effectively</div>
              )}
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