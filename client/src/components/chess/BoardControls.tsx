import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useChess } from '../../lib/stores/useChess';
import { useAudio } from '../../lib/stores/useAudio';

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
              const { isMuted, toggleMute } = useAudio.getState();
              console.log('🎵 Music button clicked - Theme-music1.mp3 v=26 enforcement');
              
              if (isMuted) {
                // Unmute and force Theme-music1.mp3
                toggleMute();
                
                // Enhanced cleanup function
                function cleanAudio() { 
                  if (typeof AudioContext !== 'undefined') { 
                    new AudioContext().close(); 
                  } 
                  document.querySelectorAll('audio').forEach(a => { 
                    a.pause(); 
                    a.currentTime = 0; 
                    a.remove(); 
                  }); 
                  console.log('Audio cleanup count:', document.querySelectorAll('audio').length); 
                }
                
                // Call cleanup first
                cleanAudio();
                
                // Force theme playback with v=26 cache busting
                const theme = new Audio('/assets/music/Theme-music1.mp3?v=26');
                theme.loop = true;
                theme.volume = 0.42;
                console.log('Theme created from music button:', theme.src);
                
                theme.play()
                  .then(() => {
                    console.log('✅ Theme-music1.mp3 v=26 FORCED from music button');
                    console.log('Theme forced:', theme.src, theme.paused ? 'Paused' : 'Playing');
                  })
                  .catch((error) => {
                    console.error('❌ Failed to force theme music from button:', error);
                  });
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
              }
            }}
            disabled={moveHistory.length === 0}
            className="medieval-btn-mini w-full h-12 flex flex-col items-center justify-center p-1"
            title="Undo Move"
          >
            <span className="text-sm">↶</span>
            <span className="text-xs leading-none">Undo</span>
          </Button>
          
        </div>
      </CardContent>
    </Card>
  );
}