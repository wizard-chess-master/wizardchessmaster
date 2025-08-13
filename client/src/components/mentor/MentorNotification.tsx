import React, { useState, useEffect } from 'react';
import { useDynamicAIMentor, MentorFeedback } from '../../lib/stores/useDynamicAIMentor';
// import { useAudio } from '../../lib/stores/useAudio'; // Not needed for voice synthesis
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { X, Volume2, VolumeX } from 'lucide-react';

// Global test function for debugging speech synthesis
if (typeof window !== 'undefined') {
  (window as any).testAICoachSpeech = () => {
    console.log('🎤 Testing AI Coach Speech Synthesis...');
    
    if (!('speechSynthesis' in window)) {
      console.error('❌ Speech synthesis not supported in this browser');
      return false;
    }
    
    const testMessage = "Testing AI coach voice. If you hear this, speech synthesis is working.";
    const utterance = new SpeechSynthesisUtterance(testMessage);
    
    utterance.onstart = () => console.log('✅ Speech started');
    utterance.onend = () => console.log('✅ Speech completed');
    utterance.onerror = (e) => console.error('❌ Speech error:', e);
    
    speechSynthesis.cancel(); // Clear any pending speech
    speechSynthesis.speak(utterance);
    
    console.log('Available voices:', speechSynthesis.getVoices().map(v => `${v.name} (${v.lang})`));
    return true;
  };
}

