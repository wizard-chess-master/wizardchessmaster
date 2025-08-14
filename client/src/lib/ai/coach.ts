/**
 * AI Coach Control Tag System
 * Implements Leela-style evaluation tags for enhanced commentary
 */

import { GameState, ChessMove } from '../chess/types';
import { evaluateMove } from '../chess/aiPlayer';
import * as tf from '@tensorflow/tfjs';

// Control tags for move quality (similar to Leela Chess Zero)
export enum MoveQualityTag {
  BRILLIANT = 'brilliant',     // > 95% quality
  EXCELLENT = 'excellent',     // 85-95% quality  
  GOOD = 'good',              // 70-85% quality
  AVERAGE = 'average',        // 50-70% quality
  INACCURACY = 'inaccuracy',  // 30-50% quality
  MISTAKE = 'mistake',        // 15-30% quality
  BLUNDER = 'blunder'         // < 15% quality
}

// Control tags for move suggestions
export enum SuggestionTag {
  TACTICAL_OPPORTUNITY = 'tactical_opportunity',
  POSITIONAL_IMPROVEMENT = 'positional_improvement',
  DEFENSIVE_NECESSITY = 'defensive_necessity',
  ENDGAME_TECHNIQUE = 'endgame_technique',
  OPENING_PRINCIPLE = 'opening_principle',
  WIZARD_SPECIAL = 'wizard_special',
  TIME_MANAGEMENT = 'time_management',
  PATTERN_RECOGNITION = 'pattern_recognition'
}

// Control tags for game context
export enum GameContextTag {
  WINNING_POSITION = 'winning_position',
  DRAWING_POSITION = 'drawing_position',
  LOSING_POSITION = 'losing_position',
  CRITICAL_MOMENT = 'critical_moment',
  TIME_PRESSURE = 'time_pressure',
  TACTICAL_PHASE = 'tactical_phase',
  STRATEGIC_PHASE = 'strategic_phase'
}

// Enhanced feedback structure with control tags
export interface EnhancedFeedback {
  message: string;
  moveQualityTag: MoveQualityTag;
  suggestionTags: SuggestionTag[];
  contextTags: GameContextTag[];
  confidence: number; // 0-1 confidence in the evaluation
  alternatives?: string[]; // Alternative moves to suggest
  learningPoints?: string[]; // Key learning points
  repetitionScore: number; // Track to avoid repetition
}

// Commentary templates based on control tags
const COMMENTARY_TEMPLATES = {
  [MoveQualityTag.BRILLIANT]: [
    "Absolutely brilliant! This move demonstrates mastery of {concept}.",
    "A stunning tactical blow! Your {piece} delivers a masterpiece.",
    "Grandmaster-level play! This {moveType} is exactly what the position demands.",
    "Phenomenal! You've found the only winning continuation."
  ],
  [MoveQualityTag.EXCELLENT]: [
    "Excellent choice! Your {piece} is perfectly placed.",
    "Strong play! This {moveType} creates multiple threats.",
    "Very well calculated! Your position improves significantly.",
    "Superb understanding of the position!"
  ],
  [MoveQualityTag.GOOD]: [
    "Good move! You're maintaining the advantage.",
    "Solid play. Your {piece} contributes to the plan.",
    "Nice continuation. Keep this momentum going.",
    "Well played. The position remains favorable."
  ],
  [MoveQualityTag.AVERAGE]: [
    "A reasonable move, though {alternative} might be stronger.",
    "This works, but consider {concept} for future positions.",
    "Playable, but missing a tactical opportunity.",
    "Adequate, though the position offers more."
  ],
  [MoveQualityTag.INACCURACY]: [
    "This allows your opponent counterplay. Consider {alternative} instead.",
    "Slightly imprecise. The {piece} would be better on {square}.",
    "This weakens your {structure}. Be careful!",
    "Not the most accurate. Look for forcing moves."
  ],
  [MoveQualityTag.MISTAKE]: [
    "This is a mistake! Your opponent can now play {threat}.",
    "Careful! This loses material after {sequence}.",
    "This compromises your position significantly.",
    "A serious error. The {weakness} is now critical."
  ],
  [MoveQualityTag.BLUNDER]: [
    "Oh no! This loses immediately to {threat}.",
    "Critical blunder! Your {piece} is now hanging.",
    "This allows checkmate in {number} moves!",
    "Devastating mistake! The game is now lost."
  ]
};

