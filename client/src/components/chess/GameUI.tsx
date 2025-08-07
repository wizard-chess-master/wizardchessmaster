import React, { useState } from 'react';
import { useChess } from '../../lib/stores/useChess';
import { useAudio } from '../../lib/stores/useAudio';
import { AdBanner } from '../monetization/AdBanner';
import { GameHints } from '../monetization/GameHints';
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
      {/* Top Ad Banner */}
      <AdBanner 
        id="game-banner-top" 
        className="mb-3"
        style={{ maxWidth: '600px', width: '100%' }}
      />

      {/* Game Status Card */}
      <Card className="medieval-panel game-status w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between medieval-text text-sm">
            <span>🏰 Fantasy Chess</span>
            <Badge variant="outline" className="text-xs">{getGameModeDisplay()}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="status-info flex items-center justify-between">
            <div className="current-player">
              <span className={`player-indicator ${currentPlayer} medieval-text text-sm font-medium`}>
                {getCurrentPlayerDisplay()}
              </span>
              {isInCheck && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  ⚠️ Check!
                </Badge>
              )}
            </div>
            <div className="move-count medieval-text text-sm text-muted-foreground">
              Move: {Math.floor(moveHistory.length / 2) + 1}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <Card className="medieval-panel game-controls w-full max-w-md">
        <CardContent className="pt-4">
          <div className="control-buttons grid grid-cols-2 gap-2 w-full max-w-md">
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
            
            {/* Game Hints Component */}
            <GameHints
              onHint={() => {
                const { board, currentPlayer, moveHistory } = useChess.getState();
                console.log('🎯 Generating hint for current position...');
                
                // Import hint system dynamically to avoid circular dependencies
                import('../../lib/chess/hintSystem').then(({ hintSystem }) => {
                  const hint = hintSystem.generateHint(board, currentPlayer, moveHistory);
                  if (hint) {
                    console.log('💡 Hint:', hint.description);
                    console.log('🧠 Reasoning:', hint.reasoning);
                    
                    // You could highlight the suggested move on the board here
                    // For now, just log the hint
                    alert(`Hint: ${hint.description}\nReasoning: ${hint.reasoning}`);
                  } else {
                    console.log('❌ No hint available');
                    alert('No hint available for current position');
                  }
                });
              }}
              onUndo={() => undoMove()}
              canUndo={moveHistory.length > 0}
              gameStarted={gamePhase === 'playing'}
            />
            
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
      <Card className="medieval-panel move-history w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="medieval-text text-sm">📜 Move History</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="history-list max-h-32 overflow-y-auto">
            {moveHistory.length === 0 ? (
              <p className="text-muted-foreground text-sm">No moves yet</p>
            ) : (
              moveHistory.slice(-6).map((move, index) => (
                <div key={index} className="history-move text-xs py-1 flex gap-2">
                  <span className="move-number font-mono">{moveHistory.length - 6 + index + 1}.</span>
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
      <Card className="medieval-panel game-help w-full max-w-md">
        <CardHeader className="pb-0">
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
      <Card className="medieval-panel game-help w-full max-w-md">
        <CardHeader className="pb-0">
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

      {/* Bottom Ad Banner */}
      <AdBanner 
        id="game-banner-bottom" 
        className="mt-3"
        style={{ maxWidth: '600px', width: '100%' }}
      />
    </div>
  );
}