export function MentorNotification() {
  const { currentFeedback } = useDynamicAIMentor();
  const [visibleFeedback, setVisibleFeedback] = useState<MentorFeedback | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [speechFailed, setSpeechFailed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Show latest feedback in persistent panel
  useEffect(() => {
    if (currentFeedback.length > 0) {
      const latestFeedback = currentFeedback[currentFeedback.length - 1];
      
      // Only show if it's a new feedback (not already visible)
      if (!visibleFeedback || latestFeedback.id !== visibleFeedback.id) {
        setVisibleFeedback(latestFeedback);
        setSpeechFailed(false); // Reset speech failure state for new message

        // Play voice narration if enabled with longer delay for stability
        if (isVoiceEnabled) {
          setTimeout(() => {
            speakFeedback(latestFeedback.message);
          }, 1200); // Longer delay to ensure clean audio and avoid game sound overlap
        }
      }
    }
  }, [currentFeedback, isVoiceEnabled, visibleFeedback]);

  const speakFeedback = (message: string) => {
    try {
      if ('speechSynthesis' in window) {
        console.log('🎤 AI Coach attempting to speak:', message.substring(0, 50) + '...');
        
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
            console.log(`🎤 Available voices: ${voices.length}`);
            
            // Log available voices for debugging
            if (voices.length === 0) {
              console.warn('⚠️ No voices available for AI Coach!');
              return;
            }
            
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
              voices.find(voice => voice.lang.startsWith('en')) ||
              // Last fallback: Any voice
              voices[0];
            
            if (preferredVoice) {
              utterance.voice = preferredVoice;
              console.log('🎤 AI Coach using voice:', preferredVoice.name, preferredVoice.lang);
            } else {
              console.warn('⚠️ No suitable voice found for AI Coach');
            }
            
            // Add comprehensive error handling
            utterance.onerror = (event) => {
              console.error('❌ AI Coach speech error:', event.error || 'Unknown error');
              console.error('Error details:', event);
              setSpeechFailed(true);
              setIsSpeaking(false);
            };
            
            utterance.onstart = () => {
              console.log('🎤 AI Coach started speaking');
              setIsSpeaking(true);
              setSpeechFailed(false);
            };
            
            utterance.onend = () => {
              console.log('✅ AI Coach finished speaking');
              setIsSpeaking(false);
            };
            
            // Speak with additional checks
            if (speechSynthesis.speaking) {
              console.warn('⚠️ AI Coach: Speech synthesis already speaking, cancelling first');
              speechSynthesis.cancel();
              setTimeout(() => {
                speechSynthesis.speak(utterance);
                console.log('🎤 AI Coach speech queued (after cancel)');
              }, 100);
            } else if (speechSynthesis.pending) {
              console.warn('⚠️ AI Coach: Speech synthesis has pending utterances');
              speechSynthesis.speak(utterance);
              console.log('🎤 AI Coach speech queued (with pending)');
            } else {
              speechSynthesis.speak(utterance);
              console.log('🎤 AI Coach speech queued');
            }
          };
          
          // Ensure voices are loaded before speaking
          if (speechSynthesis.getVoices().length > 0) {
            console.log('🎤 Voices already loaded, speaking immediately');
            setVoiceAndSpeak();
          } else {
            console.log('⏳ Waiting for voices to load...');
            // Wait for voices to load with timeout
            let voiceTimeout = setTimeout(() => {
              console.log('⚠️ Voice loading timeout, attempting with available voices');
              setVoiceAndSpeak();
            }, 1000);
            
            speechSynthesis.onvoiceschanged = () => {
              clearTimeout(voiceTimeout);
              console.log('🎤 Voices loaded via onvoiceschanged event');
              setVoiceAndSpeak();
            };
          }
        }, 200); // Longer delay for stability
      } else {
        console.error('❌ Speech synthesis not available in this browser');
      }
    } catch (error) {
      console.error('❌ AI Coach voice synthesis error:', error);
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

  if (!visibleFeedback) {
    return (
      <div className="text-purple-200 text-sm text-center py-4">
        <p>No messages yet. Start playing to receive guidance!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="bg-purple-800/50 border border-purple-400 rounded-md p-3">
        <div className="flex items-start gap-2 mb-2">
          <div className="text-lg">{getFeedbackIcon(visibleFeedback.type)}</div>
          <div className="text-xs text-purple-300 capitalize flex items-center gap-1">
            {visibleFeedback.type}
            {/* Speech status indicators */}
            {isVoiceEnabled && isSpeaking && (
              <span className="text-green-400 animate-pulse" title="Speaking...">●</span>
            )}
            {isVoiceEnabled && speechFailed && (
              <span className="text-yellow-400" title="Speech unavailable">⚠️</span>
            )}
          </div>
        </div>
        <p className="text-sm text-purple-100 leading-relaxed">
          {visibleFeedback.message}
        </p>
        {visibleFeedback.context?.learningPoint && (
          <div className="text-xs mt-2 text-purple-200 opacity-75">
            💡 {visibleFeedback.context.learningPoint}
          </div>
        )}
        {/* Show fallback message if speech failed */}
        {isVoiceEnabled && speechFailed && (
          <div className="text-xs mt-2 text-yellow-400">
            ⚠️ Voice unavailable - displaying text only
          </div>
        )}
        <div className="text-xs text-purple-300 mt-2">
          {new Date(visibleFeedback.timestamp).toLocaleTimeString()}
        </div>
      </div>
      
      <div className="flex justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if ('speechSynthesis' in window) {
              speechSynthesis.cancel();
            }
            setIsVoiceEnabled(!isVoiceEnabled);
            setSpeechFailed(false); // Reset speech failure when toggling
          }}
          className="h-6 px-2 text-purple-300 hover:text-purple-100 hover:bg-purple-700/50"
          title={isVoiceEnabled ? "Disable voice" : "Enable voice"}
        >
          {isVoiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          <span className="ml-1 text-xs">{isVoiceEnabled ? "Voice On" : "Voice Off"}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if ('speechSynthesis' in window) {
              speechSynthesis.cancel();
            }
            setVisibleFeedback(null);
            setSpeechFailed(false);
            setIsSpeaking(false);
          }}
          className="h-6 px-2 text-purple-300 hover:text-purple-100 hover:bg-purple-700/50"
        >
          <X size={12} />
          <span className="ml-1 text-xs">Clear</span>
        </Button>
      </div>
    </div>
  );
}