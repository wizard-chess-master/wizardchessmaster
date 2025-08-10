import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sparkles, MessageCircle, X } from 'lucide-react';

interface DialogueLine {
  id: string;
  speaker: string;
  text: string;
  emotion?: 'neutral' | 'happy' | 'serious' | 'concerned' | 'excited';
  choices?: {
    id: string;
    text: string;
    response: string;
  }[];
}

interface Character {
  id: string;
  name: string;
  avatar: string;
  title: string;
  personality: 'wise' | 'encouraging' | 'mysterious' | 'fierce';
}

interface CharacterDialogueProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  dialogue: DialogueLine[];
  onComplete: () => void;
}

const CHARACTERS: Record<string, Character> = {
  alric: {
    id: 'alric',
    name: 'Master Alric',
    avatar: '/assets/characters/alric.png',
    title: 'The Gentle Guide',
    personality: 'wise'
  },
  morgana: {
    id: 'morgana',
    name: 'Sorceress Morgana',
    avatar: '/assets/characters/morgana.png',
    title: 'The Strategic Mind',
    personality: 'mysterious'
  },
  gareth: {
    id: 'gareth',
    name: 'Knight Gareth',
    avatar: '/assets/characters/gareth.png',
    title: 'The Brave Defender',
    personality: 'encouraging'
  },
  zara: {
    id: 'zara',
    name: 'Wizard Zara',
    avatar: '/assets/characters/zara.png',
    title: 'The Lightning Master',
    personality: 'fierce'
  }
};

export function CharacterDialogue({ 
  isOpen, 
  onClose, 
  character, 
  dialogue, 
  onComplete 
}: CharacterDialogueProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(true);

  const currentLine = dialogue[currentLineIndex];
  const isLastLine = currentLineIndex === dialogue.length - 1;

  // Typing animation effect
  useEffect(() => {
    if (!currentLine) return;
    
    setIsTyping(true);
    const timer = setTimeout(() => {
      setIsTyping(false);
      if (currentLine.choices) {
        setShowChoices(true);
      }
    }, currentLine.text.length * 50 + 1000); // Typing speed simulation

    return () => clearTimeout(timer);
  }, [currentLineIndex, currentLine]);

  const nextLine = () => {
    if (isLastLine) {
      onComplete();
    } else {
      setCurrentLineIndex(prev => prev + 1);
      setShowChoices(false);
      setSelectedChoice(null);
    }
  };

  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoice(choiceId);
    setTimeout(() => {
      nextLine();
    }, 1500);
  };

  const getPersonalityStyles = (personality: Character['personality']) => {
    switch (personality) {
      case 'wise':
        return {
          bgGradient: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-900',
          accentColor: 'text-blue-600'
        };
      case 'encouraging':
        return {
          bgGradient: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-300',
          textColor: 'text-green-900',
          accentColor: 'text-green-600'
        };
      case 'mysterious':
        return {
          bgGradient: 'from-purple-50 to-violet-50',
          borderColor: 'border-purple-300',
          textColor: 'text-purple-900',
          accentColor: 'text-purple-600'
        };
      case 'fierce':
        return {
          bgGradient: 'from-red-50 to-orange-50',
          borderColor: 'border-red-300',
          textColor: 'text-red-900',
          accentColor: 'text-red-600'
        };
      default:
        return {
          bgGradient: 'from-gray-50 to-slate-50',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-900',
          accentColor: 'text-gray-600'
        };
    }
  };

  const styles = getPersonalityStyles(character.personality);

  if (!isOpen || !currentLine) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        style={{ padding: '2rem' }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className={`${styles.borderColor} border-2 bg-gradient-to-br ${styles.bgGradient} shadow-2xl`}>
            <CardContent className="p-6">
              {/* Character Header */}
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                  <AvatarImage src={character.avatar} alt={character.name} />
                  <AvatarFallback className={`${styles.accentColor} font-bold`}>
                    {character.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className={`font-bold text-lg ${styles.textColor}`}>
                    {character.name}
                  </h3>
                  <p className={`text-sm ${styles.accentColor} opacity-80`}>
                    {character.title}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${styles.accentColor}`}>
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">
                      {currentLineIndex + 1}/{dialogue.length}
                    </span>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className={`${styles.textColor} hover:bg-white/20`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Dialogue Content */}
              <div className={`${styles.textColor} space-y-4`}>
                <motion.div
                  key={currentLineIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <p className="text-lg leading-relaxed">
                    {currentLine.text}
                    {isTyping && (
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className={`${styles.accentColor} ml-1`}
                      >
                        |
                      </motion.span>
                    )}
                  </p>
                </motion.div>

                {/* Choices */}
                <AnimatePresence>
                  {showChoices && currentLine.choices && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-2 pt-4 border-t border-white/20"
                    >
                      {currentLine.choices.map((choice, index) => (
                        <motion.div
                          key={choice.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Button
                            variant={selectedChoice === choice.id ? "default" : "outline"}
                            onClick={() => handleChoiceSelect(choice.id)}
                            disabled={selectedChoice !== null}
                            className={`w-full text-left justify-start ${
                              selectedChoice === choice.id 
                                ? `bg-gradient-to-r ${styles.bgGradient} ${styles.textColor}` 
                                : `${styles.borderColor} ${styles.textColor} hover:bg-white/20`
                            }`}
                          >
                            <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
                            {choice.text}
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Continue Button */}
                {!isTyping && !showChoices && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-end pt-4"
                  >
                    <Button
                      onClick={nextLine}
                      className={`bg-gradient-to-r ${styles.bgGradient} ${styles.textColor} hover:opacity-80 border ${styles.borderColor}`}
                    >
                      {isLastLine ? 'Begin Adventure' : 'Continue'}
                    </Button>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}