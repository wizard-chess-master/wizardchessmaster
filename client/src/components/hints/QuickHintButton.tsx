import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface QuickHint {
  id: string;
  title: string;
  content: string;
  category: 'movement' | 'strategy' | 'special';
}

const QUICK_HINTS: QuickHint[] = [
  {
    id: 'piece-movement',
    title: 'Piece Movement',
    content: 'Click any piece to see its valid moves highlighted in green. Each piece type has unique movement patterns.',
    category: 'movement'
  },
  {
    id: 'wizard-abilities', 
    title: 'Wizard Powers',
    content: 'Wizards can teleport to any empty square and cast ranged attacks! Use them strategically.',
    category: 'special'
  },
  {
    id: 'king-safety',
    title: 'King Safety',
    content: 'Keep your king safe! If your king is in check, you must move it to safety or block the attack.',
    category: 'strategy'
  },
  {
    id: 'board-size',
    title: '10x10 Board',
    content: 'This is a larger 10x10 chess variant. You have more space to maneuver and additional piece types.',
    category: 'movement'
  }
];

interface QuickHintButtonProps {
  className?: string;
}

export function QuickHintButton({ className }: QuickHintButtonProps) {
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  const currentHint = QUICK_HINTS[currentHintIndex];

  const nextHint = () => {
    setCurrentHintIndex((prev) => (prev + 1) % QUICK_HINTS.length);
  };

  const toggleHint = () => {
    if (!showHint) {
      setCurrentHintIndex(0); // Reset to first hint when opening
    }
    setShowHint(!showHint);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Hint Button */}
      <Button
        variant={showHint ? "default" : "outline"}
        size="sm"
        onClick={toggleHint}
        className="flex items-center gap-2"
      >
        <Lightbulb className={`w-4 h-4 ${showHint ? 'text-yellow-300' : 'text-amber-500'}`} />
        Quick Hint
      </Button>

      {/* Hint Popup */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-2 z-50"
          >
            <Card className="w-80 shadow-xl border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      currentHint.category === 'movement' ? 'bg-blue-500' :
                      currentHint.category === 'strategy' ? 'bg-green-500' : 'bg-purple-500'
                    }`} />
                    <h3 className="font-bold text-amber-900">
                      {currentHint.title}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHint(false)}
                    className="text-amber-700 hover:text-amber-900 h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                <p className="text-amber-800 text-sm leading-relaxed mb-4">
                  {currentHint.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {QUICK_HINTS.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentHintIndex ? 'bg-amber-500' : 'bg-amber-200'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextHint}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs"
                  >
                    Next Tip
                  </Button>
                </div>
                
                <div className="mt-3 text-xs text-amber-600">
                  Tip {currentHintIndex + 1} of {QUICK_HINTS.length} • {currentHint.category}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}