// Suggestion templates based on control tags
const SUGGESTION_TEMPLATES = {
  [SuggestionTag.TACTICAL_OPPORTUNITY]: [
    "Look for tactical shots with your {piece}!",
    "There's a winning combination starting with {move}.",
    "Can you find the tactical blow that wins material?",
    "Your pieces are aligned for a devastating tactic."
  ],
  [SuggestionTag.POSITIONAL_IMPROVEMENT]: [
    "Improve your worst-placed piece.",
    "Control the center before attacking.",
    "Your {piece} needs a better square.",
    "Create a long-term plan for your pieces."
  ],
  [SuggestionTag.DEFENSIVE_NECESSITY]: [
    "Urgent defense needed! Protect your {weakness}.",
    "Your king safety is compromised. Castle immediately!",
    "Block the attack before it's too late.",
    "Create an escape square for your king."
  ],
  [SuggestionTag.WIZARD_SPECIAL]: [
    "Your wizard can teleport to create havoc!",
    "Use the wizard's magical attack to eliminate {target}.",
    "The wizard's special ability is key here.",
    "Combine wizard magic with traditional tactics!"
  ],
  [SuggestionTag.ENDGAME_TECHNIQUE]: [
    "Focus on king activity in the endgame.",
    "Push your passed pawns forward!",
    "Centralize your king for the endgame.",
    "Create a passed pawn to secure victory."
  ],
  [SuggestionTag.OPENING_PRINCIPLE]: [
    "Develop your pieces before attacking.",
    "Control the center with pawns and pieces.",
    "Castle early to secure your king.",
    "Don't move the same piece twice in the opening."
  ],
  [SuggestionTag.TIME_MANAGEMENT]: [
    "Take your time on critical moves.",
    "Speed up in simple positions.",
    "Budget your time for the endgame.",
    "Don't rush - think before you move!"
  ],
  [SuggestionTag.PATTERN_RECOGNITION]: [
    "This position has a common tactical pattern.",
    "Look for the classic motif in this position.",
    "Pattern alert: this setup often leads to tactics.",
    "Recognize the pattern and exploit it!"
  ]
};

// Simplified control tags interface as requested
interface Tags {
  moveQuality: number; // 0-1 scale
  suggestion: string;
}

export class AICoachController {
  private recentCommentaryHistory: string[] = [];
  private moveCount: number = 0;
  private lastCommentaryMove: number = 0;
  private positionEvaluationCache: Map<string, number> = new Map();
  
  /**
   * Add control tags using existing move evaluation
   */
  async addControlTags(state: GameState, move?: ChessMove): Promise<Tags> {
    const tags: Tags = { moveQuality: 0, suggestion: '' };
    
    // Use existing evaluateMove from aiPlayer
    if (move) {
      const score = evaluateMove(state, move);
      // Normalize score to 0-1 scale (assuming score range -100 to 100)
      tags.moveQuality = Math.max(0, Math.min(1, (score + 100) / 200));
      
      // Generate contextual suggestions based on move quality
      if (tags.moveQuality < 0.3) {
        tags.suggestion = 'Consider defensive moves to protect your pieces';
      } else if (tags.moveQuality < 0.5) {
        tags.suggestion = 'Look for better piece coordination';
      } else if (tags.moveQuality < 0.7) {
        tags.suggestion = 'Good position, maintain pressure';
      } else {
        tags.suggestion = 'Excellent! Continue with tactical play';
      }
      
      // Add specific suggestions based on game state
      if (state.isInCheck) {
        tags.suggestion = 'Improve king safety immediately';
      } else if (this.hasWeakPawns(state)) {
        tags.suggestion = 'Strengthen your pawn structure';
      } else if (this.needsDevelopment(state)) {
        tags.suggestion = 'Complete piece development';
      }
    }
    
    return tags;
  }
  
