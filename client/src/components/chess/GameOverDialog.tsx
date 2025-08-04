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
  
  const { playSuccess } = useAudio();

  React.useEffect(() => {
    if (winner) {
      playSuccess();
    }
  }, [winner, playSuccess]);

  const getGameResult = () => {
    if (isCheckmate && winner) {
      if (gameMode === 'ai') {
        return winner === 'white' ? 'Victory!' : 'Defeat!';
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
      <DialogContent className="game-over-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 justify-center">
            {getResultIcon()}
            {getGameResult()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="game-over-content">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                {getResultDescription()}
              </p>
              
              <div className="game-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Moves:</span>
                  <Badge variant="outline">
                    {Math.ceil(moveHistory.length / 2)}
                  </Badge>
                </div>
                
                {gameMode === 'ai' && (
                  <div className="stat-item">
                    <span className="stat-label">AI Difficulty:</span>
                    <Badge variant="secondary">
                      {aiDifficulty.charAt(0).toUpperCase() + aiDifficulty.slice(1)}
                    </Badge>
                  </div>
                )}
                
                <div className="stat-item">
                  <span className="stat-label">Game Mode:</span>
                  <Badge variant="outline">
                    {gameMode === 'ai' ? 'vs AI' : 'Local Multiplayer'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* IAP Promotion */}
          <Card className="iap-promotion">
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Enjoyed the game?
              </p>
              <Button variant="outline" size="sm" disabled>
                Remove Ads - $2.99
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="game-over-actions">
          <Button
            variant="outline"
            onClick={() => gameMode === 'ai' ? startGame('ai', aiDifficulty) : startGame('local')}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
          
          <Button onClick={resetGame}>
            <Home className="w-4 h-4 mr-2" />
            Main Menu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
