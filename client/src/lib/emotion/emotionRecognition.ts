/**
 * Adaptive Wizard Emotion Recognition Interface
 * Analyzes player behavior patterns to determine emotional state and provide appropriate responses
 */

export type PlayerEmotion = 
  | 'confident' 
  | 'frustrated' 
  | 'focused' 
  | 'excited' 
  | 'anxious' 
  | 'satisfied' 
  | 'curious' 
  | 'determined';

export type EmotionTrigger = 
  | 'quick_moves' 
  | 'long_pauses' 
  | 'repetitive_actions' 
  | 'successful_streak' 
  | 'error_pattern' 
  | 'exploration_behavior' 
  | 'comeback_attempt' 
  | 'learning_signs';

interface PlayerBehaviorData {
  moveTimings: number[]; // Array of time taken for recent moves
  moveQuality: number[]; // Array of move quality scores (0-100)
  repetitiveActions: number; // Count of similar actions in short time
  pauseDurations: number[]; // Array of pause lengths between moves
  errorCount: number; // Recent mistakes count
  successStreak: number; // Current winning/good move streak
  explorationClicks: number; // Clicks on different pieces without moving
  undoUsage: number; // Recent undo button usage
  hintRequests: number; // Recent hint requests
  lastEmotionUpdate: number; // Timestamp of last emotion analysis
}

interface EmotionResponse {
  emotion: PlayerEmotion;
  confidence: number; // 0-1 confidence in the emotion detection
  voiceClip?: string; // Suggested voice clip to play
  visualEffect?: string; // Visual effect to trigger
  encouragement?: string; // Text encouragement
  suggestion?: string; // Gameplay suggestion
}

class EmotionRecognitionEngine {
  private behaviorData: PlayerBehaviorData = {
    moveTimings: [],
    moveQuality: [],
    repetitiveActions: 0,
    pauseDurations: [],
    errorCount: 0,
    successStreak: 0,
    explorationClicks: 0,
    undoUsage: 0,
    hintRequests: 0,
    lastEmotionUpdate: Date.now()
  };

  private recentEmotions: { emotion: PlayerEmotion; timestamp: number }[] = [];
  private currentEmotion: PlayerEmotion = 'focused';
  private emotionConfidence = 0.5;

  /**
   * Record player behavior data for emotion analysis
   */
  recordPlayerAction(action: string, data?: any): void {
    const now = Date.now();
    const timeSinceLastUpdate = now - this.behaviorData.lastEmotionUpdate;

    switch (action) {
      case 'move_made':
        if (data?.moveTime) {
          this.behaviorData.moveTimings.push(data.moveTime);
          if (this.behaviorData.moveTimings.length > 10) {
            this.behaviorData.moveTimings.shift(); // Keep only recent 10 moves
          }
        }
        if (data?.quality) {
          this.behaviorData.moveQuality.push(data.quality);
          if (this.behaviorData.moveQuality.length > 10) {
            this.behaviorData.moveQuality.shift();
          }
        }
        // Reset exploration clicks after a move
        this.behaviorData.explorationClicks = 0;
        break;

      case 'piece_clicked':
        this.behaviorData.explorationClicks++;
        break;

      case 'long_pause':
        if (data?.duration) {
          this.behaviorData.pauseDurations.push(data.duration);
          if (this.behaviorData.pauseDurations.length > 5) {
            this.behaviorData.pauseDurations.shift();
          }
        }
        break;

      case 'error_made':
        this.behaviorData.errorCount++;
        this.behaviorData.successStreak = 0;
        break;

      case 'good_move':
        this.behaviorData.successStreak++;
        this.behaviorData.errorCount = Math.max(0, this.behaviorData.errorCount - 1);
        break;

      case 'undo_used':
        this.behaviorData.undoUsage++;
        break;

      case 'hint_requested':
        this.behaviorData.hintRequests++;
        break;

      case 'repetitive_action':
        this.behaviorData.repetitiveActions++;
        break;
    }

    // Trigger emotion analysis if enough time has passed or significant behavior change
    if (timeSinceLastUpdate > 15000 || this.shouldTriggerEmotionUpdate(action)) {
      this.analyzeEmotion();
    }
  }