  /**
   * Evaluate move quality using neural network-inspired scoring
   */
  evaluateMoveQuality(
    gameState: GameState, 
    move: ChessMove,
    engineEvaluation?: number
  ): { quality: number; tag: MoveQualityTag } {
    let quality = 50; // Base score
    
    // Use engine evaluation if available
    if (engineEvaluation !== undefined) {
      quality = this.normalizeEngineEval(engineEvaluation);
    } else {
      // Use existing evaluateMove function
      const score = evaluateMove(gameState, move);
      quality = Math.max(0, Math.min(100, 50 + score / 2));
    }
    
    // Map quality score to control tag
    const tag = this.qualityToTag(quality);
    
    return { quality, tag };
  }
  
  /**
   * Generate suggestion tags based on position
   */
  generateSuggestionTags(gameState: GameState): SuggestionTag[] {
    const tags: SuggestionTag[] = [];
    const phase = this.getGamePhase(gameState);
    
    // Phase-specific suggestions
    if (phase === 'opening') {
      tags.push(SuggestionTag.OPENING_PRINCIPLE);
    } else if (phase === 'endgame') {
      tags.push(SuggestionTag.ENDGAME_TECHNIQUE);
    }
    
    // Check for tactical opportunities
    if (this.hasTacticalOpportunity(gameState)) {
      tags.push(SuggestionTag.TACTICAL_OPPORTUNITY);
    }
    
    // Check for defensive needs
    if (this.needsDefense(gameState)) {
      tags.push(SuggestionTag.DEFENSIVE_NECESSITY);
    }
    
    // Check for wizard opportunities
    if (this.hasWizardOpportunity(gameState)) {
      tags.push(SuggestionTag.WIZARD_SPECIAL);
    }
    
    // Positional considerations
    if (tags.length === 0 && phase === 'middle') {
      tags.push(SuggestionTag.POSITIONAL_IMPROVEMENT);
    }
    
    return tags;
  }
  
  /**
   * Generate context tags for current position
   */
  generateContextTags(gameState: GameState): GameContextTag[] {
    const tags: GameContextTag[] = [];
    const evaluation = this.getPositionEvaluation(gameState);
    
    // Position assessment
    if (evaluation > 2) {
      tags.push(GameContextTag.WINNING_POSITION);
    } else if (evaluation < -2) {
      tags.push(GameContextTag.LOSING_POSITION);
    } else {
      tags.push(GameContextTag.DRAWING_POSITION);
    }
    
    // Critical moment detection
    if (this.isCriticalMoment(gameState)) {
      tags.push(GameContextTag.CRITICAL_MOMENT);
    }
    
    // Phase detection
    if (this.isTacticalPhase(gameState)) {
      tags.push(GameContextTag.TACTICAL_PHASE);
    } else {
      tags.push(GameContextTag.STRATEGIC_PHASE);
    }
    
    return tags;
  }
  
  /**
   * Generate enhanced feedback with control tags
   */
  generateEnhancedFeedback(
    gameState: GameState,
    move: ChessMove,
    engineEval?: number
  ): EnhancedFeedback | null {
    this.moveCount++;
    
    // Limit commentary frequency (1 comment per 5 moves)
    if (this.moveCount - this.lastCommentaryMove < 5) {
      return null;
    }
    
    const { quality, tag } = this.evaluateMoveQuality(gameState, move, engineEval);
    const suggestionTags = this.generateSuggestionTags(gameState);
    const contextTags = this.generateContextTags(gameState);
    
    // Generate message from templates
    const message = this.generateMessage(tag, suggestionTags, move, gameState);
    
    // Calculate repetition score
    const repetitionScore = this.calculateRepetitionScore(message);
    
    // Skip if too repetitive
    if (repetitionScore > 0.7) {
      return null;
    }
    
    // Track commentary
    this.lastCommentaryMove = this.moveCount;
    this.recentCommentaryHistory.push(message);
    if (this.recentCommentaryHistory.length > 10) {
      this.recentCommentaryHistory.shift();
    }
    
    return {
      message,
      moveQualityTag: tag,
      suggestionTags,
      contextTags,
      confidence: this.calculateConfidence(gameState, move),
      alternatives: this.generateAlternatives(gameState),
      learningPoints: this.extractLearningPoints(tag, suggestionTags),
      repetitionScore
    };
  }
  
