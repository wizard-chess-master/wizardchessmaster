import React, { useState, useEffect } from 'react';
import { ChessBoard } from './ChessBoard';
import { GameState, ChessMove, AIDifficulty } from '../../lib/chess/types';
import { createInitialBoard, makeMove } from '../../lib/chess/gameEngine';
import { getAIMove } from '../../lib/chess/aiPlayer';
import { useChess } from '../../lib/stores/useChess';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Play, Pause, Square, FastForward, RotateCcw, Home } from 'lucide-react';

interface TrainingViewerProps {
  onBack: () => void;
}

interface TrainingStats {
  gameNumber: number;
  totalGames: number;
  whiteWins: number;
  blackWins: number;
  draws: number;
  currentGameMoves: number;
  isPlaying: boolean;
  isPaused: boolean;
  speed: number;
}

export function TrainingViewer({ onBack }: TrainingViewerProps) {
  const { startGame } = useChess();

  const [stats, setStats] = useState<TrainingStats>({
    gameNumber: 1,
    totalGames: 25,
    whiteWins: 0,
    blackWins: 0,
    draws: 0,
    currentGameMoves: 0,
    isPlaying: false,
    isPaused: false,
    speed: 1000 // milliseconds between moves
  });

  const [moveTimeout, setMoveTimeout] = useState<NodeJS.Timeout | null>(null);

  const resetGame = () => {
    startGame('ai-vs-ai', 'hard');
    setStats(prev => ({ ...prev, currentGameMoves: 0 }));
  };

  const nextGame = () => {
    if (stats.gameNumber >= stats.totalGames) {
      console.log('🏆 Training session completed!');
      setStats(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    // Update stats based on current game result
    const currentGameState = useChess.getState();
    setStats(prev => {
      const newStats = { ...prev };
      if (currentGameState.winner === 'white') newStats.whiteWins++;
      else if (currentGameState.winner === 'black') newStats.blackWins++;
      else newStats.draws++;
      
      newStats.gameNumber++;
      return newStats;
    });

    resetGame();
  };

  const makeNextMove = async () => {
    const currentGameState = useChess.getState();
    if (currentGameState.gamePhase !== 'playing' || stats.isPaused) return;

    const aiMove = getAIMove(currentGameState);
    if (!aiMove) {
      // No moves available - end game
      console.log(`Game ${stats.gameNumber} ended - no moves available`);
      setTimeout(nextGame, 2000);
      return;
    }

    // Make the move through the chess store
    const { makeAIVsAIMove } = useChess.getState();
    makeAIVsAIMove();
    
    setStats(prev => ({ ...prev, currentGameMoves: prev.currentGameMoves + 1 }));

    // Check if game ended
    const updatedGameState = useChess.getState();
    if (updatedGameState.gamePhase === 'ended' || updatedGameState.winner) {
      console.log(`Game ${stats.gameNumber} ended - Winner: ${updatedGameState.winner || 'Draw'}`);
      setTimeout(nextGame, 2000);
      return;
    }

    // Check for max moves (prevent infinite games)
    if (stats.currentGameMoves >= 100) {
      console.log(`Game ${stats.gameNumber} ended - Max moves reached`);
      setTimeout(nextGame, 2000);
      return;
    }

    // Schedule next move
    if (stats.isPlaying && !stats.isPaused) {
      const timeout = setTimeout(makeNextMove, stats.speed);
      setMoveTimeout(timeout);
    }
  };

  const startTraining = () => {
    setStats(prev => ({ ...prev, isPlaying: true, isPaused: false }));
    resetGame();
  };

  const pauseTraining = () => {
    setStats(prev => ({ ...prev, isPaused: !prev.isPaused }));
    if (moveTimeout) {
      clearTimeout(moveTimeout);
      setMoveTimeout(null);
    }
  };

  const stopTraining = () => {
    setStats(prev => ({ ...prev, isPlaying: false, isPaused: false }));
    if (moveTimeout) {
      clearTimeout(moveTimeout);
      setMoveTimeout(null);
    }
  };

  const changeSpeed = (newSpeed: number) => {
    setStats(prev => ({ ...prev, speed: newSpeed }));
  };

  // Start making moves when training begins
  useEffect(() => {
    const currentGameState = useChess.getState();
    if (stats.isPlaying && !stats.isPaused && currentGameState.gamePhase === 'playing') {
      const timeout = setTimeout(makeNextMove, stats.speed);
      setMoveTimeout(timeout);
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [stats.isPlaying, stats.isPaused, stats.speed]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (moveTimeout) clearTimeout(moveTimeout);
    };
  }, [moveTimeout]);

  return (
    <div className="training-viewer">
      <div className="training-header">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>AI Training Session</span>
              <Button variant="outline" onClick={onBack}>
                <Home className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="training-stats grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="stat-item">
                <span className="stat-label">Game</span>
                <Badge variant="outline">
                  {stats.gameNumber} / {stats.totalGames}
                </Badge>
              </div>
              <div className="stat-item">
                <span className="stat-label">Moves</span>
                <Badge variant="outline">{stats.currentGameMoves}</Badge>
              </div>
              <div className="stat-item">
                <span className="stat-label">White Wins</span>
                <Badge variant="secondary">{stats.whiteWins}</Badge>
              </div>
              <div className="stat-item">
                <span className="stat-label">Black Wins</span>
                <Badge variant="secondary">{stats.blackWins}</Badge>
              </div>
            </div>

            <div className="training-controls flex gap-2 mb-4">
              {!stats.isPlaying ? (
                <Button onClick={startTraining}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Training
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={pauseTraining}>
                    {stats.isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                    {stats.isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button variant="destructive" onClick={stopTraining}>
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </>
              )}
              
              <Button variant="outline" onClick={resetGame}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Game
              </Button>
            </div>

            <div className="speed-controls mb-4">
              <span className="text-sm font-medium mr-3">Speed:</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={stats.speed === 2000 ? "default" : "outline"}
                  onClick={() => changeSpeed(2000)}
                >
                  Slow
                </Button>
                <Button
                  size="sm"
                  variant={stats.speed === 1000 ? "default" : "outline"}
                  onClick={() => changeSpeed(1000)}
                >
                  Normal
                </Button>
                <Button
                  size="sm"
                  variant={stats.speed === 500 ? "default" : "outline"}
                  onClick={() => changeSpeed(500)}
                >
                  Fast
                </Button>
                <Button
                  size="sm"
                  variant={stats.speed === 100 ? "default" : "outline"}
                  onClick={() => changeSpeed(100)}
                >
                  <FastForward className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <GameInfo />
          </CardContent>
        </Card>
      </div>

      <div className="game-container">
        <ChessBoard />
      </div>
    </div>
  );
}

function GameInfo() {
  const { currentPlayer, winner, isStalemate } = useChess();
  
  return (
    <div className="game-info mb-4">
      <p className="text-sm text-muted-foreground">
        Current Player: <Badge variant={currentPlayer === 'white' ? 'default' : 'secondary'}>
          {currentPlayer === 'white' ? 'White' : 'Black'}
        </Badge>
      </p>
      {winner && (
        <p className="text-sm font-medium">
          Winner: <Badge>{winner === 'white' ? 'White' : 'Black'}</Badge>
        </p>
      )}
      {isStalemate && (
        <p className="text-sm font-medium">
          <Badge variant="outline">Stalemate - Draw</Badge>
        </p>
      )}
    </div>
  );
}