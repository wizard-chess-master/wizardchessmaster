/**
 * Emotion Response System
 * Coordinates responses between emotion recognition and various game systems
 */

import { emotionEngine, type PlayerEmotion } from './emotionRecognition';
import { wizardVoiceSystem } from '../audio/wizardVoiceSystem';

interface EmotionResponse {
  emotion: PlayerEmotion;
  confidence: number;
  voiceResponse?: string;
  visualEffect?: string;
  adaptiveHint?: string;
  encouragement?: string;
}

class EmotionResponseSystem {
  private lastResponseTime = 0;
  private responseDelay = 10000; // 10 seconds between responses
  private currentEmotion: PlayerEmotion = 'focused';

  /**
   * Process detected emotion and trigger appropriate responses
   */
  processEmotionUpdate(emotion: PlayerEmotion, confidence: number): void {
    const now = Date.now();
    
    // Only respond if enough time has passed since last response
    if (now - this.lastResponseTime < this.responseDelay) {
      return;
    }

    // Only respond if confidence is high enough or emotion has changed significantly
    if (confidence < 0.6 && emotion === this.currentEmotion) {
      return;
    }

    this.currentEmotion = emotion;
    this.lastResponseTime = now;

    const response = this.generateResponse(emotion, confidence);
    this.executeResponse(response);

    console.log('🎭 Emotion response triggered:', response);
  }

  /**
   * Generate appropriate response for detected emotion
   */
  private generateResponse(emotion: PlayerEmotion, confidence: number): EmotionResponse {
    const responses: Record<PlayerEmotion, EmotionResponse> = {
      confident: {
        emotion,
        confidence,
        voiceResponse: 'good_move',
        visualEffect: 'confidence_glow',
        encouragement: "Your strategic confidence is impressive!"
      },
      frustrated: {
        emotion,
        confidence,
        voiceResponse: 'encouragement',
        visualEffect: 'calming_particles',
        encouragement: "Take a deep breath. Every master faces challenges.",
        adaptiveHint: "Consider taking more time to analyze the position."
      },
      focused: {
        emotion,
        confidence,
        voiceResponse: 'turn_start',
        visualEffect: 'focus_aura',
        encouragement: "Your concentration serves you well."
      },
      excited: {
        emotion,
        confidence,
        voiceResponse: 'good_move',
        visualEffect: 'excitement_burst',
        encouragement: "Channel that energy into your strategy!"
      },
      anxious: {
        emotion,
        confidence,
        voiceResponse: 'encouragement',
        visualEffect: 'reassuring_glow',
        encouragement: "Trust your instincts. You have the knowledge within.",
        adaptiveHint: "Remember, there's no rush. Take your time."
      },
      satisfied: {
        emotion,
        confidence,
        voiceResponse: 'good_move',
        visualEffect: 'satisfaction_ripples',
        encouragement: "Well executed! Your progress is evident."
      },
      curious: {
        emotion,
        confidence,
        voiceResponse: 'turn_start',
        visualEffect: 'curiosity_sparkles',
        encouragement: "Exploration leads to understanding.",
        adaptiveHint: "Your inquisitive approach will reveal new possibilities."
      },
      determined: {
        emotion,
        confidence,
        voiceResponse: 'good_move',
        visualEffect: 'determination_waves',
        encouragement: "Your resolve strengthens with every challenge."
      }
    };

    return responses[emotion];
  }

  /**
   * Execute the emotion response across various systems
   */
  private executeResponse(response: EmotionResponse): void {
    // Voice system response
    if (response.voiceResponse) {
      setTimeout(() => {
        wizardVoiceSystem.onGameEvent(response.voiceResponse as any);
      }, 500); // Small delay to avoid audio conflicts
    }

    // Visual effects (would trigger canvas effects)
    if (response.visualEffect) {
      this.triggerVisualEffect(response.visualEffect);
    }

    // UI feedback
    if (response.encouragement) {
      this.showEncouragement(response.encouragement);
    }

    // Adaptive hints
    if (response.adaptiveHint) {
      this.showAdaptiveHint(response.adaptiveHint);
    }
  }

  /**
   * Trigger visual effects on the board
   */
  private triggerVisualEffect(effectType: string): void {
    // This would interact with the chess board canvas or emotion visual effects component
    const event = new CustomEvent('emotionVisualEffect', {
      detail: { effectType, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    console.log('🎨 Visual effect triggered:', effectType);
  }

  /**
   * Show encouragement message
   */
  private showEncouragement(message: string): void {
    // This could be a toast notification or UI element
    const event = new CustomEvent('emotionEncouragement', {
      detail: { message, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    console.log('💬 Encouragement shown:', message);
  }

  /**
   * Show adaptive hint
   */
  private showAdaptiveHint(hint: string): void {
    // This could integrate with the existing hint system
    const event = new CustomEvent('emotionHint', {
      detail: { hint, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
    console.log('💡 Adaptive hint provided:', hint);
  }

  /**
   * Set response delay (for testing or customization)
   */
  setResponseDelay(delay: number): void {
    this.responseDelay = delay;
    console.log('🎭 Emotion response delay set to:', delay + 'ms');
  }

  /**
   * Force immediate emotion response (for testing)
   */
  forceResponse(): void {
    this.lastResponseTime = 0;
    const currentEmotion = emotionEngine.getCurrentEmotion();
    this.processEmotionUpdate(currentEmotion.emotion, currentEmotion.confidence);
  }

  /**
   * Reset response system
   */
  reset(): void {
    this.lastResponseTime = 0;
    this.currentEmotion = 'focused';
    console.log('🎭 Emotion response system reset');
  }
}

export const emotionResponseSystem = new EmotionResponseSystem();

// Auto-initialize emotion monitoring
let emotionCheckInterval: number;

export function startEmotionMonitoring(): void {
  if (emotionCheckInterval) {
    clearInterval(emotionCheckInterval);
  }

  emotionCheckInterval = window.setInterval(() => {
    const { emotion, confidence } = emotionEngine.getCurrentEmotion();
    emotionResponseSystem.processEmotionUpdate(emotion, confidence);
  }, 5000); // Check every 5 seconds

  console.log('🎭 Emotion monitoring started');
}

export function stopEmotionMonitoring(): void {
  if (emotionCheckInterval) {
    clearInterval(emotionCheckInterval);
    emotionCheckInterval = undefined;
  }
  console.log('🎭 Emotion monitoring stopped');
}

// Auto-start monitoring when system loads
setTimeout(() => {
  startEmotionMonitoring();
}, 2000); // Start after game initialization