  // Helper methods
  private normalizeEngineEval(evaluation: number): number {
    // Convert centipawn evaluation to 0-100 scale
    const clamped = Math.max(-500, Math.min(500, evaluation));
    return 50 + (clamped / 10);
  }
  
  private heuristicMoveEvaluation(gameState: GameState, move: ChessMove): number {
    let score = 50;
    
    // Piece captures
    if (move.captured) score += 15;
    
    // Special moves
    if (move.isWizardTeleport) score += 10;
    if (move.isWizardAttack) score += 20;
    if (move.isCastling) score += 12;
    
    // Central control
    const centralSquares = ['d4', 'd5', 'e4', 'e5', 'f4', 'f5'];
    const toSquare = `${String.fromCharCode(97 + move.to.col)}${10 - move.to.row}`;
    if (centralSquares.includes(toSquare)) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }
  
  private qualityToTag(quality: number): MoveQualityTag {
    if (quality > 95) return MoveQualityTag.BRILLIANT;
    if (quality > 85) return MoveQualityTag.EXCELLENT;
    if (quality > 70) return MoveQualityTag.GOOD;
    if (quality > 50) return MoveQualityTag.AVERAGE;
    if (quality > 30) return MoveQualityTag.INACCURACY;
    if (quality > 15) return MoveQualityTag.MISTAKE;
    return MoveQualityTag.BLUNDER;
  }
  
  private getGamePhase(gameState: GameState): 'opening' | 'middle' | 'endgame' {
    const moveCount = gameState.moveHistory.length;
    if (moveCount < 20) return 'opening';
    if (moveCount < 50) return 'middle';
    return 'endgame';
  }
  
  private hasTacticalOpportunity(gameState: GameState): boolean {
    // Simple heuristic - check for hanging pieces or forks
    // In real implementation, use deeper analysis
    return Math.random() < 0.3; // Placeholder
  }
  
  private needsDefense(gameState: GameState): boolean {
    // Check if king is in danger or pieces are hanging
    return gameState.isInCheck || Math.random() < 0.2; // Placeholder
  }
  
  private hasWizardOpportunity(gameState: GameState): boolean {
    // Check if wizards can make special moves
    const wizards = gameState.board.flat().filter(
      p => p?.type === 'wizard' && p.color === gameState.currentPlayer
    );
    return wizards.length > 0 && Math.random() < 0.4; // Placeholder
  }
  
  private getPositionEvaluation(gameState: GameState): number {
    const key = this.getPositionKey(gameState);
    if (this.positionEvaluationCache.has(key)) {
      return this.positionEvaluationCache.get(key)!;
    }
    
    // Simple material count evaluation
    let evaluation = 0;
    const pieceValues = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, wizard: 4, king: 0 };
    
    for (const row of gameState.board) {
      for (const piece of row) {
        if (piece) {
          const value = pieceValues[piece.type];
          evaluation += piece.color === 'white' ? value : -value;
        }
      }
    }
    
