import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { X, ChevronRight, ChevronLeft, Play, Pause } from 'lucide-react';
import { useAudio } from '../../lib/stores/useAudio';

interface StoryScene {
  id: string;
  text: string;
  speaker?: string;
  backgroundImage?: string;
  characterImage?: string;
  soundEffect?: string;
  duration?: number;
}

interface StoryboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  story: {
    title: string;
    scenes: StoryScene[];
    type: 'pre-game' | 'post-win' | 'character-intro' | 'victory-celebration';
  };
}

export function StoryboardModal({ isOpen, onClose, onComplete, story }: StoryboardModalProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const { playGameEvent } = useAudio();

  const currentScene = story.scenes[currentSceneIndex];
  const isLastScene = currentSceneIndex === story.scenes.length - 1;

  // Auto-advance scenes
  useEffect(() => {
    if (!isAutoPlaying || !currentScene) return;

    const duration = currentScene.duration || 4000;
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / 100));
        if (newProgress >= 100) {
          if (isLastScene) {
            onComplete();
          } else {
            nextScene();
          }
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentSceneIndex, isAutoPlaying, currentScene, isLastScene, onComplete]);

  // Play audio when scene changes
  useEffect(() => {
    if (currentScene?.soundEffect) {
      playGameEvent(currentScene.soundEffect);
    }
  }, [currentSceneIndex, currentScene, playGameEvent]);

  const nextScene = () => {
    if (!isLastScene) {
      setCurrentSceneIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onComplete();
    }
  };

  const previousScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
    setProgress(0);
  };

  if (!isOpen || !currentScene) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      >
        {/* Background Image */}
        {currentScene.backgroundImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${currentScene.backgroundImage})` }}
          />
        )}

        {/* Story Content */}
        <motion.div
          key={currentSceneIndex}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto"
        >
          <Card className="overflow-hidden shadow-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{story.title}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-90">
                    Scene {currentSceneIndex + 1} of {story.scenes.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <Progress 
                  value={progress} 
                  className="h-2 bg-white/20"
                />
              </div>
            </div>

            <CardContent className="p-8">
              <div className="flex gap-8 items-center min-h-[400px]">
                {/* Character Image */}
                {currentScene.characterImage && (
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <img
                      src={currentScene.characterImage}
                      alt={currentScene.speaker || 'Character'}
                      className="w-48 h-48 object-cover rounded-lg shadow-lg"
                    />
                  </motion.div>
                )}

                {/* Story Text */}
                <div className="flex-1 space-y-4">
                  {currentScene.speaker && (
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg font-semibold text-amber-800"
                    >
                      {currentScene.speaker}
                    </motion.div>
                  )}
                  
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-amber-900 text-lg leading-relaxed"
                  >
                    {currentScene.text}
                  </motion.div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-amber-200">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={previousScene}
                    disabled={currentSceneIndex === 0}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={toggleAutoPlay}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    {isAutoPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isAutoPlaying ? 'Pause' : 'Play'}
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="text-amber-600 hover:text-amber-800"
                  >
                    Skip Story
                  </Button>
                  
                  <Button
                    onClick={nextScene}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {isLastScene ? 'Start Game' : 'Next'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}