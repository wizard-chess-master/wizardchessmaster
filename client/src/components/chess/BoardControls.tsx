import React, { useState, useRef } from 'react';
import { Settings, Lightbulb } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useChess } from '../../lib/stores/useChess';
import { useAudio } from '../../lib/stores/useAudio';
import { usePersonalizedHints } from '../../lib/stores/usePersonalizedHints';
import { hintLearning } from '../../lib/hints/hintLearning';
import { PersonalizedHintModal } from '../hints/PersonalizedHintModal';
import { getAIMove } from '../../lib/chess/aiPlayer';
import { QuickHintButton } from '../hints/QuickHintButton';


interface BoardControlsProps {
  onSettings: () => void;
}

export function BoardControls({ onSettings }: BoardControlsProps) {
  const { moveHistory, resetGame, gameMode, undoMove, hintsEnabled, board, currentPlayer, aiDifficulty } = useChess();
  const { isMuted } = useAudio();
  const { 
    recordHintInteraction, 
    getPersonalizedHintStyle, 
    selectOptimalHintVariation,
    enablePersonalization 
  } = usePersonalizedHints();
  
  const [showHintModal, setShowHintModal] = useState(false);
  const [currentHint, setCurrentHint] = useState({ description: '', reasoning: '' });
  const [lastHintMove, setLastHintMove] = useState<string>('');
  const [lastHintTime, setLastHintTime] = useState(0);
  const [recentHints, setRecentHints] = useState<string[]>([]);
  const [currentHintId, setCurrentHintId] = useState<string>('');
  const hintStartTimeRef = useRef<number>(0);

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

        // Create a simple hint for the personalized system to use  
        const hintText = `Consider ${moveDescription}`;

        // Vary the hint text based on AI difficulty and move type
        const beginnerHints = [
          `Consider moving your ${moveDescription}`,
          `Try moving your ${moveDescription}`,
          `A good move would be ${moveDescription}`,
          `You might want to move your ${moveDescription}`,
          `The AI suggests ${moveDescription}`,
          `How about moving your ${moveDescription}?`,
          `Think about ${moveDescription}`,
          `A solid choice: ${moveDescription}`,
          `Consider this move: ${moveDescription}`,
          `Try this: ${moveDescription}`,
          `Look at ${moveDescription}`,
          `What about ${moveDescription}?`,
          `Here's an idea: ${moveDescription}`,
          `This could work: ${moveDescription}`,
          `Maybe try ${moveDescription}`,
          `Consider ${moveDescription}`,
          `Take a look at ${moveDescription}`,
          `How about ${moveDescription}?`,
          `This might help: ${moveDescription}`,
          `Try this move: ${moveDescription}`
        ];

        const intermediateHints = [
          `Analyze ${moveDescription} - it develops well`,
          `${moveDescription} improves your position`,
          `Strategic option: ${moveDescription}`,
          `${moveDescription} creates good pressure`,
          `Consider the tactical ${moveDescription}`,
          `${moveDescription} enhances piece coordination`,
          `Evaluate ${moveDescription} for tempo`,
          `${moveDescription} controls key squares`,
          `${moveDescription} builds initiative`,
          `Promising continuation: ${moveDescription}`,
          `${moveDescription} improves piece activity`,
          `Strong candidate: ${moveDescription}`,
          `${moveDescription} maintains balance`,
          `Tactical opportunity: ${moveDescription}`,
          `${moveDescription} centralizes nicely`,
          `Consider ${moveDescription} for development`,
          `${moveDescription} creates threats`,
          `Solid choice: ${moveDescription}`,
          `${moveDescription} improves king safety`,
          `Positional move: ${moveDescription}`
        ];

        const advancedHints = [
          `${moveDescription} - excellent positional concept`,
          `Masterful ${moveDescription} exploits weaknesses`,
          `${moveDescription} demonstrates deep understanding`,
          `Brilliant ${moveDescription} controls the position`,
          `${moveDescription} - a grandmaster-level choice`,
          `${moveDescription} maximizes piece potential`,
          `${moveDescription} creates long-term advantages`,
          `${moveDescription} shows strategic vision`,
          `${moveDescription} - textbook execution`,
          `${moveDescription} dominates the position`,
          `${moveDescription} - precise calculation required`,
          `${moveDescription} demonstrates tactical mastery`,
          `${moveDescription} controls critical diagonals`,
          `${moveDescription} creates unstoppable threats`,
          `${moveDescription} - championship-level play`,
          `${moveDescription} optimizes piece harmony`,
          `${moveDescription} establishes positional supremacy`,
          `${moveDescription} - a stroke of genius`,
          `${moveDescription} secures the advantage`,
          `${moveDescription} demonstrates perfect timing`
        ];

        // Get personalized hint style (uses learning algorithm if enabled)
        const effectiveHintStyle = enablePersonalization 
          ? getPersonalizedHintStyle(aiDifficulty, 'opening') // Game phase detection can be enhanced
          : aiDifficulty;
        
        // Select hint variations based on effective style
        let hintVariations;
        if (effectiveHintStyle === 'easy') {
          hintVariations = beginnerHints;
        } else if (effectiveHintStyle === 'medium') {
          hintVariations = intermediateHints;
        } else {
          hintVariations = advancedHints;
        }
        
        // Detect current game phase
        const detectGamePhase = (moveCount: number): 'opening' | 'middle' | 'endgame' => {
          if (moveCount < 20) return 'opening';
          if (moveCount < 40) return 'middle';
          return 'endgame';
        };
        
        const currentGamePhase = detectGamePhase(moveHistory.length);
        
        // Use personalized selection if learning is enabled
        const gameContext = {
          difficulty: effectiveHintStyle,
          phase: currentGamePhase,
          position: boardHash
        };
        
        const selectedHint = enablePersonalization
          ? selectOptimalHintVariation(hintVariations, moveDescription, gameContext)
          : hintVariations[Math.floor(Math.random() * hintVariations.length)];
        
        // Generate unique hint ID for tracking
        const hintId = `hint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setCurrentHintId(hintId);
        hintStartTimeRef.current = Date.now();
        
        setCurrentHint({
          description: selectedHint,
          reasoning: enablePersonalization 
            ? "This personalized recommendation is based on your playing style and preferences."
            : "This move was analyzed as a strong tactical choice for the current position."
        });
        
        // Update tracking state
        setLastHintMove(boardHash);
        setLastHintTime(now);
        setRecentHints(prev => [...prev.slice(-2), moveDescription]); // Keep last 3 hints
        setShowHintModal(true);
        
        console.log('🧠 Hint generated:', {
          id: hintId,
          type: effectiveHintStyle,
          phase: currentGamePhase,
          personalized: enablePersonalization
        });
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

          {/* Quick Hint Button - Contextual for new players */}
          <QuickHintButton className="mb-2" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const { isMuted, toggleMute } = useAudio.getState();
              console.log('🎵 Music toggle clicked');
              
              if (isMuted) {
                console.log('🔊 Unmuting audio');
                toggleMute(); // This will automatically start background music
              } else {
                console.log('🔇 Muting audio');
                toggleMute(); // This will automatically stop background music
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
    
    {/* Personalized Hint Modal */}
    {showHintModal && (
      <PersonalizedHintModal
        isOpen={showHintModal}
        onClose={() => {
          setShowHintModal(false);
          setCurrentHint({ description: '', reasoning: '' });
          setCurrentHintId('');
        }}
        difficulty={aiDifficulty === 'advanced' ? 'hard' : aiDifficulty as 'easy' | 'medium' | 'hard'}
        gamePhase={moveHistory.length < 20 ? 'opening' : moveHistory.length < 40 ? 'middle' : 'endgame'}
        position={JSON.stringify(board)}
      />
    )}
    </>
  );
}