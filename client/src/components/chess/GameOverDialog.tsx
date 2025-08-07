import React from 'react';
import { useChess } from '../../lib/stores/useChess';
import { useAudio } from '../../lib/stores/useAudio';
import { getAdManager } from '../../lib/monetization/adManager';
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
      
      // Show interstitial ad after game completion
      const adManager = getAdManager();
      setTimeout(() => {
        adManager.showInterstitialAd();
      }, 2000); // 2 second delay after game ends
    }
  }, [winner, playSuccess]);

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
      <DialogContent className="game-over-dialog" aria-describedby="game-over-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 justify-center text-2xl">
            {getResultIcon()}
            Game Over!
          </DialogTitle>
        </DialogHeader>
        
        <div className="game-over-content">
          <div id="game-over-description" className="text-center mb-6">
            <p className="text-lg mb-2">
              {getGameResult()}
            </p>
            <p className="text-muted-foreground">
              {getResultDescription()}
            </p>
          </div>

          <div className="text-center mb-6">
            <p className="text-lg font-medium mb-4">
              Start new game or quit?
            </p>
          </div>
          
          {/* Game Stats */}
          <Card className="mb-4">
            <CardContent className="pt-4 text-center">
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
                    {gameMode === 'ai' ? 'vs AI' : gameMode === 'ai-vs-ai' ? 'AI vs AI' : 'Local Multiplayer'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* IAP Promotion */}
          <Card className="iap-promotion mb-4">
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Enjoyed the game?
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="medieval-btn mode-button bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0"
                onClick={() => {
                  const adManager = getAdManager();
                  if (!adManager.isAdFree()) {
                    window.dispatchEvent(new CustomEvent('show-upgrade-prompt'));
                  }
                }}
              >
                <div className="mode-content">
                  <span>💰 Remove Ads - $2.99</span>
                  <Badge variant="secondary" className="bg-white text-yellow-600">Premium</Badge>
                </div>
              </Button>
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
