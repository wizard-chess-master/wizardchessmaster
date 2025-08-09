import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  X, 
  Lightbulb, 
  ThumbsUp, 
  ThumbsDown, 
  MoreHorizontal,
  Brain,
  TrendingUp,
  Settings
} from 'lucide-react';
import { hintLearning } from '../../lib/hints/hintLearning';
import { useChess } from '../../lib/stores/useChess';

interface PersonalizedHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  difficulty: 'easy' | 'medium' | 'hard';
  gamePhase: 'opening' | 'middle' | 'endgame';
  position?: string;
}

// Enhanced hint database with learning metadata
const HINT_DATABASE = {
  easy: {
    opening: [
      { id: 'easy_open_1', content: 'Control the center squares with your pawns early in the game.', type: 'beginner' as const, complexity: 2 },
      { id: 'easy_open_2', content: 'Develop your knights before bishops - they have fewer good squares.', type: 'beginner' as const, complexity: 3 },
      { id: 'easy_open_3', content: 'Castle early to keep your king safe from attacks.', type: 'beginner' as const, complexity: 2 },
      { id: 'easy_open_4', content: 'Try to develop a new piece with each move rather than moving the same piece twice.', type: 'tactical' as const, complexity: 4 },
      { id: 'easy_open_5', content: 'Your wizards can teleport to create early pressure - but watch for counterattacks!', type: 'tactical' as const, complexity: 5 }
    ],
    middle: [
      { id: 'easy_mid_1', content: 'Look for pieces that are undefended - they might be easy targets.', type: 'beginner' as const, complexity: 3 },
      { id: 'easy_mid_2', content: 'Try to improve your worst-placed piece.', type: 'beginner' as const, complexity: 2 },
      { id: 'easy_mid_3', content: 'Create threats that force your opponent to respond defensively.', type: 'tactical' as const, complexity: 4 },
      { id: 'easy_mid_4', content: 'Use your wizards to attack from unexpected angles.', type: 'tactical' as const, complexity: 5 },
      { id: 'easy_mid_5', content: 'Connect your rooks by developing all pieces between them.', type: 'tactical' as const, complexity: 4 }
    ],
    endgame: [
      { id: 'easy_end_1', content: 'Activate your king - it becomes a strong piece in the endgame.', type: 'beginner' as const, complexity: 3 },
      { id: 'easy_end_2', content: 'Push passed pawns to create promotion threats.', type: 'beginner' as const, complexity: 4 },
      { id: 'easy_end_3', content: 'Centralize your king to control key squares.', type: 'tactical' as const, complexity: 5 },
      { id: 'easy_end_4', content: 'Use your wizards to support pawn advancement from a distance.', type: 'tactical' as const, complexity: 6 },
      { id: 'easy_end_5', content: 'Create opposition with your king to win pawn endgames.', type: 'grandmaster' as const, complexity: 7 }
    ]
  },
  medium: [
    // Medium hints with higher complexity
    { id: 'med_1', content: 'Look for tactical combinations that win material or improve position.', type: 'tactical' as const, complexity: 5 },
    { id: 'med_2', content: 'Consider sacrificing material for a powerful attack on the enemy king.', type: 'tactical' as const, complexity: 6 },
    { id: 'med_3', content: 'Use backward pawns and weak squares to your advantage.', type: 'grandmaster' as const, complexity: 7 },
    { id: 'med_4', content: 'Your wizards can create devastating combinations with other pieces.', type: 'tactical' as const, complexity: 6 },
    { id: 'med_5', content: 'Control key outposts for your pieces, especially knights.', type: 'grandmaster' as const, complexity: 7 }
  ],
  hard: [
    // Hard hints with highest complexity
    { id: 'hard_1', content: 'Calculate deep tactical sequences and evaluate resulting positions.', type: 'grandmaster' as const, complexity: 8 },
    { id: 'hard_2', content: 'Look for positional sacrifices that improve your piece coordination.', type: 'grandmaster' as const, complexity: 9 },
    { id: 'hard_3', content: 'Use prophylactic thinking to prevent your opponent\'s plans.', type: 'grandmaster' as const, complexity: 8 },
    { id: 'hard_4', content: 'Master wizard positioning to control multiple key squares simultaneously.', type: 'grandmaster' as const, complexity: 9 },
    { id: 'hard_5', content: 'Create long-term strategic imbalances in your favor.', type: 'grandmaster' as const, complexity: 10 }
  ]
};

