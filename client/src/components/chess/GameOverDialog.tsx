import React from 'react';
import { useChess } from '../../lib/stores/useChess';
import { useAudio } from '../../lib/stores/useAudio';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, RotateCcw, Home, Crown } from 'lucide-react';

export function GameOverDialog() {
  const { 
    winner, 
    isCheckmate, 
    isStalemate, 
    gameMode, 
    aiDifficulty,
    moveHistory,
    startGame,
    resetGame
  } = useChess();
  
  const { playGameEvent } = useAudio();

  React.useEffect(() => {
    if (winner) {
      playGameEvent('victory');
      
      // Game completed successfully
    }
  }, [winner, playGameEvent]);

  const getGameResult = () => {
    if (isCheckmate && winner) {
      if (gameMode === 'ai') {
        return winner === 'white' ? 'Victory!' : 'Defeat!';
      }
      if (gameMode === 'ai-vs-ai') {
        return `AI ${winner === 'white' ? 'White' : 'Black'} Wins!`;
      }
      return `${winner === 'white' ? 'White' : 'Black'} Wins!`;
    }
    
    if (isStalemate) {
      return 'Stalemate - Draw!';
    }
    
    return 'Game Over';
  };

  const getResultIcon = () => {
    if (isStalemate) {
      return <Crown className="w-8 h-8 text-yellow-500" />;
    }
    
    if (gameMode === 'ai') {
      return winner === 'white' ? 
        <Trophy className="w-8 h-8 text-green-500" /> :
        <Trophy className="w-8 h-8 text-red-500" />;
    }
    
    return <Trophy className="w-8 h-8 text-blue-500" />;
  };

  const getResultDescription = () => {
    if (isStalemate) {
      return "No legal moves available, but the king is not in check.";
    }
    
    if (isCheckmate && winner) {
      return `${winner === 'white' ? 'White' : 'Black'} achieved checkmate!`;
    }
    
    return "";
  };

  return (
    <Dialog open>
      <DialogContent className="game-over-dialog max-w-2xl w-full bg-gradient-to-b from-stone-900 to-stone-800 text-white border-yellow-600/30" aria-describedby="game-over-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 justify-center text-2xl text-yellow-400">
            {getResultIcon()}
            Game Over!
          </DialogTitle>
        </DialogHeader>
        
        <div className="game-over-content">
          <div id="game-over-description" className="text-center mb-6">
            <p className="text-lg mb-2 text-yellow-300">
              {getGameResult()}
            </p>
            <p className="text-stone-300">
              {getResultDescription()}
            </p>
          </div>

          <div className="text-center mb-6">
            <p className="text-lg font-medium mb-4 text-stone-200">
              Start new game or quit?
            </p>
          </div>
          
          {/* Game Stats */}
          <Card className="mb-4 bg-stone-800/50 border-yellow-600/20">
            <CardContent className="pt-4 text-center">
              <div className="game-stats">
                <div className="stat-item">
                  <span className="stat-label text-stone-300">Total Moves:</span>
                  <Badge variant="outline" className="bg-yellow-600/20 text-yellow-300 border-yellow-600/30">
                    {Math.ceil(moveHistory.length / 2)}
                  </Badge>
                </div>
                
                {gameMode === 'ai' && (
                  <div className="stat-item">
                    <span className="stat-label text-stone-300">AI Difficulty:</span>
                    <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-600/30">
                      {aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)}
                    </Badge>
                  </div>
                )}
                
                <div className="stat-item">
                  <span className="stat-label text-stone-300">Game Mode:</span>
                  <Badge variant="outline" className="bg-blue-600/20 text-blue-300 border-blue-600/30">
                    {gameMode === 'ai' ? 'vs AI' : gameMode === 'ai-vs-ai' ? 'AI vs AI' : gameMode === 'multiplayer' ? 'Online Match' : 'Local Multiplayer'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          

        </div>

        <div className="game-over-actions flex gap-3 justify-center">
          <Button
            size="lg"
            className="medieval-btn mode-button"
            onClick={() => {
              if (gameMode === 'ai') startGame('ai', aiDifficulty);
              else if (gameMode === 'ai-vs-ai') startGame('ai-vs-ai', aiDifficulty);
              else startGame('local');
            }}
          >
            <div className="mode-content">
              <span>🔄 Start New Game</span>
              <Badge variant="secondary">Restart</Badge>
            </div>
          </Button>
          
          <Button variant="outline" size="lg" className="medieval-btn mode-button" onClick={resetGame}>
            <div className="mode-content">
              <span>🏠 Return to Menu</span>
              <Badge variant="secondary">Home</Badge>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