    this.positionEvaluationCache.set(key, evaluation);
    return evaluation;
  }
  
  private getPositionKey(gameState: GameState): string {
    return gameState.board.flat().map(p => p ? `${p.color[0]}${p.type[0]}` : '--').join('');
  }
  
  private isCriticalMoment(gameState: GameState): boolean {
    // Check for critical positions (checks, low material, etc.)
    return gameState.isInCheck || 
           gameState.moveHistory.length > 40 ||
           Math.abs(this.getPositionEvaluation(gameState)) > 5;
  }
  
  private isTacticalPhase(gameState: GameState): boolean {
    // Detect if position has tactical complexity
    return gameState.isInCheck || this.hasTacticalOpportunity(gameState);
  }
  
  private generateMessage(
    qualityTag: MoveQualityTag,
    suggestionTags: SuggestionTag[],
    move: ChessMove,
    gameState: GameState
  ): string {
    const templates = COMMENTARY_TEMPLATES[qualityTag];
    let template = templates[Math.floor(Math.random() * templates.length)];
    
    // Replace placeholders
    template = template.replace('{piece}', move.piece.type);
    template = template.replace('{moveType}', move.isWizardAttack ? 'wizard attack' : 'move');
    template = template.replace('{concept}', 'tactical awareness');
    template = template.replace('{square}', `${String.fromCharCode(97 + move.to.col)}${10 - move.to.row}`);
    
    // Add suggestion if applicable
    if (suggestionTags.length > 0) {
      const suggestionTemplate = SUGGESTION_TEMPLATES[suggestionTags[0]];
      if (suggestionTemplate) {
        const suggestion = suggestionTemplate[Math.floor(Math.random() * suggestionTemplate.length)];
        template += ' ' + suggestion.replace('{piece}', 'knight');
      }
    }
    
    return template;
  }
  
  private calculateRepetitionScore(message: string): number {
    if (this.recentCommentaryHistory.length === 0) return 0;
    
    // Check similarity with recent messages
    let maxSimilarity = 0;
    for (const recent of this.recentCommentaryHistory) {
      const similarity = this.stringSimilarity(message, recent);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    return maxSimilarity;
  }
  
  private stringSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  
  private levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }
  
  private calculateConfidence(gameState: GameState, move: ChessMove): number {
    // Calculate confidence based on position clarity
    const phase = this.getGamePhase(gameState);
    let confidence = 0.7;
    
    if (phase === 'opening') confidence += 0.1;
    if (move.captured) confidence += 0.1;
    
    return Math.min(1, confidence);
  }
  
  private generateAlternatives(gameState: GameState): string[] {
    // Generate alternative move suggestions
    // This would integrate with the chess engine
    return [];
  }
  
  private extractLearningPoints(tag: MoveQualityTag, suggestions: SuggestionTag[]): string[] {
    const points: string[] = [];
    
    if (tag === MoveQualityTag.BLUNDER || tag === MoveQualityTag.MISTAKE) {
      points.push('Always check for hanging pieces before moving');
      points.push('Look for opponent threats after each move');
    }
    
    if (suggestions.includes(SuggestionTag.TACTICAL_OPPORTUNITY)) {
      points.push('Practice pattern recognition for tactics');
    }
    
    if (suggestions.includes(SuggestionTag.WIZARD_SPECIAL)) {
      points.push('Remember wizard abilities for unique advantages');
    }
    
    return points;
  }
  
  // Helper methods for control tags
  private hasWeakPawns(state: GameState): boolean {
    // Check for isolated or backward pawns
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const piece = state.board[row][col];
        if (piece?.type === 'pawn' && piece.color === state.currentPlayer) {
          // Check if pawn is isolated (no friendly pawns on adjacent files)
          const hasAdjacentPawn = 
            (col > 0 && state.board[row][col - 1]?.type === 'pawn' && state.board[row][col - 1]?.color === piece.color) ||
            (col < 9 && state.board[row][col + 1]?.type === 'pawn' && state.board[row][col + 1]?.color === piece.color);
          
          if (!hasAdjacentPawn) {
            return true; // Found weak pawn
          }
        }
      }
    }
    return false;
  }
  
  private needsDevelopment(state: GameState): boolean {
    // Check if pieces need development in opening
    if (state.moveHistory.length > 15) return false; // Not in opening anymore
    
    const backRank = state.currentPlayer === 'white' ? 9 : 0;
    let undevelopedPieces = 0;
    
    // Check knights and bishops on back rank
    for (let col = 0; col < 10; col++) {
      const piece = state.board[backRank][col];
      if (piece && piece.color === state.currentPlayer) {
        if (piece.type === 'knight' || piece.type === 'bishop') {
          undevelopedPieces++;
        }
      }
    }
    
    return undevelopedPieces >= 2; // Need development if 2+ pieces still on back rank
  }
}

// Export singleton instance
export const aiCoach = new AICoachController();

// Export Tags interface for external use
export type { Tags };

/**
 * Reinforcement Learning Commentary System
 * Uses reward model to optimize commentary generation
 */
class RLCommentarySystem {
  private commentCount: number = 0;
  private rewardModel!: tf.Sequential; // Will be initialized in constructor
  private lastComment: string = '';
  private commentHistory: string[] = [];
  private isModelReady: boolean = false;
  
  constructor() {
    this.initializeRewardModel();
  }
  
