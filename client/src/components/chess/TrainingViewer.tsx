import React, { useState, useEffect, useRef } from 'react';
import { ChessBoard } from './ChessBoard';
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
  const { startGame, makeAIVsAIMove, gamePhase, winner, currentPlayer, moveHistory } = useChess();

  const [stats, setStats] = useState<TrainingStats>({
    gameNumber: 1,
    totalGames: 10,
    whiteWins: 0,
    blackWins: 0,
    draws: 0,
    currentGameMoves: 0,
    isPlaying: false,
    isPaused: false,
    speed: 1500
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start first game when component mounts
    startGame('ai-vs-ai', 'hard');
  }, []);

  useEffect(() => {
    // Check if game ended and update stats
    if (gamePhase === 'ended' && stats.isPlaying) {
      setTimeout(() => {
        setStats(prev => {
          const newStats = { ...prev };
          if (winner === 'white') newStats.whiteWins++;
          else if (winner === 'black') newStats.blackWins++;
          else newStats.draws++;

          if (newStats.gameNumber < newStats.totalGames) {
            newStats.gameNumber++;
            newStats.currentGameMoves = 0;
            // Start next game
            setTimeout(() => startGame('ai-vs-ai', 'hard'), 1000);
          } else {
            // Training complete
            newStats.isPlaying = false;
            console.log('🎓 Visual training session completed!');
          }
          
          return newStats;
        });
      }, 1500);
    }
  }, [gamePhase, winner, stats.isPlaying]);

  useEffect(() => {
    // Clear existing interval when speed changes
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (stats.isPlaying && !stats.isPaused && gamePhase === 'playing') {
      console.log(`Setting interval with speed: ${stats.speed}ms`);
      intervalRef.current = setInterval(() => {
        makeAIVsAIMove();
        setStats(prev => ({ ...prev, currentGameMoves: prev.currentGameMoves + 1 }));
        
        // Prevent infinite games
        if (stats.currentGameMoves > 60) {
          const pieces = useChess.getState().board.flat().filter(p => p !== null);
          const whitePieces = pieces.filter(p => p!.color === 'white');
          const blackPieces = pieces.filter(p => p!.color === 'black');
          const winner = whitePieces.length > blackPieces.length ? 'white' : 'black';
          
          // Force end game
          useChess.setState(state => ({ 
            ...state, 
            gamePhase: 'ended', 
            winner 
          }));
        }
      }, stats.speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [stats.isPlaying, stats.isPaused, stats.speed, gamePhase]);

  const startTraining = () => {
    setStats(prev => ({ ...prev, isPlaying: true, isPaused: false }));
    if (gamePhase !== 'playing') {
      startGame('ai-vs-ai', 'hard');
    }
  };

  const pauseTraining = () => {
    setStats(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const stopTraining = () => {
    setStats(prev => ({ 
      ...prev, 
      isPlaying: false, 
      isPaused: false,
      gameNumber: 1,
      whiteWins: 0,
      blackWins: 0,
      draws: 0,
      currentGameMoves: 0
    }));
    startGame('ai-vs-ai', 'hard');
  };

  const changeSpeed = () => {
    setStats(prev => {
      const speeds = [3000, 1500, 800, 300]; // Slow, Normal, Fast, Ultra-Fast
      const currentIndex = speeds.indexOf(prev.speed);
      const nextIndex = (currentIndex + 1) % speeds.length;
      const newSpeed = speeds[nextIndex];
      
      console.log(`Speed changed from ${prev.speed}ms to ${newSpeed}ms`);
      
      return { ...prev, speed: newSpeed };
    });
  };

  const getSpeedLabel = () => {
    switch (stats.speed) {
      case 3000: return 'Slow';
      case 1500: return 'Normal';
      case 800: return 'Fast';
      case 300: return 'Ultra-Fast';
      default: return 'Normal';
    }
  };

  return (
    <div className="training-viewer">
      <div className="training-container">
        
        {/* Header */}
        <Card className="training-header">
          <CardHeader>
            <div className="header-content">
              <CardTitle>AI Training Viewer</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Menu
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="training-controls">
              {!stats.isPlaying ? (
                <Button onClick={startTraining}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Training
                </Button>
              ) : (
                <Button onClick={pauseTraining}>
                  <Pause className="w-4 h-4 mr-2" />
                  {stats.isPaused ? 'Resume' : 'Pause'}
                </Button>
              )}
              
              <Button variant="outline" onClick={stopTraining}>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
              
              <Button variant="outline" onClick={changeSpeed}>
                <FastForward className="w-4 h-4 mr-2" />
                <span>Speed: <Badge variant="secondary">{getSpeedLabel()}</Badge></span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Game Board */}
        <div className="training-board">
          <ChessBoard />
        </div>

        {/* Stats */}
        <Card className="training-stats">
          <CardHeader>
            <CardTitle>Training Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Game:</span>
                <Badge variant="outline">
                  {stats.gameNumber} / {stats.totalGames}
                </Badge>
              </div>
              <div className="stat-item">
                <span className="stat-label">Current Player:</span>
                <Badge variant={currentPlayer === 'white' ? 'default' : 'secondary'}>
                  {currentPlayer}
                </Badge>
              </div>
              <div className="stat-item">
                <span className="stat-label">Moves:</span>
                <Badge variant="outline">{stats.currentGameMoves}</Badge>
              </div>
              <div className="stat-item">
                <span className="stat-label">Speed:</span>
                <Badge variant="outline">{getSpeedLabel()} ({stats.speed}ms)</Badge>
              </div>
              <div className="stat-item">
                <span className="stat-label">White Wins:</span>
                <Badge variant="outline">{stats.whiteWins}</Badge>
              </div>
              <div className="stat-item">
                <span className="stat-label">Black Wins:</span>
                <Badge variant="outline">{stats.blackWins}</Badge>
              </div>
              <div className="stat-item">
                <span className="stat-label">Draws:</span>
                <Badge variant="outline">{stats.draws}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}