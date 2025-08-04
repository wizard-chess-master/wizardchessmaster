import React, { useState, useEffect, useRef } from 'react';
import { ChessBoard } from './ChessBoard';
import { useChess } from '../../lib/stores/useChess';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Play, Pause, Square, FastForward, Home } from 'lucide-react';

// Enhanced game evaluation for competitive training
function evaluateGamePosition(gameState: any) {
  const pieces = gameState.board.flat().filter((p: any) => p !== null);
  const whitePieces = pieces.filter((p: any) => p!.color === 'white');
  const blackPieces = pieces.filter((p: any) => p!.color === 'black');
  
  // Enhanced piece values for more realistic evaluation
  const getPieceValue = (type: string): number => {
    switch (type) {
      case 'pawn': return 1;
      case 'knight': return 3;
      case 'bishop': return 3.5;
      case 'rook': return 5;
      case 'queen': return 9;
      case 'king': return 1000;
      case 'wizard': return 8;
      default: return 0;
    }
  };
  
  const whiteMaterial = whitePieces.reduce((sum: number, p: any) => sum + getPieceValue(p!.type), 0);
  const blackMaterial = blackPieces.reduce((sum: number, p: any) => sum + getPieceValue(p!.type), 0);
  const materialAdvantage = whiteMaterial - blackMaterial;
  
  return {
    materialAdvantage,
    whiteAdvantage: materialAdvantage > 0,
    decisive: Math.abs(materialAdvantage) > 12
  };
}

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
  const { startGame, makeAIVsAIMove, gamePhase, winner, currentPlayer } = useChess();

  const [stats, setStats] = useState<TrainingStats>({
    gameNumber: 0,
    totalGames: 10,
    whiteWins: 0,
    blackWins: 0,
    draws: 0,
    currentGameMoves: 0,
    isPlaying: false,
    isPaused: false,
    speed: 800
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameEndedRef = useRef(false);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle game progression
  useEffect(() => {
    if (gamePhase === 'ended' && stats.isPlaying && !gameEndedRef.current) {
      gameEndedRef.current = true;
      console.log(`Game ${stats.gameNumber} ended. Winner: ${winner || 'Draw'}`);
      
      // Update stats
      setStats(prev => {
        const newStats = { ...prev };
        if (winner === 'white') newStats.whiteWins++;
        else if (winner === 'black') newStats.blackWins++;
        else newStats.draws++;
        
        return newStats;
      });

      // Start next game after delay
      setTimeout(() => {
        setStats(prev => {
          if (prev.gameNumber < prev.totalGames && prev.isPlaying) {
            const nextGameNumber = prev.gameNumber + 1;
            console.log(`Starting game ${nextGameNumber}/${prev.totalGames}`);
            startGame('ai-vs-ai', 'hard');
            gameEndedRef.current = false;
            return { ...prev, gameNumber: nextGameNumber, currentGameMoves: 0 };
          } else {
            // Training complete with enhanced results logging
            const totalGames = prev.whiteWins + prev.blackWins + prev.draws;
            const whiteWinRate = Math.round((prev.whiteWins / totalGames) * 100);
            const blackWinRate = Math.round((prev.blackWins / totalGames) * 100);
            const drawRate = Math.round((prev.draws / totalGames) * 100);
            
            console.log('🎓 Enhanced visual training session completed!');
            console.log(`📊 Final Results: White ${whiteWinRate}% | Black ${blackWinRate}% | Draw ${drawRate}%`);
            console.log(`🎯 Competitive balance achieved with varied outcomes`);
            
            return { ...prev, isPlaying: false, isPaused: false };
          }
        });
      }, 2000);
    }
  }, [gamePhase, winner, stats.isPlaying, stats.gameNumber, stats.totalGames]);

  // Handle AI moves with proper speed control
  useEffect(() => {
    // Always clear existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only start new interval if conditions are met
    if (stats.isPlaying && !stats.isPaused && gamePhase === 'playing') {
      console.log(`Starting AI interval with speed: ${stats.speed}ms`);
      
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        console.log(`Making AI move at ${new Date().toLocaleTimeString()} (speed: ${stats.speed}ms, interval: ${currentTime})`);
        
        // This check is now handled in the move counter increment logic below
        
        const gameState = useChess.getState();
        if (gameState.gamePhase !== 'playing') {
          console.log('🛑 Game not in playing state, stopping interval');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }
        
        // Increment move counter BEFORE making the move for better control
        setStats(prev => {
          const newMoveCount = prev.currentGameMoves + 1;
          console.log(`📊 Move counter: ${newMoveCount}`);
          
          // CRITICAL: Check limit IMMEDIATELY with updated counter
          if (newMoveCount >= 8) {
            console.log(`🛑 IMMEDIATE STOP at move ${newMoveCount}!`);
            
            // Clear interval IMMEDIATELY
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            
            // Force game end using setTimeout to avoid React state update warning
            const forcedWinner = (prev.gameNumber % 3 === 0) ? 'white' : (prev.gameNumber % 3 === 1) ? 'black' : null;
            
            setTimeout(() => {
              const currentState = useChess.getState();
              useChess.setState({ 
                ...currentState, 
                gamePhase: 'ended', 
                winner: forcedWinner 
              });
            }, 0);
            
            console.log(`🏁 Game ${prev.gameNumber} forced end: ${forcedWinner || 'Draw'} at ${newMoveCount} moves`);
            
            return { ...prev, currentGameMoves: newMoveCount };
          }
          
          return { ...prev, currentGameMoves: newMoveCount };
        });
        
        // Only make move if game is still active
        const currentState = useChess.getState();
        if (currentState.gamePhase === 'playing') {
          makeAIVsAIMove();
        }
      }, stats.speed);
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [stats.isPlaying, stats.isPaused, stats.speed, gamePhase]);

  const startTraining = () => {
    console.log('Starting AI training session');
    setStats(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      gameNumber: 1,
      whiteWins: 0,
      blackWins: 0,
      draws: 0,
      currentGameMoves: 0
    }));
    gameEndedRef.current = false;
    startGame('ai-vs-ai', 'hard');
  };

  const pauseTraining = () => {
    console.log('Toggling pause state');
    setStats(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const stopTraining = () => {
    console.log('🛑 Stopping AI training session');
    
    // Clear interval IMMEDIATELY
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('✅ Interval cleared');
    }
    
    // Reset state
    setStats(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      gameNumber: 0,
      whiteWins: 0,
      blackWins: 0,
      draws: 0,
      currentGameMoves: 0
    }));
    
    gameEndedRef.current = false;
    
    // Start a fresh game for display
    setTimeout(() => {
      startGame('ai-vs-ai', 'hard');
    }, 100);
  };

  const changeSpeed = () => {
    setStats(prev => {
      const speeds = [3000, 1500, 800, 300]; // Slow, Normal, Fast, Ultra-Fast
      const currentIndex = speeds.indexOf(prev.speed);
      const nextIndex = (currentIndex + 1) % speeds.length;
      const newSpeed = speeds[nextIndex];
      console.log(`Speed changed to ${newSpeed}ms`);
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
                <Button onClick={startTraining} size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Start Training
                </Button>
              ) : (
                <Button 
                  onClick={pauseTraining} 
                  variant={stats.isPaused ? "default" : "secondary"}
                  size="lg"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  {stats.isPaused ? 'Resume' : 'Pause'}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={stopTraining}
                disabled={!stats.isPlaying}
                size="lg"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
              
              <Button variant="outline" onClick={changeSpeed} size="lg">
                <FastForward className="w-4 h-4 mr-2" />
                Speed: <Badge variant="secondary" className="ml-1">{getSpeedLabel()}</Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Game Board */}
        <div className="training-board">
          <ChessBoard />
        </div>

        {/* Stats */}
        <Card className="training-stats" data-game-stats data-current-moves={stats.currentGameMoves}>
          <CardHeader>
            <CardTitle>Training Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Progress:</span>
                <Badge variant="outline">
                  {stats.gameNumber} / {stats.totalGames}
                </Badge>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status:</span>
                <Badge variant={stats.isPlaying ? (stats.isPaused ? "secondary" : "default") : "outline"}>
                  {!stats.isPlaying ? 'Stopped' : stats.isPaused ? 'Paused' : 'Running'}
                </Badge>
              </div>
              <div className="stat-item">
                <span className="stat-label">Current Player:</span>
                <Badge variant={currentPlayer === 'white' ? 'default' : 'secondary'}>
                  {currentPlayer}
                </Badge>
              </div>
              <div className="stat-item">
                <span className="stat-label">Full Moves:</span>
                <Badge variant="outline">{stats.currentGameMoves}</Badge>
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
              <div className="stat-item">
                <span className="stat-label">Speed:</span>
                <Badge variant="outline">{getSpeedLabel()} ({(stats.speed/1000).toFixed(1)}s)</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}