  private async initializeRewardModel() {
    // Create reward model for RL
    this.rewardModel = tf.sequential({
      layers: [
        tf.layers.dense({ 
          units: 32, 
          activation: 'relu', 
          inputShape: [2], // moveQuality, suggestion index
          kernelInitializer: 'glorotUniform'
        }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({ 
          units: 16, 
          activation: 'relu',
          kernelInitializer: 'glorotUniform'
        }),
        tf.layers.dense({ 
          units: 1, 
          activation: 'linear' // Linear for reward prediction
        })
      ]
    });
    
    this.rewardModel.compile({
      optimizer: tf.train.sgd(0.01), // Lower learning rate for stability
      loss: 'meanSquaredError'
    });
    
    this.isModelReady = true;
    console.log('🤖 RL Reward Model initialized');
  }
  
  // Convert suggestion to index
  private tagToIndex(suggestion: string): number {
    const tagMap: Record<string, number> = {
      'Improve king safety immediately': 0,
      'Strengthen your pawn structure': 1,
      'Complete piece development': 2,
      'Consider defensive moves to protect your pieces': 3,
      'Look for better piece coordination': 4,
      'Good position, maintain pressure': 5,
      'Excellent! Continue with tactical play': 6,
      'Consider tactical play': 7
    };
    return (tagMap[suggestion] || 7) / 7; // Normalize to 0-1
  }
  
  // Check if commentary is repetitive
  private isRepetitive(comment: string): boolean {
    if (!comment) return false;
    
    // Check exact repetition in recent history
    const recentComments = this.commentHistory.slice(-5);
    if (recentComments.includes(comment)) {
      return true;
    }
    
    // Check similarity (simple word overlap)
    const commentWords = new Set(comment.toLowerCase().split(/\s+/));
    for (const historical of recentComments) {
      const historicalWords = new Set(historical.toLowerCase().split(/\s+/));
      const intersection = new Set(Array.from(commentWords).filter(x => historicalWords.has(x)));
      const similarity = intersection.size / Math.min(commentWords.size, historicalWords.size);
      if (similarity > 0.7) { // 70% similarity threshold
        return true;
      }
    }
    
    return false;
  }
  
  // Check if commentary is relevant to game state
  private isRelevant(state: GameState, suggestion: string): boolean {
    // Check suggestion relevance to game state
    if (state.isInCheck && suggestion.includes('king safety')) {
      return true;
    }
    
    if (state.moveHistory.length < 10 && suggestion.includes('development')) {
      return true;
    }
    
    if (state.moveHistory.length > 30 && suggestion.includes('endgame')) {
      return true;
    }
    
    // Check for piece-specific relevance
    const lastMove = state.moveHistory[state.moveHistory.length - 1];
    if (lastMove) {
      if (lastMove.piece.type === 'pawn' && suggestion.includes('pawn')) {
        return true;
      }
      if ((lastMove.piece.type === 'queen' || lastMove.piece.type === 'rook') && 
          suggestion.includes('pressure')) {
        return true;
      }
    }
    
    // Default moderate relevance
    return Math.random() > 0.3; // 70% chance of being relevant
  }
  
  // Generate commentary using RL
  async generateCommentary(state: GameState, tags: Tags): Promise<string> {
    // Frequency limiting: 1 comment per 5 moves
    this.commentCount++;
    if (this.commentCount % 5 !== 0) {
      return ''; // No commentary this move
    }
    
    if (!this.isModelReady) {
      await this.initializeRewardModel();
    }
    
    try {
      // Prepare input for reward model
      const input = tf.tensor2d([[tags.moveQuality, this.tagToIndex(tags.suggestion)]]);
      
      // Predict initial reward
      const rewardPrediction = this.rewardModel.predict(input) as tf.Tensor;
      let reward = (await rewardPrediction.data())[0];
      
      // Generate commentary based on tags and state
      const commentary = this.generateContextualCommentary(state, tags);
      
      // Apply RL rewards/penalties
      if (this.isRepetitive(commentary)) {
        reward -= 1.0; // Penalize repetition
        console.log('🔄 Repetition penalty applied: -1.0');
      }
      
      if (this.isRelevant(state, tags.suggestion)) {
        reward += 1.0; // Reward relevance
        console.log('✅ Relevance reward applied: +1.0');
      }
      
      // Clamp reward to reasonable range
      reward = Math.max(-2, Math.min(2, reward));
      
      // Train the reward model with the updated reward
      const targetReward = tf.tensor1d([reward]);
      await this.rewardModel.fit(input, targetReward, {
        epochs: 1,
        verbose: 0
      });
      
      // Clean up tensors
      input.dispose();
      rewardPrediction.dispose();
      targetReward.dispose();
      
      // Update history
      this.lastComment = commentary;
      this.commentHistory.push(commentary);
      if (this.commentHistory.length > 20) {
        this.commentHistory.shift(); // Keep only recent history
      }
      
      console.log(`💬 Generated commentary (reward: ${reward.toFixed(2)}): "${commentary}"`);
      return commentary;
      
    } catch (error) {
      console.error('RL Commentary generation failed:', error);
      return this.getFallbackCommentary(tags);
    }
  }
  
  // Generate contextual commentary based on state and tags
  private generateContextualCommentary(state: GameState, tags: Tags): string {
    const templates = {
      excellent: [
        "Brilliant move! {suggestion}",
        "Excellent tactical awareness! {suggestion}",
        "Outstanding position achieved! {suggestion}"
      ],
      good: [
        "Good move. {suggestion}",
        "Solid choice. {suggestion}",
        "Well played. {suggestion}"
      ],
      average: [
        "Acceptable, but {suggestion}",
        "Room for improvement. {suggestion}",
        "Consider this: {suggestion}"
      ],
      poor: [
        "Careful! {suggestion}",
        "This could be better. {suggestion}",
        "Watch out! {suggestion}"
      ]
    };
    
    // Select template based on move quality
    let selectedTemplates: string[];
    if (tags.moveQuality > 0.75) {
      selectedTemplates = templates.excellent;
    } else if (tags.moveQuality > 0.5) {
      selectedTemplates = templates.good;
    } else if (tags.moveQuality > 0.25) {
      selectedTemplates = templates.average;
    } else {
      selectedTemplates = templates.poor;
    }
    
    // Random selection from appropriate templates
    const template = selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];
    
    // Replace placeholder with suggestion
    return template.replace('{suggestion}', tags.suggestion);
  }
  
