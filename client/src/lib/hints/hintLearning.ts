/**
 * Personalized Hint Learning Algorithm
 * Tracks user interactions with hints and adapts selection based on learned preferences
 */

interface HintInteraction {
  hintId: string;
  hintType: 'beginner' | 'tactical' | 'grandmaster';
  complexity: number; // 1-10 scale
  action: 'followed' | 'ignored' | 'dismissed' | 'requested_more';
  timestamp: number;
  gamePhase: 'opening' | 'middle' | 'endgame';
  difficulty: 'easy' | 'medium' | 'hard';
  position?: string; // FEN-like position identifier
}

interface UserPreferences {
  preferredComplexity: number; // 1-10 scale
  preferredHintTypes: ('beginner' | 'tactical' | 'grandmaster')[];
  responsePatterns: {
    followRate: number; // % of hints followed
    dismissRate: number; // % of hints dismissed
    requestMoreRate: number; // % requesting more hints
  };
  learningSpeed: 'slow' | 'medium' | 'fast';
  adaptationLevel: number; // 0-100, how much to adapt
}

interface LearningMetrics {
  totalInteractions: number;
  successfulHints: number; // hints that were followed
  preferenceConfidence: number; // 0-100, confidence in learned preferences
  learningProgress: number; // 0-100, overall learning progress
  lastAdaptation: number; // timestamp of last adaptation
}

class PersonalizedHintLearning {
  private interactions: HintInteraction[] = [];
  private preferences: UserPreferences;
  private metrics: LearningMetrics;
  private readonly STORAGE_KEY = 'wizard_chess_hint_learning';
  private readonly MAX_INTERACTIONS = 500; // Keep only recent interactions