  /**
   * Analyze current player emotion based on behavior data
   */
  private analyzeEmotion(): EmotionResponse {
    const emotions = this.calculateEmotionScores();
    const dominantEmotion = Object.entries(emotions)
      .sort(([,a], [,b]) => b - a)[0] as [PlayerEmotion, number];
    
    const [emotion, score] = dominantEmotion;
    this.currentEmotion = emotion;
    this.emotionConfidence = Math.min(score, 1.0);

    // Record emotion history
    this.recentEmotions.push({
      emotion,
      timestamp: Date.now()
    });

    // Keep only recent emotions (last 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.recentEmotions = this.recentEmotions.filter(e => e.timestamp > fiveMinutesAgo);

    this.behaviorData.lastEmotionUpdate = Date.now();
    
    const response = this.generateEmotionResponse(emotion, this.emotionConfidence);
    
    console.log('🎭 Emotion Analysis:', {
      emotion,
      confidence: this.emotionConfidence,
      behaviorFactors: this.getBehaviorSummary()
    });

    return response;
  }

  /**
   * Calculate emotion scores based on behavior patterns
   */
  private calculateEmotionScores(): Record<PlayerEmotion, number> {
    const scores: Record<PlayerEmotion, number> = {
      confident: 0,
      frustrated: 0,
      focused: 0,
      excited: 0,
      anxious: 0,
      satisfied: 0,
      curious: 0,
      determined: 0
    };

    // Analyze move timings
    const avgMoveTime = this.behaviorData.moveTimings.length > 0 
      ? this.behaviorData.moveTimings.reduce((a, b) => a + b, 0) / this.behaviorData.moveTimings.length 
      : 10000;

    const avgPauseTime = this.behaviorData.pauseDurations.length > 0
      ? this.behaviorData.pauseDurations.reduce((a, b) => a + b, 0) / this.behaviorData.pauseDurations.length
      : 5000;

    const avgMoveQuality = this.behaviorData.moveQuality.length > 0
      ? this.behaviorData.moveQuality.reduce((a, b) => a + b, 0) / this.behaviorData.moveQuality.length
      : 50;

    // Quick moves with high quality = confident
    if (avgMoveTime < 8000 && avgMoveQuality > 70) {
      scores.confident += 0.8;
    }

    // Long pauses with exploration = focused/curious
    if (avgPauseTime > 15000 && this.behaviorData.explorationClicks > 3) {
      scores.focused += 0.6;
      scores.curious += 0.7;
    }

    // Repetitive actions + errors = frustrated
    if (this.behaviorData.repetitiveActions > 2 && this.behaviorData.errorCount > 2) {
      scores.frustrated += 0.9;
    }

    // Success streak = excited/satisfied
    if (this.behaviorData.successStreak > 3) {
      scores.excited += 0.7;
      scores.satisfied += 0.8;
    }

    // Frequent undos/hints = anxious
    if (this.behaviorData.undoUsage > 2 || this.behaviorData.hintRequests > 2) {
      scores.anxious += 0.6;
    }

    // Comeback patterns = determined
    if (this.behaviorData.errorCount > 0 && this.behaviorData.successStreak > 1) {
      scores.determined += 0.8;
    }

    // High exploration without moves = curious
    if (this.behaviorData.explorationClicks > 5) {
      scores.curious += 0.9;
    }

    // Default to focused if no strong signals
    if (Math.max(...Object.values(scores)) < 0.3) {
      scores.focused = 0.5;
    }

    return scores;
  }