  // Fallback commentary if RL fails
  private getFallbackCommentary(tags: Tags): string {
    return `Move quality: ${(tags.moveQuality * 100).toFixed(0)}%. ${tags.suggestion}`;
  }
  
  // Get statistics about commentary generation
  getStats() {
    return {
      totalComments: Math.floor(this.commentCount / 5),
      historySize: this.commentHistory.length,
      lastComment: this.lastComment,
      modelReady: this.isModelReady
    };
  }
  
  // Reset the system
  reset() {
    this.commentCount = 0;
    this.lastComment = '';
    this.commentHistory = [];
    console.log('🔄 RL Commentary System reset');
  }
}

// Export RL system instance
export const rlCommentary = new RLCommentarySystem();

// Global function for testing
if (typeof window !== 'undefined') {
  (window as any).generateCommentary = async (state?: GameState, tags?: Tags) => {
    // Use default test values if not provided
    const testState = state || {
      board: Array(10).fill(null).map(() => Array(10).fill(null)),
      currentPlayer: 'white' as const,
      selectedPosition: null,
      validMoves: [],
      gamePhase: 'playing' as const,
      gameMode: 'ai' as const,
      aiDifficulty: 'medium' as const,
      moveHistory: [],
      isInCheck: false,
      isCheckmate: false,
      isStalemate: false,
      winner: null
    };
    
    const testTags = tags || {
      moveQuality: Math.random(),
      suggestion: 'Consider tactical play'
    };
    
    console.log('🧪 Testing RL Commentary Generation');
    console.log('   Input tags:', testTags);
    const result = await rlCommentary.generateCommentary(testState, testTags);
    console.log('   Generated:', result || '(No commentary - frequency limit)');
    console.log('   Stats:', rlCommentary.getStats());
    return result;
  };
  
  (window as any).rlCommentaryStats = () => rlCommentary.getStats();
  (window as any).resetRLCommentary = () => rlCommentary.reset();
}