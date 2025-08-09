import React, { useState, useEffect } from 'react';
import { useDynamicAIMentor, MentorFeedback } from '../../lib/stores/useDynamicAIMentor';
// import { useAudio } from '../../lib/stores/useAudio'; // Not needed for voice synthesis
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { X, Volume2, VolumeX } from 'lucide-react';

export function MentorNotification() {
  const { currentFeedback } = useDynamicAIMentor();
  const [visibleFeedback, setVisibleFeedback] = useState<MentorFeedback | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  // Show latest feedback as notification
  useEffect(() => {
    if (currentFeedback.length > 0) {
      const latestFeedback = currentFeedback[currentFeedback.length - 1];
      setVisibleFeedback(latestFeedback);
      
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setVisibleFeedback(null);
      }, 8000);

      // Play voice narration if enabled
      if (isVoiceEnabled) {
        setTimeout(() => {
          speakFeedback(latestFeedback.message);
        }, 500); // Small delay to avoid overlapping with game sounds
      }

      return () => clearTimeout(timer);
    }
  }, [currentFeedback, isVoiceEnabled]);

  const speakFeedback = (message: string) => {
    try {
      // Use Web Speech API for text-to-speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.7;
        
        // Try to use a more wizard-like voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Daniel') || 
          voice.name.includes('Alex') || 
          voice.name.includes('Fred') ||
          voice.lang.includes('en-GB')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.log('Voice synthesis not available:', error);
    }
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'encouragement': return '🛡️';
      case 'strategy': return '💡';
      case 'warning': return '⚠️';
      case 'celebration': return '🎉';
      case 'analysis': return '📊';
      default: return '🧙‍♂️';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-400 bg-red-50 text-red-800';
      case 'high': return 'border-orange-400 bg-orange-50 text-orange-800';
      case 'medium': return 'border-blue-400 bg-blue-50 text-blue-800';
      case 'low': return 'border-gray-400 bg-gray-50 text-gray-600';
      default: return 'border-blue-400 bg-blue-50 text-blue-800';
    }
  };

  if (!visibleFeedback) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-right duration-500">
      <Card className={`border-2 shadow-lg ${getPriorityColor(visibleFeedback.priority)}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{getFeedbackIcon(visibleFeedback.type)}</div>
            
            <div className="flex-1">
              <div className="font-medium text-sm mb-1">
                AI Mentor
              </div>
              <div className="text-sm leading-relaxed">
                {visibleFeedback.message}
              </div>
              {visibleFeedback.context?.learningPoint && (
                <div className="text-xs mt-2 opacity-75">
                  💡 {visibleFeedback.context.learningPoint}
                </div>
              )}
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className="h-6 w-6 p-0"
                title={isVoiceEnabled ? "Disable voice" : "Enable voice"}
              >
                {isVoiceEnabled ? 
                  <Volume2 className="h-3 w-3" /> : 
                  <VolumeX className="h-3 w-3" />
                }
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVisibleFeedback(null)}
                className="h-6 w-6 p-0"
                title="Close"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}