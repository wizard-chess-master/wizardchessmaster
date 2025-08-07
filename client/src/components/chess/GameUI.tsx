import React, { useState } from 'react';
import { useChess } from '../../lib/stores/useChess';
import { useAudio } from '../../lib/stores/useAudio';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Settings, RotateCcw, Home, Volume2, VolumeX, ChevronDown, ChevronUp, BookOpen, Gamepad2 } from 'lucide-react';

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
  const [showRules, setShowRules] = useState(false);
  const [showControls, setShowControls] = useState(false);

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
      <Card className="medieval-panel game-status">
        <CardHeader>
          <CardTitle className="flex items-center justify-between medieval-text">
            <span>🏰 Fantasy Chess</span>
            <Badge variant="outline">{getGameModeDisplay()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="status-info">
            <div className="current-player">
              <span className={`player-indicator ${currentPlayer} medieval-text`}>
                {getCurrentPlayerDisplay()}
              </span>
              {isInCheck && (
                <Badge variant="destructive" className="ml-2">
                  ⚠️ Check!
                </Badge>
              )}
            </div>
            <div className="move-count medieval-text">
              Move: {Math.floor(moveHistory.length / 2) + 1}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <Card className="medieval-panel game-controls">
        <CardContent className="pt-6">
          <div className="control-buttons flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetGame();
                // Navigate to main menu by resetting game phase
                window.location.reload();
              }}
              className="medieval-btn mode-button"
            >
              <div className="mode-content">
                <span>🏠 Main Menu</span>
                <Badge variant="secondary">Home</Badge>
              </div>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={undoMove}
              disabled={moveHistory.length === 0}
              className="medieval-btn mode-button"
            >
              <div className="mode-content">
                <span>🔄 Undo</span>
                <Badge variant="secondary">Last Move</Badge>
              </div>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              className="medieval-btn mode-button"
            >
              <div className="mode-content">
                <span>{isMuted ? '🔊 Unmute' : '🔇 Mute'}</span>
                <Badge variant="secondary">Audio</Badge>
              </div>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onSettings}
              className="medieval-btn mode-button"
            >
              <div className="mode-content">
                <span>⚙️ Settings</span>
                <Badge variant="secondary">Config</Badge>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Move History */}
      <Card className="medieval-panel move-history">
        <CardHeader>
          <CardTitle className="medieval-text">📜 Move History</CardTitle>
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

      {/* Game Rules - Collapsible */}
      <Card className="medieval-panel game-help">
        <CardHeader>
          <Button
            variant="ghost"
            onClick={() => setShowRules(!showRules)}
            className="medieval-btn w-full justify-between p-3"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="medieval-text">📖 Game Rules</span>
            </div>
            {showRules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CardHeader>
        {showRules && (
          <CardContent>
            <div className="rules-content">
              <div className="rule-item">
                <h4>Board Size</h4>
                <p>10x10 squares instead of traditional 8x8</p>
              </div>
              
              <div className="rule-item">
                <h4>Standard Pieces</h4>
                <p>All traditional chess pieces with standard movement</p>
              </div>
              
              <div className="rule-item">
                <h4>🧙‍♂️ Wizard Pieces</h4>
                <p>
                  <strong>Position:</strong> Two wizards per side in corners (a1/j1 for white, a10/j10 for black)<br/>
                  <strong>Teleport:</strong> Move to any unoccupied square within 2 spaces<br/>
                  <strong>Ranged Attack:</strong> Attack enemies within 2 squares without moving
                </p>
              </div>
              
              <div className="rule-item">
                <h4>🏰 Castling Rules</h4>
                <p>
                  <strong>King Movement:</strong> Moves 3 squares towards rook (to c1 or g1)<br/>
                  <strong>Rook Movement:</strong> Moves to square next to king (d1 or f1)<br/>
                  <strong>Requirements:</strong> No pieces between king and rook, king not in check, neither piece has moved before
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Game Controls - Collapsible */}
      <Card className="medieval-panel game-help">
        <CardHeader>
          <Button
            variant="ghost"
            onClick={() => setShowControls(!showControls)}
            className="medieval-btn w-full justify-between p-3"
          >
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              <span className="medieval-text">🎮 Controls</span>
            </div>
            {showControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CardHeader>
        {showControls && (
          <CardContent>
            <div className="controls-content">
              <div className="control-item">
                <span className="control-key">Mouse Click</span>
                <span>Select piece / Make move</span>
              </div>
              
              <div className="control-item">
                <span className="control-key">Ctrl+Z</span>
                <span>Undo last move</span>
              </div>
              
              <div className="control-item">
                <span className="control-key">Escape</span>
                <span>Deselect piece</span>
              </div>
              
              <div className="control-item">
                <span className="control-key">Ctrl+M</span>
                <span>Toggle sound</span>
              </div>
              
              <div className="control-item">
                <span className="control-key">Ctrl+H</span>
                <span>Return to menu</span>
              </div>
            </div>
          </CardContent>
        )}
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
