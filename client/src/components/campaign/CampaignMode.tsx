import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, BookOpen, Map, Play } from 'lucide-react';
import { useCampaign } from '../../lib/stores/useCampaign';
import { useChess } from '../../lib/stores/useChess';
import { CampaignMapView } from './CampaignMapView';
import { StoryboardModal } from './StoryboardModal';
import { CharacterDialogue } from './CharacterDialogue';
import type { CampaignLevel } from '../../lib/stores/useCampaign';

interface CampaignModeProps {
  onBackToMenu: () => void;
}

interface StoryData {
  title: string;
  scenes: Array<{
    id: string;
    text: string;
    speaker?: string;
    backgroundImage?: string;
    characterImage?: string;
    soundEffect?: string;
    duration?: number;
  }>;
  type: 'pre-game' | 'post-win' | 'character-intro' | 'victory-celebration';
}

interface DialogueData {
  character: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    personality: 'wise' | 'encouraging' | 'mysterious' | 'fierce';
  };
  dialogue: Array<{
    id: string;
    speaker: string;
    text: string;
    emotion?: 'neutral' | 'happy' | 'serious' | 'concerned' | 'excited';
    choices?: Array<{
      id: string;
      text: string;
      response: string;
    }>;
  }>;
}

export function CampaignMode({ onBackToMenu }: CampaignModeProps) {
  const { levels, startCampaignLevel } = useCampaign();
  const { startGame } = useChess();
  
  const [showStoryboard, setShowStoryboard] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const [currentStory, setCurrentStory] = useState<StoryData | null>(null);
  const [currentDialogue, setCurrentDialogue] = useState<DialogueData | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<CampaignLevel | null>(null);

  const generateStoryFromLevel = (level: CampaignLevel, type: 'pre-game' | 'character-intro'): StoryData => {
    const storyContent = level.storyContent;
    if (!storyContent) {
      return {
        title: level.name,
        scenes: [{ id: '1', text: 'Welcome to this level!', duration: 3000 }],
        type
      };
    }

    const scenes = [];
    
    if (type === 'pre-game' && storyContent.preGameStory) {
      scenes.push({
        id: 'pre-1',
        text: storyContent.preGameStory,
        backgroundImage: `/assets/backgrounds/${level.boardVariant || 'classic'}.jpg`,
        soundEffect: 'level_start',
        duration: 5000
      });
    }
    
    if (type === 'character-intro' && storyContent.characterIntroduction) {
      scenes.push({
        id: 'intro-1',
        text: storyContent.characterIntroduction,
        speaker: 'Master Alric',
        characterImage: '/assets/characters/alric.png',
        soundEffect: 'greeting',
        duration: 6000
      });
    }

    return {
      title: level.name,
      scenes: scenes.length > 0 ? scenes : [{ id: '1', text: 'Welcome to this level!', duration: 3000 }],
      type
    };
  };

  const generateDialogueFromLevel = (level: CampaignLevel): DialogueData => {
    return {
      character: {
        id: 'alric',
        name: 'Master Alric',
        avatar: '/assets/characters/alric.png',
        title: 'The Gentle Guide',
        personality: 'wise'
      },
      dialogue: [
        {
          id: '1',
          speaker: 'Master Alric',
          text: `Welcome to ${level.name}. Are you ready to face this challenge?`,
          emotion: 'serious',
          choices: [
            { id: 'ready', text: 'I am ready, Master!', response: 'Excellent! Let us begin.' },
            { id: 'nervous', text: 'I feel nervous...', response: 'Fear not, young one. Trust in your training.' }
          ]
        },
        {
          id: '2',
          speaker: 'Master Alric', 
          text: level.description,
          emotion: 'happy'
        }
      ]
    };
  };

  const handleLevelSelect = (levelId: string) => {
    const level = levels.find(l => l.id === levelId);
    if (!level || !level.unlocked) return;

    setSelectedLevel(level);
    startCampaignLevel(levelId);
    
    // Start the campaign game with AI difficulty  
    const difficulty = level.aiStrength <= 2 ? 'easy' : level.aiStrength <= 4 ? 'medium' : 'hard';
    startGame('ai', difficulty);
    
    // Return to game view
    onBackToMenu();
  };

  const handleShowStory = (level: CampaignLevel, type: 'pre-game' | 'character-intro') => {
    const story = generateStoryFromLevel(level, type);
    setCurrentStory(story);
    setSelectedLevel(level);
    setShowStoryboard(true);
  };

  const handleShowDialogue = (level: CampaignLevel) => {
    const dialogue = generateDialogueFromLevel(level);
    setCurrentDialogue(dialogue);
    setSelectedLevel(level);
    setShowDialogue(true);
  };

  const handleStoryComplete = () => {
    setShowStoryboard(false);
    if (selectedLevel) {
      // Show character dialogue after story
      handleShowDialogue(selectedLevel);
    }
  };

  const handleDialogueComplete = () => {
    setShowDialogue(false);
    if (selectedLevel) {
      // Start the actual game
      handleLevelSelect(selectedLevel.id);
    }
  };

  return (
    <div className="campaign-mode min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <Card className="border-amber-300 bg-gradient-to-r from-amber-100 to-yellow-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={onBackToMenu}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Menu
                </Button>
                
                <div>
                  <CardTitle className="text-2xl text-amber-900 flex items-center gap-2">
                    <Map className="w-6 h-6" />
                    Campaign Mode
                  </CardTitle>
                  <p className="text-amber-700 mt-1">
                    Embark on a magical journey through the realm of Wizard Chess
                  </p>
                </div>
              </div>

              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <BookOpen className="w-4 h-4 mr-1" />
                Story Mode
              </Badge>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Campaign Map */}
      <div className="max-w-6xl mx-auto">
        <CampaignMapView
          onLevelSelect={handleLevelSelect}
          onShowStory={handleShowStory}
        />
      </div>

      {/* Storyboard Modal */}
      <AnimatePresence>
        {showStoryboard && currentStory && (
          <StoryboardModal
            isOpen={showStoryboard}
            onClose={() => setShowStoryboard(false)}
            onComplete={handleStoryComplete}
            story={currentStory}
          />
        )}
      </AnimatePresence>

      {/* Character Dialogue Modal */}
      <AnimatePresence>
        {showDialogue && currentDialogue && (
          <CharacterDialogue
            isOpen={showDialogue}
            onClose={() => setShowDialogue(false)}
            character={currentDialogue.character}
            dialogue={currentDialogue.dialogue}
            onComplete={handleDialogueComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}