  constructor() {
    this.preferences = this.getDefaultPreferences();
    this.metrics = this.getDefaultMetrics();
    this.loadFromStorage();
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      preferredComplexity: 5, // Start neutral
      preferredHintTypes: ['beginner', 'tactical'],
      responsePatterns: {
        followRate: 0,
        dismissRate: 0,
        requestMoreRate: 0
      },
      learningSpeed: 'medium',
      adaptationLevel: 50 // Start with moderate adaptation
    };
  }

  private getDefaultMetrics(): LearningMetrics {
    return {
      totalInteractions: 0,
      successfulHints: 0,
      preferenceConfidence: 0,
      learningProgress: 0,
      lastAdaptation: Date.now()
    };
  }

  /**
   * Record a user interaction with a hint
   */
  recordInteraction(interaction: Omit<HintInteraction, 'timestamp'>): void {
    const fullInteraction: HintInteraction = {
      ...interaction,
      timestamp: Date.now()
    };

    this.interactions.push(fullInteraction);
    
    // Keep only recent interactions
    if (this.interactions.length > this.MAX_INTERACTIONS) {
      this.interactions = this.interactions.slice(-this.MAX_INTERACTIONS);
    }

    // Update metrics
    this.updateMetrics();
    
    // Adapt preferences if enough data
    if (this.shouldAdapt()) {
      this.adaptPreferences();
    }

    this.saveToStorage();
    
    console.log('🧠 Hint interaction recorded:', fullInteraction);
    console.log('📊 Updated preferences:', this.preferences);
  }

  /**
   * Get personalized hint based on learned preferences
   */
  getPersonalizedHint(
    availableHints: Array<{
      id: string;
      content: string;
      type: 'beginner' | 'tactical' | 'grandmaster';
      complexity: number;
    }>,
    context: {
      difficulty: 'easy' | 'medium' | 'hard';
      gamePhase: 'opening' | 'middle' | 'endgame';
      position?: string;
    }
  ): string | null {
    if (availableHints.length === 0) return null;

    // Score each hint based on learned preferences
    const scoredHints = availableHints.map(hint => {
      let score = 0;

      // Complexity preference (higher weight for confident preferences)
      const complexityDiff = Math.abs(hint.complexity - this.preferences.preferredComplexity);
      const complexityScore = Math.max(0, 10 - complexityDiff);
      score += complexityScore * (1 + this.metrics.preferenceConfidence / 100);

      // Type preference
      if (this.preferences.preferredHintTypes.includes(hint.type)) {
        score += 15 * (1 + this.metrics.preferenceConfidence / 100);
      }

      // Historical success with similar hints
      const historicalSuccess = this.getHistoricalSuccess(hint, context);
      score += historicalSuccess * 10;

      // Adaptation level - higher levels prefer more personalized hints
      score *= (0.5 + this.preferences.adaptationLevel / 200);

      return { hint, score };
    });

    // Sort by score and return the best hint
    scoredHints.sort((a, b) => b.score - a.score);
    const selectedHint = scoredHints[0].hint;

    console.log('🎯 Personalized hint selected:', {
      hintId: selectedHint.id,
      type: selectedHint.type,
      complexity: selectedHint.complexity,
      score: scoredHints[0].score,
      preferences: this.preferences
    });

    return selectedHint.content;
  }

  /**
   * Get historical success rate for similar hints
   */
  private getHistoricalSuccess(
    hint: { type: string; complexity: number },
    context: { difficulty: string; gamePhase: string }
  ): number {
    const similarInteractions = this.interactions.filter(interaction => 
      interaction.hintType === hint.type &&
      Math.abs(interaction.complexity - hint.complexity) <= 2 &&
      interaction.difficulty === context.difficulty &&
      interaction.gamePhase === context.gamePhase
    );

    if (similarInteractions.length === 0) return 0.5; // Neutral for unknown

    const successCount = similarInteractions.filter(i => i.action === 'followed').length;
    return successCount / similarInteractions.length;
  }

  /**
   * Update learning metrics based on interactions
   */
  private updateMetrics(): void {
    this.metrics.totalInteractions = this.interactions.length;
    this.metrics.successfulHints = this.interactions.filter(i => i.action === 'followed').length;

    // Calculate preference confidence based on consistency of interactions
    if (this.interactions.length >= 10) {
      const recentInteractions = this.interactions.slice(-20);
      const consistency = this.calculateConsistency(recentInteractions);
      this.metrics.preferenceConfidence = Math.min(100, consistency * this.interactions.length / 10);
    }

    // Calculate learning progress
    this.metrics.learningProgress = Math.min(100, 
      (this.metrics.preferenceConfidence + this.interactions.length) / 2
    );

    // Update response patterns
    if (this.interactions.length > 0) {
      const total = this.interactions.length;
      this.preferences.responsePatterns = {
        followRate: (this.interactions.filter(i => i.action === 'followed').length / total) * 100,
        dismissRate: (this.interactions.filter(i => i.action === 'dismissed').length / total) * 100,
        requestMoreRate: (this.interactions.filter(i => i.action === 'requested_more').length / total) * 100
      };
    }
  }

  /**
   * Calculate consistency of user preferences
   */
  private calculateConsistency(interactions: HintInteraction[]): number {
    if (interactions.length < 5) return 0;

    const followedHints = interactions.filter(i => i.action === 'followed');
    const dismissedHints = interactions.filter(i => i.action === 'dismissed');

    if (followedHints.length === 0) return 0;

    // Check consistency in complexity preferences
    const avgFollowedComplexity = followedHints.reduce((sum, h) => sum + h.complexity, 0) / followedHints.length;
    const avgDismissedComplexity = dismissedHints.length > 0 
      ? dismissedHints.reduce((sum, h) => sum + h.complexity, 0) / dismissedHints.length 
      : 0;

    const complexityConsistency = Math.abs(avgFollowedComplexity - avgDismissedComplexity) / 10;

    // Check consistency in type preferences
    const followedTypes = followedHints.map(h => h.hintType);
    const typeConsistency = this.calculateTypeConsistency(followedTypes);

    return Math.min(100, (complexityConsistency + typeConsistency) * 50);
  }

  /**
   * Calculate type preference consistency
   */
  private calculateTypeConsistency(types: string[]): number {
    if (types.length === 0) return 0;

    const typeCounts = types.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxCount = Math.max(...Object.values(typeCounts));
    return maxCount / types.length;
  }

  /**
   * Determine if we should adapt preferences
   */
  private shouldAdapt(): boolean {
    const timeSinceLastAdaptation = Date.now() - this.metrics.lastAdaptation;
    const minInterval = 60000; // 1 minute minimum between adaptations
    
    return this.interactions.length >= 5 && 
           this.interactions.length % 5 === 0 && 
           timeSinceLastAdaptation > minInterval;
  }

  /**
   * Adapt user preferences based on interactions
   */
  private adaptPreferences(): void {
    const recentInteractions = this.interactions.slice(-20);
    const followedHints = recentInteractions.filter(i => i.action === 'followed');
    const dismissedHints = recentInteractions.filter(i => i.action === 'dismissed');

    if (followedHints.length === 0) return;

    // Adapt complexity preference
    const avgFollowedComplexity = followedHints.reduce((sum, h) => sum + h.complexity, 0) / followedHints.length;
    const adaptationRate = this.preferences.adaptationLevel / 100 * 0.3; // Max 30% change
    
    this.preferences.preferredComplexity = 
      this.preferences.preferredComplexity * (1 - adaptationRate) + 
      avgFollowedComplexity * adaptationRate;

    // Adapt type preferences
    const followedTypeCounts = followedHints.reduce((acc, hint) => {
      acc[hint.hintType] = (acc[hint.hintType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dismissedTypeCounts = dismissedHints.reduce((acc, hint) => {
      acc[hint.hintType] = (acc[hint.hintType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Update preferred types based on follow/dismiss ratio
    const allTypes: ('beginner' | 'tactical' | 'grandmaster')[] = ['beginner', 'tactical', 'grandmaster'];
    this.preferences.preferredHintTypes = allTypes.filter(type => {
      const followCount = followedTypeCounts[type] || 0;
      const dismissCount = dismissedTypeCounts[type] || 0;
      const total = followCount + dismissCount;
      
      return total === 0 || (followCount / total) > 0.3; // Keep types with >30% follow rate
    });

    // Ensure at least one type is preferred
    if (this.preferences.preferredHintTypes.length === 0) {
      this.preferences.preferredHintTypes = ['tactical'];
    }

    this.metrics.lastAdaptation = Date.now();

    console.log('🔄 Preferences adapted:', {
      complexity: this.preferences.preferredComplexity,
      types: this.preferences.preferredHintTypes,
      confidence: this.metrics.preferenceConfidence
    });
  }

  /**
   * Get current learning insights
   */
  getLearningInsights(): {
    preferences: UserPreferences;
    metrics: LearningMetrics;
    insights: string[];
  } {
    const insights: string[] = [];

    if (this.metrics.totalInteractions < 5) {
      insights.push("Learning your preferences... Try using more hints!");
    } else if (this.metrics.preferenceConfidence < 30) {
      insights.push("Still learning your style. Keep using hints for better personalization.");
    } else if (this.metrics.preferenceConfidence < 70) {
      insights.push("Getting to know your preferences! Hints are becoming more personalized.");
    } else {
      insights.push("Your preferences are well-learned! Hints are highly personalized.");
    }

    if (this.preferences.responsePatterns.followRate > 70) {
      insights.push("You follow most hints - great for learning!");
    } else if (this.preferences.responsePatterns.dismissRate > 50) {
      insights.push("You dismiss many hints - adapting to show more relevant ones.");
    }

    if (this.preferences.preferredComplexity > 7) {
      insights.push("You prefer complex, advanced hints.");
    } else if (this.preferences.preferredComplexity < 4) {
      insights.push("You prefer simpler, more direct hints.");
    }

    return {
      preferences: this.preferences,
      metrics: this.metrics,
      insights
    };
  }

  /**
   * Reset learning data
   */
  resetLearning(): void {
    this.interactions = [];
    this.preferences = this.getDefaultPreferences();
    this.metrics = this.getDefaultMetrics();
    this.saveToStorage();
    console.log('🔄 Hint learning data reset');
  }

  /**
   * Update adaptation level (user setting)
   */
  setAdaptationLevel(level: number): void {
    this.preferences.adaptationLevel = Math.max(0, Math.min(100, level));
    this.saveToStorage();
    console.log('⚙️ Adaptation level set to:', level);
  }

  /**
   * Save learning data to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        interactions: this.interactions,
        preferences: this.preferences,
        metrics: this.metrics
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save hint learning data:', error);
    }
  }

  /**
   * Load learning data from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.interactions = data.interactions || [];
        this.preferences = { ...this.getDefaultPreferences(), ...data.preferences };
        this.metrics = { ...this.getDefaultMetrics(), ...data.metrics };
        console.log('📚 Hint learning data loaded:', {
          interactions: this.interactions.length,
          confidence: this.metrics.preferenceConfidence
        });
      }
    } catch (error) {
      console.warn('Failed to load hint learning data:', error);
    }
  }
}

// Export singleton instance
export const hintLearning = new PersonalizedHintLearning();