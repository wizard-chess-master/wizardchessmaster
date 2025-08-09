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
            onClick={async () => {
              const { isMuted, toggleMute } = useAudio.getState();
              console.log('🎵 Music toggle clicked - Theme-music2.mp3 control');
              
              if (isMuted) {
                // Unmute and start Theme-music2.mp3
                toggleMute();
                
                // AGGRESSIVE cleanup function - same as MainMenu
                async function cleanAudio() { 
                  try {
                    const context = new AudioContext(); 
                    await context.close(); 
                    console.log('✅ AudioContext closed');
                  } catch (e) {
                    console.log('AudioContext already closed or unavailable');
                  }
                  
                  // Stop ALL audio elements
                  document.querySelectorAll('audio').forEach(a => { 
                    a.pause(); 
                    a.currentTime = 0; 
                    a.src = ''; // Clear source
                    a.remove(); 
                  }); 
                  
                  // Stop any global audio manager music
                  if ((window as any).gameAudioManager?.themeMusic) {
                    (window as any).gameAudioManager.themeMusic.pause();
                    (window as any).gameAudioManager.themeMusic.currentTime = 0;
                    (window as any).gameAudioManager.themeMusic.src = '';
                    (window as any).gameAudioManager.themeMusic = null;
                  }
                  
                  // Stop any global theme music
                  if ((window as any).currentTheme) {
                    (window as any).currentTheme.pause();
                    (window as any).currentTheme.currentTime = 0;
                    (window as any).currentTheme.src = '';
                    (window as any).currentTheme = null;
                  }
                  
                  console.log('🛑 Toggle button audio cleanup completed'); 
                }
                
                await cleanAudio();
                
                // Start Theme-music2.mp3 with dynamic cache busting
                const theme = new Audio(`/assets/music/Theme-music2.mp3?t=${Date.now()}`);
                theme.loop = true;
                theme.volume = 0.42;
                (window as any).currentTheme = theme; // Store reference
                
                console.log('🎵 Theme-music2.mp3 from toggle button:', theme.src);
                
                try {
                  await theme.play();
                  console.log('✅ Theme-music2.mp3 playing from toggle button');
                  
                  // Try fallback if needed
                } catch (error) {
                  console.log('❌ Theme-music2.mp3 failed, trying fallback...');
                  try {
                    const fallback = new Audio(`/assets/music/Theme-music1.mp3?t=${Date.now()}`);
                    fallback.loop = true;
                    fallback.volume = 0.42;
                    (window as any).currentTheme = fallback;
                    await fallback.play();
                    console.log('✅ Fallback Theme-music1.mp3 playing');
                  } catch (fallbackError) {
                    console.error('❌ Both themes failed:', fallbackError);
                  }
                }
              } else {
                // Mute - stop all audio
                toggleMute();
                
                // Stop current theme
                if ((window as any).currentTheme) {
                  (window as any).currentTheme.pause();
                  (window as any).currentTheme.currentTime = 0;
                  console.log('🛑 Theme music stopped by toggle');
                }
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