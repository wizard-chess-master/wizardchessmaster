/**
 * Emotion Indicator Component
 * Visual representation of the wizard's understanding of player emotions
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible';
import { ChevronDown, Brain, Heart, Eye } from 'lucide-react';
import { emotionEngine, type PlayerEmotion } from '../../lib/emotion/emotionRecognition';

interface EmotionIndicatorProps {
  className?: string;
}

export function EmotionIndicator({ className = '' }: EmotionIndicatorProps) {
  const [currentEmotion, setCurrentEmotion] = useState<{
    emotion: PlayerEmotion;
    confidence: number;
  }>({ emotion: 'focused', confidence: 0.5 });
  
  const [emotionTrends, setEmotionTrends] = useState<{
    emotion: PlayerEmotion;
    count: number;
  }[]>([]);
  
  const [showDetails, setShowDetails] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    // Update emotion display every few seconds
    const interval = setInterval(() => {
      const emotion = emotionEngine.getCurrentEmotion();
      const trends = emotionEngine.getEmotionTrends();
      
      setCurrentEmotion(emotion);
      setEmotionTrends(trends);
      setLastUpdate(Date.now());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getEmotionColor = (emotion: PlayerEmotion): string => {
    const colors: Record<PlayerEmotion, string> = {
      confident: 'bg-blue-500 text-white',
      frustrated: 'bg-red-500 text-white',
      focused: 'bg-green-500 text-white',
      excited: 'bg-yellow-500 text-black',
      anxious: 'bg-orange-500 text-white',
      satisfied: 'bg-purple-500 text-white',
      curious: 'bg-indigo-500 text-white',
      determined: 'bg-gray-700 text-white'
    };
    return colors[emotion] || 'bg-gray-400 text-black';
  };

  const getEmotionEmoji = (emotion: PlayerEmotion): string => {
    const emojis: Record<PlayerEmotion, string> = {
      confident: '😎',
      frustrated: '😤',
      focused: '🎯',
      excited: '🤩',
      anxious: '😰',
      satisfied: '😌',
      curious: '🤔',
      determined: '💪'
    };
    return emojis[emotion] || '🤖';
  };

  const getEmotionDescription = (emotion: PlayerEmotion): string => {
    const descriptions: Record<PlayerEmotion, string> = {
      confident: 'Playing with assurance and skill',
      frustrated: 'Facing challenges, needs encouragement',
      focused: 'Deep in strategic thought',
      excited: 'Energized by recent successes',
      anxious: 'Feeling uncertain, could use guidance',
      satisfied: 'Content with current progress',
      curious: 'Exploring different possibilities',
      determined: 'Pushing through difficulties with resolve'
    };
    return descriptions[emotion] || 'Analyzing behavior patterns';
  };

  const getConfidenceLevel = (confidence: number): string => {
    if (confidence > 0.8) return 'Very High';
    if (confidence > 0.6) return 'High';
    if (confidence > 0.4) return 'Medium';
    if (confidence > 0.2) return 'Low';
    return 'Very Low';
  };

  const handleForceAnalysis = () => {
    const response = emotionEngine.forceEmotionAnalysis();
    setCurrentEmotion({
      emotion: response.emotion,
      confidence: response.confidence
    });
    console.log('🎭 Forced emotion analysis:', response);
  };

  return (
    <Card className={`emotion-indicator medieval-panel ${className}`}>
      <Collapsible open={showDetails} onOpenChange={setShowDetails}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-3 justify-between hover:bg-medieval-primary/10"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-medieval-accent" />
              <span className="text-sm font-medium">Wizard's Insight</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {/* Current Emotion Display */}
            <div className="text-center space-y-2">
              <div className="text-2xl">
                {getEmotionEmoji(currentEmotion.emotion)}
              </div>
              <Badge 
                className={`${getEmotionColor(currentEmotion.emotion)} px-3 py-1`}
                variant="secondary"
              >
                {currentEmotion.emotion.charAt(0).toUpperCase() + currentEmotion.emotion.slice(1)}
              </Badge>
              <p className="text-xs text-gray-600 px-2">
                {getEmotionDescription(currentEmotion.emotion)}
              </p>
            </div>

            {/* Confidence Indicator */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Confidence:</span>
                <span>{getConfidenceLevel(currentEmotion.confidence)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-medieval-accent h-2 rounded-full transition-all duration-500"
                  style={{ width: `${currentEmotion.confidence * 100}%` }}
                />
              </div>
            </div>

            {/* Recent Emotion Trends */}
            {emotionTrends.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-700">Recent Patterns:</h4>
                <div className="flex flex-wrap gap-1">
                  {emotionTrends.slice(0, 4).map(({ emotion, count }) => (
                    count > 0 && (
                      <Badge
                        key={emotion}
                        variant="outline"
                        className="text-xs px-2 py-0 h-5"
                      >
                        {getEmotionEmoji(emotion)} {count}
                      </Badge>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceAnalysis}
                className="flex-1 text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                Analyze Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => emotionEngine.resetBehaviorData()}
                className="flex-1 text-xs"
              >
                <Heart className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>

            {/* Last Update Time */}
            <p className="text-xs text-gray-500 text-center">
              Updated {Math.round((Date.now() - lastUpdate) / 1000)}s ago
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default EmotionIndicator;