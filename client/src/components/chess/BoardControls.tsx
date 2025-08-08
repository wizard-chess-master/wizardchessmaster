import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useChess } from '../../lib/stores/useChess';
import { useAudio } from '../../lib/stores/useAudio';
import { VoiceToggle } from '../ui/VoiceToggle';
import { wizardVoiceSystem } from '../../lib/audio/wizardVoiceSystem';

interface BoardControlsProps {
  onSettings: () => void;
}

export function BoardControls({ onSettings }: BoardControlsProps) {
  const { moveHistory, resetGame, gameMode } = useChess();
  const { isMuted } = useAudio();

  return (
    <Card className="medieval-panel h-fit">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="medieval-text text-xs">🎮 Controls</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="side-menu-buttons flex flex-col gap-2">
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetGame();
              window.location.reload();
            }}
            className="medieval-btn-mini w-full h-12 flex flex-col items-center justify-center p-1"
            title="Main Menu"
          >
            <span className="text-sm">🏠</span>
            <span className="text-xs leading-none">Menu</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const { board, currentPlayer, moveHistory } = useChess.getState();
              console.log('🎯 Generating hint for current position...');
              
              // Voice feedback for hint request
              wizardVoiceSystem.onGameEvent('hint_requested');
              
              import('../../lib/chess/hintSystem').then(({ hintSystem }) => {
                const hint = hintSystem.generateHint(board, currentPlayer, moveHistory);
                if (hint) {
                  console.log('💡 Hint generated:', hint);
                }
              });
            }}
            className="medieval-btn-mini w-full h-12 flex flex-col items-center justify-center p-1"
            title="Get Hint"
          >
            <span className="text-sm">💡</span>
            <span className="text-xs leading-none">Hint</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const { isMuted, toggleMute, playBackgroundMusic, backgroundMusic } = useAudio.getState();
              console.log('🎵 Music button clicked:', { isMuted, hasBackgroundMusic: !!backgroundMusic });
              
              if (isMuted) {
                // Unmute and start background music
                toggleMute();
                setTimeout(() => playBackgroundMusic(), 100); // Small delay to ensure unmute is processed
              } else {
                // Mute all sounds
                toggleMute();
              }
            }}
            className="medieval-btn-mini w-full h-12 flex flex-col items-center justify-center p-1"
            title={isMuted ? "Enable Music & Sound" : "Mute Music & Sound"}
          >
            <span className="text-sm">
              {isMuted ? '🔇' : '🎵'}
            </span>
            <span className="text-xs leading-none">
              {isMuted ? 'Sound' : 'Music'}
            </span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onSettings}
            className="medieval-btn-mini w-full h-12 flex flex-col items-center justify-center p-1"
            title="Settings"
          >
            <Settings className="w-3 h-3" />
            <span className="text-xs leading-none">Settings</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              import('../../lib/stores/useDiagnostics').then(({ useDiagnostics }) => {
                const { setShowDiagnostics } = useDiagnostics.getState();
                setShowDiagnostics(true);
              });
            }}
            className="medieval-btn-mini w-full h-12 flex flex-col items-center justify-center p-1"
            title="UI Diagnostics"
          >
            <span className="text-sm">🔍</span>
            <span className="text-xs leading-none">Debug</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const lastMove = moveHistory[moveHistory.length - 1];
              if (lastMove && gameMode !== 'ai-vs-ai') {
                console.log('🔄 Undoing last move...');
                const { undoMove } = useChess.getState();
                undoMove();
              }
            }}
            disabled={moveHistory.length === 0}
            className="medieval-btn-mini w-full h-12 flex flex-col items-center justify-center p-1"
            title="Undo Move"
          >
            <span className="text-sm">↶</span>
            <span className="text-xs leading-none">Undo</span>
          </Button>

          {/* Voice Toggle Control */}
          <div className="mt-2 flex justify-center">
            <VoiceToggle />
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
}