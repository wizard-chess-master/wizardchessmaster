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

        // Play voice narration if enabled with longer delay for stability
        if (isVoiceEnabled) {
          setTimeout(() => {
            speakFeedback(latestFeedback.message);
          }, 1200); // Longer delay to ensure clean audio and avoid game sound overlap
        }

        return () => clearTimeout(timer);
      }
    }
  }, [currentFeedback, isVoiceEnabled, visibleFeedback]);

  const speakFeedback = (message: string) => {
    try {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech to prevent overlapping
        speechSynthesis.cancel();
        
        // Longer delay to ensure clean start
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(message);
          
          // Optimized settings for smoother, more natural speech
          utterance.rate = 0.75;     // Slower for clarity
          utterance.pitch = 0.95;    // Slightly lower for more natural sound
          utterance.volume = 0.8;    // Clearer volume
          
          // Enhanced voice selection for natural sound
          const setVoiceAndSpeak = () => {
            const voices = speechSynthesis.getVoices();
            
            // Priority order for natural-sounding voices
            const preferredVoice = 
              // First priority: High-quality English voices
              voices.find(voice => 
                voice.lang === 'en-US' && 
                (voice.name.includes('Enhanced') || voice.name.includes('Premium'))
              ) ||
              // Second priority: Standard quality male voices
              voices.find(voice => 
                voice.lang.startsWith('en') && 
                (voice.name.includes('Male') || voice.name.includes('David') || voice.name.includes('Daniel'))
              ) ||
              // Third priority: Any English voice that's not explicitly female
              voices.find(voice => 
                voice.lang.startsWith('en') && 
                !voice.name.toLowerCase().includes('female') &&
                !voice.name.toLowerCase().includes('woman')
              ) ||
              // Fallback: First available English voice
              voices.find(voice => voice.lang.startsWith('en'));
            
            if (preferredVoice) {
              utterance.voice = preferredVoice;
              console.log('🎵 Using voice:', preferredVoice.name);
            }
            
            // Add error handling to prevent stuttering
            utterance.onerror = (event) => {
              console.log('Speech error:', event);
            };
            
            utterance.onend = () => {
              console.log('Speech completed');
            };
            
            // Speak with additional checks
            if (!speechSynthesis.speaking && !speechSynthesis.pending) {
              speechSynthesis.speak(utterance);
            }
          };
          
          // Ensure voices are loaded before speaking
          if (speechSynthesis.getVoices().length > 0) {
            setVoiceAndSpeak();
          } else {
            // Wait for voices to load with timeout
            let voiceTimeout = setTimeout(() => {
              console.log('Voice loading timeout, using default');
              setVoiceAndSpeak();
            }, 1000);
            
            speechSynthesis.onvoiceschanged = () => {
              clearTimeout(voiceTimeout);
              setVoiceAndSpeak();
            };
          }
        }, 200); // Longer delay for stability
      }
    } catch (error) {
      console.log('Voice synthesis error:', error);
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