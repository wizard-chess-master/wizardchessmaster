import React, { useState } from 'react';
import { Settings, Lightbulb } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useChess } from '../../lib/stores/useChess';
import { useAudio } from '../../lib/stores/useAudio';
import { HintModal } from './HintModal';
import { getAIMove } from '../../lib/chess/aiPlayer';


interface BoardControlsProps {
  onSettings: () => void;
}

export function BoardControls({ onSettings }: BoardControlsProps) {
  const { moveHistory, resetGame, gameMode, undoMove, hintsEnabled, board, currentPlayer, aiDifficulty } = useChess();
  const { isMuted } = useAudio();
  const [showHintModal, setShowHintModal] = useState(false);
  const [currentHint, setCurrentHint] = useState({ description: '', reasoning: '' });
  const [lastHintMove, setLastHintMove] = useState<string>('');
  const [lastHintTime, setLastHintTime] = useState(0);
  const [recentHints, setRecentHints] = useState<string[]>([]);

  const handleGetHint = async () => {
    try {
      // Prevent hints too frequently (minimum 3 seconds between hints)
      const now = Date.now();
      if (now - lastHintTime < 3000) {
        return;
      }

      // Get current board state hash to detect position changes
      const boardHash = JSON.stringify(board) + currentPlayer + moveHistory.length;
      
      // If same position and recent hint exists, don't repeat
      if (lastHintMove === boardHash && recentHints.length > 0) {
        return;
      }

      // Get AI suggestion for current position  
      const gameState = { 
        board, 
        currentPlayer, 
        gamePhase: 'playing' as const, 
        aiDifficulty,
        selectedPosition: null,
        validMoves: [],
        gameMode: 'ai' as const,
        moveHistory,
        isInCheck: false,
        isCheckmate: false,
        isStalemate: false,
        winner: null
      };
      const aiMove = await getAIMove(gameState);
      if (aiMove) {
        const fromNotation = `${String.fromCharCode(97 + aiMove.from.col)}${10 - aiMove.from.row}`;
        const toNotation = `${String.fromCharCode(97 + aiMove.to.col)}${10 - aiMove.to.row}`;
        const moveDescription = `${aiMove.piece?.type || 'piece'} from ${fromNotation} to ${toNotation}`;
        
        // Check if this exact hint was recently shown
        if (recentHints.includes(moveDescription)) {
          return;
        }

        // Vary the hint text to avoid repetition
        const hintVariations = [
          `Consider moving your ${moveDescription}`,
          `Try moving your ${moveDescription}`,
          `A good move would be ${moveDescription}`,
          `You might want to move your ${moveDescription}`,
          `The AI suggests ${moveDescription}`
        ];
        
        const randomHint = hintVariations[Math.floor(Math.random() * hintVariations.length)];
        
        setCurrentHint({
          description: randomHint,
          reasoning: "This move was analyzed as a strong tactical choice for the current position."
        });
        
        // Update tracking state
        setLastHintMove(boardHash);
        setLastHintTime(now);
        setRecentHints(prev => [...prev.slice(-2), moveDescription]); // Keep last 3 hints
        setShowHintModal(true);
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      setCurrentHint({
        description: "Unable to generate hint at this time",
        reasoning: "The AI system encountered an error while analyzing the position."
      });
      setShowHintModal(true);
    }
  };
  
  return (
  <>
    <Card className="medieval-panel h-fit">
      <CardHeader className="pb-1 text-center">
        <CardTitle className="medieval-text text-xs">🎮 Controls</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="side-menu-buttons flex flex-col gap-1">
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetGame();
              window.location.reload();
            }}
            className="medieval-btn-mini w-full h-9 flex flex-col items-center justify-center p-1"
            title="Main Menu"
          >
            <span className="text-sm">🏠</span>
            <span className="text-xs leading-none">Menu</span>
          </Button>
          
          {/* Hint Button - Only show when hints are enabled */}
          {hintsEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGetHint}
              className="medieval-btn-mini w-full h-9 flex flex-col items-center justify-center p-1"
              title="Get AI Hint"
            >
              <span className="text-sm">💡</span>
              <span className="text-xs leading-none">Hint</span>
            </Button>
          )}

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
              const lastMove = moveHistory[moveHistory.length - 1];
              if (lastMove && gameMode !== 'ai-vs-ai') {
                console.log('🔄 Undoing last move...');
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
          
        </div>
      </CardContent>

    </Card>
    
    {/* Hint Modal */}
    {showHintModal && (
      <HintModal
        isOpen={showHintModal}
        onClose={() => setShowHintModal(false)}
        hintDescription={currentHint.description}
        hintReasoning={currentHint.reasoning}
      />
    )}
    </>
  );
}