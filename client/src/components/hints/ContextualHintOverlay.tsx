import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, Target, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useChess } from '@/lib/stores/useChess';
import { useAudio } from '@/lib/stores/useAudio';

interface HintContent {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  trigger: 'gameStart' | 'firstMove' | 'pieceSelection' | 'wizardMove' | 'check' | 'promotion' | 'endgame';
  priority: 'high' | 'medium' | 'low';
  category: 'movement' | 'strategy' | 'special' | 'victory';
  position?: { x: number; y: number };
  delay?: number;
}

const CONTEXTUAL_HINTS: HintContent[] = [
  {
    id: 'welcome',
    title: 'Welcome to Wizard Chess!',
    description: 'This is a 10x10 chess variant with magical wizards. Click any piece to see its valid moves highlighted in green.',
    icon: <Crown className="w-5 h-5 text-yellow-500" />,
    trigger: 'gameStart',
    priority: 'high',
    category: 'movement',
    delay: 1000
  },
  {
    id: 'piece-selection',
    title: 'Select Your Piece',
    description: 'Click on any of your white pieces to select it. Valid moves will be highlighted in green.',
    icon: <Target className="w-5 h-5 text-blue-500" />,
    trigger: 'pieceSelection',
    priority: 'high',
    category: 'movement',
    delay: 500
  },
  {
    id: 'wizard-power',
    title: 'Wizard Special Abilities',
    description: 'Wizards can teleport to any empty square and cast ranged attacks! They are your most powerful pieces.',
    icon: <Zap className="w-5 h-5 text-purple-500" />,
    trigger: 'wizardMove',
    priority: 'high',
    category: 'special',
    delay: 800
  },
  {
    id: 'first-move',
    title: 'Make Your Move',
    description: 'Click on a highlighted green square to move your selected piece. Try moving a pawn forward first!',
    icon: <Target className="w-5 h-5 text-green-500" />,
    trigger: 'firstMove',
    priority: 'medium',
    category: 'movement',
    delay: 2000
  },
  {
    id: 'check-warning',
    title: 'Your King is in Check!',
    description: 'Your king is under attack! You must move your king to safety or block the attack immediately.',
    icon: <Crown className="w-5 h-5 text-red-500" />,
    trigger: 'check',
    priority: 'high',
    category: 'strategy',
    delay: 0
  },
  {
    id: 'endgame-strategy',
    title: 'Endgame Approach',
    description: 'With fewer pieces on the board, focus on king safety and piece coordination. Every move counts!',
    icon: <Lightbulb className="w-5 h-5 text-orange-500" />,
    trigger: 'endgame',
    priority: 'medium',
    category: 'strategy',
    delay: 1500
  }
];

interface ContextualHintOverlayProps {
  isNewPlayer?: boolean;
  showHints?: boolean;
  onHintDismiss?: (hintId: string) => void;
}

