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
      
      // Only show if it's a new feedback (not already visible)
      if (!visibleFeedback || latestFeedback.id !== visibleFeedback.id) {
        setVisibleFeedback(latestFeedback);
        
        // Auto-hide after 8 seconds
        const timer = setTimeout(() => {
          setVisibleFeedback(null);
        }, 8000);

        // Play voice narration if enabled
        if (isVoiceEnabled) {
          setTimeout(() => {
            speakFeedback(latestFeedback.message);
          }, 800); // Delay to avoid overlapping with game sounds
        }

        return () => clearTimeout(timer);
      }
    }
  }, [currentFeedback, isVoiceEnabled, visibleFeedback]);

  const speakFeedback = (message: string) => {
    try {
      // Cancel any ongoing speech to prevent overlapping
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        
        // Small delay to ensure cancel completes
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(message);
          
          // Improved voice settings for more natural sound
          utterance.rate = 0.85;
          utterance.pitch = 1.0;
          utterance.volume = 0.6;
          
          // Wait for voices to load and select the best one
          const setVoiceAndSpeak = () => {
            const voices = speechSynthesis.getVoices();
            
            // Prefer male, English voices for wizard mentor
            const preferredVoice = voices.find(voice => 
              (voice.name.includes('Male') && voice.lang.startsWith('en')) ||
              (voice.name.includes('David') && voice.lang.startsWith('en')) ||
              (voice.name.includes('Daniel') && voice.lang.startsWith('en')) ||
              (voice.name.includes('Alex') && voice.lang.startsWith('en')) ||
              (voice.lang.includes('en-GB') && !voice.name.includes('Female'))
            ) || voices.find(voice => 
              voice.lang.startsWith('en') && !voice.name.includes('Female')
            );
            
            if (preferredVoice) {
              utterance.voice = preferredVoice;
            }
            
            speechSynthesis.speak(utterance);
          };
          
          // Check if voices are loaded
          if (speechSynthesis.getVoices().length > 0) {
            setVoiceAndSpeak();
          } else {
            // Wait for voices to load
            speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
          }
        }, 100);
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
                Merlin the Wise
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
                onClick={() => {
                  // Cancel any ongoing speech when toggling
                  if ('speechSynthesis' in window) {
                    speechSynthesis.cancel();
                  }
                  setIsVoiceEnabled(!isVoiceEnabled);
                }}
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