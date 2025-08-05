import React from 'react';
import { useChess } from '../../lib/stores/useChess';
import { useAudio } from '../../lib/stores/useAudio';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Settings, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface GameUIProps {
  onSettings: () => void;
}

export function GameUI({ onSettings }: GameUIProps) {
  const { 
    currentPlayer, 
    gamePhase, 
    gameMode, 
    aiDifficulty, 
    isInCheck, 
    moveHistory,
    resetGame,
    undoMove
  } = useChess();
  
  const { isMuted, toggleMute } = useAudio();

  const getCurrentPlayerDisplay = () => {
    if (gameMode === 'ai') {
      return currentPlayer === 'white' ? 'Your Turn' : 'AI Thinking...';
    }
    return `${currentPlayer === 'white' ? 'White' : 'Black'}'s Turn`;
  };

  const getGameModeDisplay = () => {
    if (gameMode === 'ai') {
      return `vs AI (${aiDifficulty})`;
    }
    return 'Local Multiplayer';
  };

  return (
    <div className="game-ui">
      {/* Game Status Card */}
      <Card className="game-status">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Chess Variant</span>
            <Badge variant="outline">{getGameModeDisplay()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="status-info">
            <div className="current-player">
              <span className={`player-indicator ${currentPlayer}`}>
                {getCurrentPlayerDisplay()}
              </span>
              {isInCheck && (
                <Badge variant="destructive" className="ml-2">
                  Check!
                </Badge>
              )}
            </div>
            <div className="move-count">
              Move: {Math.floor(moveHistory.length / 2) + 1}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <Card className="game-controls">
        <CardContent className="pt-6">
          <div className="control-buttons">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetGame();
                // Navigate to main menu by resetting game phase
                window.location.reload();
              }}
            >
              <Home className="w-4 h-4 mr-2" />
              Main Menu
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={undoMove}
              disabled={moveHistory.length === 0}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Undo
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 mr-2" />
              ) : (
                <Volume2 className="w-4 h-4 mr-2" />
              )}
              {isMuted ? 'Unmute' : 'Mute'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onSettings}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetGame}
            >
              <Home className="w-4 h-4 mr-2" />
              Menu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Move History */}
      <Card className="move-history">
        <CardHeader>
          <CardTitle>Move History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="history-list">
            {moveHistory.length === 0 ? (
              <p className="text-muted-foreground">No moves yet</p>
            ) : (
              moveHistory.slice(-10).map((move, index) => (
                <div key={index} className="history-move">
                  <span className="move-number">{moveHistory.length - 10 + index + 1}.</span>
                  <span className="move-notation">
                    {move.piece.type} {String.fromCharCode(65 + move.from.col)}{10 - move.from.row} → {String.fromCharCode(65 + move.to.col)}{10 - move.to.row}
                    {move.captured && ` x${move.captured.type}`}
                    {move.isWizardTeleport && ' (teleport)'}
                    {move.isWizardAttack && ' (ranged)'}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ad Placeholder */}
      <Card className="ad-placeholder">
        <CardContent className="pt-6">
          <div className="ad-content">
            <p className="text-sm text-muted-foreground text-center">
              Advertisement Space
            </p>
            <div className="ad-banner">
              <span>Your Ad Here</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