export function ContextualHintOverlay({ 
  isNewPlayer = true, 
  showHints = true,
  onHintDismiss 
}: ContextualHintOverlayProps) {
  const [activeHint, setActiveHint] = useState<HintContent | null>(null);
  const [dismissedHints, setDismissedHints] = useState<Set<string>>(new Set());
  const [hintQueue, setHintQueue] = useState<HintContent[]>([]);
  
  const { 
    gamePhase, 
    selectedPosition, 
    board, 
    isInCheck, 
    currentPlayer,
    moveHistory 
  } = useChess();
  
  const { playGameEvent } = useAudio();

  // Load dismissed hints from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wizard-chess-dismissed-hints');
    const dismissedSet = saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    
    // Also check if user has seen welcome before
    const hasSeenWelcome = localStorage.getItem('wizard-chess-seen-welcome') === 'true';
    if (hasSeenWelcome) {
      dismissedSet.add('welcome');
    }
    
    setDismissedHints(dismissedSet);
  }, []);

  // Save dismissed hints to localStorage
  const saveDismissedHints = (hints: Set<string>) => {
    localStorage.setItem('wizard-chess-dismissed-hints', JSON.stringify(Array.from(hints)));
  };

  // Trigger hint based on game state
  const triggerHint = (trigger: HintContent['trigger']) => {
    if (!showHints || !isNewPlayer) return;

    const hint = CONTEXTUAL_HINTS.find(h => h.trigger === trigger && !dismissedHints.has(h.id));
    if (hint && !activeHint) {
      setTimeout(() => {
        setActiveHint(hint);
        // Play audio for welcome hint
        if (hint.id === 'welcome') {
          playGameEvent('tutorial_welcome');
        }
      }, hint.delay || 0);
    }
  };

  // Monitor game state for hint triggers
  useEffect(() => {
    if (gamePhase === 'playing' && moveHistory.length === 0) {
      triggerHint('gameStart');
    }
  }, [gamePhase]);
  
  // Auto-dismiss hint after 30 seconds to prevent stuck overlays
  useEffect(() => {
    if (activeHint) {
      const timeout = setTimeout(() => {
        setActiveHint(null);
        const newDismissed = new Set(dismissedHints);
        newDismissed.add(activeHint.id);
        setDismissedHints(newDismissed);
        saveDismissedHints(newDismissed);
        onHintDismiss?.(activeHint.id);
      }, 30000); // 30 seconds
      
      return () => clearTimeout(timeout);
    }
  }, [activeHint, dismissedHints, onHintDismiss]);

  useEffect(() => {
    if (selectedPosition && moveHistory.length === 0) {
      triggerHint('pieceSelection');
    }
  }, [selectedPosition]);

  useEffect(() => {
    if (moveHistory.length === 1 && currentPlayer === 'black') {
      triggerHint('firstMove');
    }
  }, [moveHistory.length, currentPlayer]);

  useEffect(() => {
    if (isInCheck) {
      triggerHint('check');
    }
  }, [isInCheck]);

  useEffect(() => {
    if (selectedPosition && board) {
      const piece = board[selectedPosition.row][selectedPosition.col];
      if (piece?.type === 'wizard') {
        triggerHint('wizardMove');
      }
    }
  }, [selectedPosition, board]);

  useEffect(() => {
    // Trigger endgame hint when few pieces remain
    if (board) {
      const totalPieces = board.flat().filter(piece => piece !== null).length;
      if (totalPieces <= 12 && moveHistory.length > 20) {
        triggerHint('endgame');
      }
    }
  }, [board, moveHistory.length]);

  const dismissHint = (hintId: string) => {
    const newDismissed = new Set(dismissedHints);
    newDismissed.add(hintId);
    setDismissedHints(newDismissed);
    saveDismissedHints(newDismissed);
    setActiveHint(null);
    onHintDismiss?.(hintId);
  };

  const dismissAllHints = () => {
    const allHintIds = new Set(CONTEXTUAL_HINTS.map(h => h.id));
    setDismissedHints(allHintIds);
    saveDismissedHints(allHintIds);
    setActiveHint(null);
  };

  if (!showHints || !isNewPlayer || !activeHint) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
        onClick={() => dismissHint(activeHint.id)} // Allow clicking backdrop to dismiss
      >
        {/* Backdrop - click to dismiss */}
        <div className="absolute inset-0 bg-black/20 pointer-events-auto" 
             onClick={() => dismissHint(activeHint.id)} />
        
        {/* Hint Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={`fixed pointer-events-auto ${
            activeHint.position
              ? `left-[${activeHint.position.x}px] top-[${activeHint.position.y}px]`
              : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
          }`}
        >
          <Card className="w-80 shadow-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {activeHint.icon}
                  <h3 className="font-bold text-lg text-amber-900">
                    {activeHint.title}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissHint(activeHint.id)}
                  className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-amber-800 mb-4 leading-relaxed">
                {activeHint.description}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dismissHint(activeHint.id)}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    Got it!
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissAllHints}
                  className="text-xs text-amber-600 hover:text-amber-800"
                >
                  Hide all hints
                </Button>
              </div>
              
              {/* Priority indicator */}
              <div className="mt-3 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  activeHint.priority === 'high' ? 'bg-red-400' :
                  activeHint.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                }`} />
                <span className="text-xs text-amber-600 capitalize">
                  {activeHint.priority} priority • {activeHint.category}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Pulsing indicator for highlighted areas */}
        {activeHint.id === 'piece-selection' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none"
          >
            <div className="w-4 h-4 bg-blue-400 rounded-full opacity-70" />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Hint settings component for user preferences
export function HintSettings({ 
  showHints, 
  onToggleHints 
}: { 
  showHints: boolean; 
  onToggleHints: (show: boolean) => void;
}) {
  const clearAllDismissedHints = () => {
    localStorage.removeItem('wizard-chess-dismissed-hints');
    window.location.reload(); // Refresh to show hints again
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Show contextual hints</span>
        <Button
          variant={showHints ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleHints(!showHints)}
        >
          {showHints ? "On" : "Off"}
        </Button>
      </div>
      
      {showHints && (
        <div className="text-xs text-gray-600">
          <p>Hints will appear automatically for new players to help learn the game.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllDismissedHints}
            className="mt-2 text-xs"
          >
            Reset all dismissed hints
          </Button>
        </div>
      )}
    </div>
  );
}