  /**
   * Generate appropriate response for detected emotion
   */
  private generateEmotionResponse(emotion: PlayerEmotion, confidence: number): EmotionResponse {
    const responses: Record<PlayerEmotion, Omit<EmotionResponse, 'emotion' | 'confidence'>> = {
      confident: {
        voiceClip: 'good_move',
        visualEffect: 'confident_glow',
        encouragement: "Your strategic confidence shines through!",
        suggestion: "Keep maintaining this excellent pace."
      },
      frustrated: {
        voiceClip: 'encouragement',
        visualEffect: 'calming_aura',
        encouragement: "Every master has faced such challenges. Stay focused.",
        suggestion: "Take a moment to consider your options carefully."
      },
      focused: {
        voiceClip: 'turn_start',
        visualEffect: 'focus_highlight',
        encouragement: "Your concentration is admirable.",
        suggestion: "Trust your analytical mind."
      },
      excited: {
        voiceClip: 'good_move',
        visualEffect: 'excitement_sparkles',
        encouragement: "Your enthusiasm fuels your success!",
        suggestion: "Channel this energy into your next moves."
      },
      anxious: {
        voiceClip: 'hint',
        visualEffect: 'reassuring_glow',
        encouragement: "Breathe deeply. You have the skills to succeed.",
        suggestion: "Consider asking for a hint if you need guidance."
      },
      satisfied: {
        voiceClip: 'win',
        visualEffect: 'satisfaction_ripple',
        encouragement: "Well played! Your progress is evident.",
        suggestion: "Build upon this momentum."
      },
      curious: {
        voiceClip: 'turn_start',
        visualEffect: 'curiosity_particles',
        encouragement: "Your inquisitive nature will serve you well.",
        suggestion: "Explore different possibilities before deciding."
      },
      determined: {
        voiceClip: 'good_move',
        visualEffect: 'determination_aura',
        encouragement: "Your resolve strengthens with each challenge.",
        suggestion: "Stay the course - persistence pays off."
      }
    };

    return {
      emotion,
      confidence,
      ...responses[emotion]
    };
  }

  /**
   * Get current emotion state
   */
  getCurrentEmotion(): { emotion: PlayerEmotion; confidence: number } {
    return {
      emotion: this.currentEmotion,
      confidence: this.emotionConfidence
    };
  }

  /**
   * Force emotion analysis (for testing or manual triggers)
   */
  forceEmotionAnalysis(): EmotionResponse {
    return this.analyzeEmotion();
  }

  /**
   * Reset behavior tracking (for new games)
   */
  resetBehaviorData(): void {
    this.behaviorData = {
      moveTimings: [],
      moveQuality: [],
      repetitiveActions: 0,
      pauseDurations: [],
      errorCount: 0,
      successStreak: 0,
      explorationClicks: 0,
      undoUsage: 0,
      hintRequests: 0,
      lastEmotionUpdate: Date.now()
    };
    this.currentEmotion = 'focused';
    this.emotionConfidence = 0.5;
    console.log('🎭 Emotion tracking reset for new game');
  }

  /**
   * Get behavior summary for debugging
   */
  private getBehaviorSummary() {
    return {
      avgMoveTime: this.behaviorData.moveTimings.length > 0 
        ? Math.round(this.behaviorData.moveTimings.reduce((a, b) => a + b, 0) / this.behaviorData.moveTimings.length)
        : 0,
      avgQuality: this.behaviorData.moveQuality.length > 0
        ? Math.round(this.behaviorData.moveQuality.reduce((a, b) => a + b, 0) / this.behaviorData.moveQuality.length)
        : 0,
      errorCount: this.behaviorData.errorCount,
      successStreak: this.behaviorData.successStreak,
      explorationClicks: this.behaviorData.explorationClicks,
      hintsUsed: this.behaviorData.hintRequests
    };
  }

  /**
   * Determine if significant behavior change warrants immediate emotion update
   */
  private shouldTriggerEmotionUpdate(action: string): boolean {
    const triggerActions = ['error_made', 'good_move', 'hint_requested', 'undo_used'];
    const significantCounts = {
      errorCount: this.behaviorData.errorCount >= 2,
      successStreak: this.behaviorData.successStreak >= 3,
      explorationClicks: this.behaviorData.explorationClicks >= 5
    };

    return triggerActions.includes(action) || Object.values(significantCounts).some(Boolean);
  }

  /**
   * Get emotion trends over time
   */
  getEmotionTrends(): { emotion: PlayerEmotion; count: number }[] {
    const emotionCounts: Record<PlayerEmotion, number> = {
      confident: 0, frustrated: 0, focused: 0, excited: 0,
      anxious: 0, satisfied: 0, curious: 0, determined: 0
    };

    this.recentEmotions.forEach(({ emotion }) => {
      emotionCounts[emotion]++;
    });

    return Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion: emotion as PlayerEmotion, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export const emotionEngine = new EmotionRecognitionEngine();