export function PersonalizedHintModal({ 
  isOpen, 
  onClose, 
  difficulty, 
  gamePhase, 
  position 
}: PersonalizedHintModalProps) {
  const [currentHint, setCurrentHint] = useState<string>('');
  const [currentHintData, setCurrentHintData] = useState<any>(null);
  const [showLearningPanel, setShowLearningPanel] = useState(false);
  const [learningInsights, setLearningInsights] = useState<any>(null);
  const { gamePhase: currentPhase } = useChess();

  // Get available hints based on difficulty and phase
  const getAvailableHints = () => {
    if (difficulty === 'easy') {
      return HINT_DATABASE.easy[gamePhase] || HINT_DATABASE.easy.middle;
    }
    return HINT_DATABASE[difficulty] || HINT_DATABASE.medium;
  };

  // Generate personalized hint when modal opens
  useEffect(() => {
    if (isOpen) {
      generatePersonalizedHint();
      updateLearningInsights();
    }
  }, [isOpen, difficulty, gamePhase]);

  const generatePersonalizedHint = () => {
    const availableHints = getAvailableHints();
    const context = { difficulty, gamePhase, position };
    
    const personalizedHint = hintLearning.getPersonalizedHint(availableHints, context);
    
    if (personalizedHint) {
      setCurrentHint(personalizedHint);
      // Find the full hint data for interaction tracking
      const hintData = availableHints.find(h => h.content === personalizedHint);
      setCurrentHintData(hintData);
    } else {
      // Fallback to random hint
      const randomHint = availableHints[Math.floor(Math.random() * availableHints.length)];
      setCurrentHint(randomHint.content);
      setCurrentHintData(randomHint);
    }
  };

  const updateLearningInsights = () => {
    const insights = hintLearning.getLearningInsights();
    setLearningInsights(insights);
  };

  const handleHintInteraction = (action: 'followed' | 'ignored' | 'dismissed' | 'requested_more') => {
    if (currentHintData) {
      hintLearning.recordInteraction({
        hintId: currentHintData.id,
        hintType: currentHintData.type,
        complexity: currentHintData.complexity,
        action,
        gamePhase,
        difficulty,
        position
      });
      
      updateLearningInsights();
      
      if (action === 'requested_more') {
        generatePersonalizedHint();
      } else if (action !== 'dismissed') {
        // Close modal for followed/ignored hints
        setTimeout(() => onClose(), 1000);
      }
    }
  };

  const getHintTypeIcon = (type: string) => {
    switch (type) {
      case 'beginner': return '🌱';
      case 'tactical': return '⚔️';
      case 'grandmaster': return '👑';
      default: return '💡';
    }
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 3) return 'bg-green-100 text-green-800 border-green-300';
    if (complexity <= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (complexity <= 8) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 shadow-2xl"
        aria-describedby="hint-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 medieval-text">
            <Brain className="w-5 h-5 text-purple-600" />
            Merlin's Personalized Wisdom
            {learningInsights && (
              <Badge variant="outline" className="ml-2">
                {Math.round(learningInsights.metrics.preferenceConfidence)}% learned
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Hint Display */}
          <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">
                  {currentHintData ? getHintTypeIcon(currentHintData.type) : '💡'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {currentHintData && (
                      <>
                        <Badge variant="outline" className="capitalize">
                          {currentHintData.type}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={getComplexityColor(currentHintData.complexity)}
                        >
                          Level {currentHintData.complexity}
                        </Badge>
                      </>
                    )}
                  </div>
                  <motion.p 
                    id="hint-description"
                    className="text-lg text-gray-800 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={currentHint}
                  >
                    {currentHint}
                  </motion.p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interaction Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleHintInteraction('followed')}
              className="medieval-btn flex-1 min-w-0"
              variant="default"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Helpful! I'll use this
            </Button>
            
            <Button
              onClick={() => handleHintInteraction('ignored')}
              className="medieval-btn flex-1 min-w-0"
              variant="outline"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              I'll keep it in mind
            </Button>
            
            <Button
              onClick={() => handleHintInteraction('requested_more')}
              className="medieval-btn"
              variant="outline"
            >
              <MoreHorizontal className="w-4 h-4 mr-2" />
              Show different hint
            </Button>
            
            <Button
              onClick={() => handleHintInteraction('dismissed')}
              className="medieval-btn"
              variant="outline"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Not helpful
            </Button>
          </div>

          {/* Learning Panel Toggle */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              onClick={() => setShowLearningPanel(!showLearningPanel)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {showLearningPanel ? 'Hide' : 'View'} Learning Progress
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Learning Insights Panel */}
          <AnimatePresence>
            {showLearningPanel && learningInsights && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Learning Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Interactions:</span>
                        <span className="ml-2">{learningInsights.metrics.totalInteractions}</span>
                      </div>
                      <div>
                        <span className="font-medium">Success Rate:</span>
                        <span className="ml-2">
                          {learningInsights.metrics.totalInteractions > 0 
                            ? Math.round((learningInsights.metrics.successfulHints / learningInsights.metrics.totalInteractions) * 100)
                            : 0}%
                        </span>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Your Preferences:</h4>
                      <div className="flex flex-wrap gap-2">
                        {learningInsights.preferences.preferredHintTypes.map((type: string) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {getHintTypeIcon(type)} {type}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-xs">
                          Complexity: {Math.round(learningInsights.preferences.preferredComplexity)}/10
                        </Badge>
                      </div>
                    </div>

                    {/* Insights */}
                    <div className="space-y-1">
                      {learningInsights.insights.map((insight: string, index: number) => (
                        <p key={index} className="text-xs text-muted-foreground italic">
                          {insight}
                        </p>
                      ))}
                    </div>

                    {/* Reset Button */}
                    <Button
                      onClick={() => {
                        hintLearning.resetLearning();
                        updateLearningInsights();
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Reset Learning Data
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}