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
                  
                  // Enhanced thematic hint display - completely transform technical language
                  let enhancedDescription = hint.description;
                  
                  // Handle wizard teleport moves
                  if (enhancedDescription.includes('wizard teleport')) {
                    enhancedDescription = enhancedDescription
                      .replace(/Move wizard from (\w+) to (\w+) \(wizard teleport\)/i, 
                        '✨ Unleash mystical teleportation! Transport your wizard from $1 to $2 through magical portals');
                  }
                  // Handle wizard attacks
                  else if (enhancedDescription.includes('wizard ranged attack')) {
                    enhancedDescription = enhancedDescription
                      .replace(/Move wizard from (\w+) to (\w+) \(wizard ranged attack\)/i, 
                        '⚡ Cast devastating spell! Your wizard at $1 launches a magical attack on $2');
                  }
                  // Handle regular moves with captures
                  else if (enhancedDescription.includes('captures')) {
                    enhancedDescription = enhancedDescription
                      .replace(/Move (\w+) from (\w+) to (\w+) \(captures (\w+)\)/i, 
                        '⚔️ Battle charge! Send your $1 from $2 to $3 and destroy the enemy $4!')
                      .replace(/Move (\w+) from (\w+) to (\w+).*captures (\w+)/i, 
                        '⚔️ Battle charge! Send your $1 from $2 to $3 and destroy the enemy $4!');
                  }
                  // Handle regular moves
                  else {
                    enhancedDescription = enhancedDescription
                      .replace(/Move (\w+) from (\w+) to (\w+)/i, 
                        '🎯 Strategic maneuver! Advance your $1 from $2 to the powerful position at $3');
                  }
                  
                  // Transform reasoning to be more engaging
                  let enhancedReasoning = hint.reasoning
                    .replace(/Improves piece defense/gi, '🛡️ Fortifies your battlefield defenses')
                    .replace(/Uses wizard mobility advantage/gi, '✨ Exploits magical teleportation mastery')
                    .replace(/Creates threat to enemy pieces/gi, '🔥 Strikes fear into enemy ranks')
                    .replace(/Controls important central squares/gi, '⭐ Claims dominance over the battlefield center')
                    .replace(/Develops piece to better position/gi, '📈 Activates dormant forces for future conquest')
                    .replace(/Strong tactical move/gi, '🧠 Demonstrates masterful battlefield strategy');
                  
                  const hintMessage = `${enhancedDescription}\n\n🧠 Strategic Value:\n${enhancedReasoning}`;
                  alert(`🧙‍♂️ Wizard Chess Battle Hint\n\n${hintMessage}`);
                  console.log('💡 Hint displayed to user:', hintMessage);
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
                const cleanAudio = async () => { 
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
                
                // Wait a moment after cleanup before creating new audio
                setTimeout(async () => {
                  // Start Theme-music2.mp3 with dynamic cache busting (same approach as MainMenu)
                  const theme = new Audio(`/assets/music/Theme-music2.mp3?t=${Date.now()}`);
                  theme.loop = true;
                  theme.volume = 0.42;
                  
                  console.log('🎵 Theme-music2.mp3 from toggle button:', theme.src);
                  
                  // Simplified error handling - no automatic fallback to old music
                  theme.addEventListener('error', (e) => {
                    console.error('❌ Theme-music2.mp3 failed to load from toggle:', e);
                    console.log('🚫 No fallback - keeping audio muted instead of playing old music');
                  });
                  
                  try {
                    await theme.play();
                    (window as any).currentTheme = theme; // Store reference after successful play
                    console.log('✅ Theme-music2.mp3 playing from toggle button');
                  } catch (error) {
                    console.error('❌ Theme-music2.mp3 play failed from toggle:', error);
                    console.log('🚫 Keeping audio muted instead of falling back to old music');
                  }
                }, 100); // Small delay after cleanup
              } else {
                // Mute - stop all audio FIRST, then toggle mute
                console.log('🛑 Stopping music before mute');
                
                // Stop current theme
                if ((window as any).currentTheme) {
                  (window as any).currentTheme.pause();
                  (window as any).currentTheme.currentTime = 0;
                  (window as any).currentTheme.src = '';
                  (window as any).currentTheme = null;
                  console.log('🛑 Theme music stopped by toggle');
                }
                
                // Stop ALL audio elements 
                document.querySelectorAll('audio').forEach(a => { 
                  a.pause(); 
                  a.currentTime = 0; 
                  a.src = '';
                  a.remove(); 
                }); 
                
                // Then toggle mute state
                toggleMute();
                console.log('🛑 All audio stopped, mute state toggled');
              }
            }}
            className="medieval-btn-mini w-full h-12 flex flex-col items-center justify-center p-1"
            title={isMuted ? "Enable Music & Sound" : "Mute Music & Sound"}
          >
            <span className="text-sm">
              {isMuted ? '🔇' : '🎵'}
            </span>
            <span className="text-xs leading-none">
              {isMuted ? 'Muted' : 'Music'}
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