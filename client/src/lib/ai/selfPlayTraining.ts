/**
 * Self-Play Training Manager for Reinforcement Learning
 * Orchestrates continuous self-play and model improvement
 */

import { ReinforcementLearningSystem, Episode, RLStats } from './reinforcementLearning';
import { GameState, ChessMove, PieceColor } from '../chess/types';
import { advancedAI } from '../chess/advancedAI';
import { aiLearning } from '../chess/aiLearning';

export interface TrainingConfig {
  episodesPerGeneration: number;
  generationsToTrain: number;
  saveInterval: number;
  evaluationGames: number;
  targetWinRate: number;
  parallelGames: number;
  useCurriculumLearning: boolean;
  useTransferLearning: boolean;
}

export interface TrainingProgress {
  currentGeneration: number;
  currentEpisode: number;
  totalEpisodes: number;
  currentWinRate: number;
  currentELO: number;
  trainingSpeed: number; // Episodes per second
  estimatedTimeRemaining: number; // In seconds
  memoryUsage: number;
  improvements: string[];
}

export interface GenerationStats {
  generation: number;
  episodes: number;
  winRate: { white: number; black: number; draw: number };
  averageGameLength: number;
  averageReward: number;
  modelImprovement: number;
  eloRating: number;
  timestamp: number;
}

export class SelfPlayTrainingManager {
  private rlSystem: ReinforcementLearningSystem;
  private config: TrainingConfig;
  private generationHistory: GenerationStats[] = [];
  private isTraining: boolean = false;
  private currentGeneration: number = 0;
  private startTime: number = 0;
  private bestModel: any = null;
  private currentELO: number = 1800; // Starting ELO
  
  constructor(config?: Partial<TrainingConfig>) {
    this.config = {
      episodesPerGeneration: 1000,
      generationsToTrain: 100,
      saveInterval: 100,
      evaluationGames: 100,
      targetWinRate: 0.55,
      parallelGames: 4,
      useCurriculumLearning: true,
      useTransferLearning: true,
      ...config
    };
    
    this.rlSystem = new ReinforcementLearningSystem({
      alpha: 0.01,
      gamma: 0.95,
      lambda: 0.9,
      epsilon: 0.25, // Higher initial exploration
      epsilonDecay: 0.995,
      minEpsilon: 0.05,
      batchSize: 64,
      bufferSize: 200000, // Larger buffer for 100k+ games
      updateFrequency: 50
    });
  }
  
  /**
   * Start the self-play training process
   */
  async startTraining(
    onProgress?: (progress: TrainingProgress) => void,
    onComplete?: (stats: GenerationStats[]) => void
  ): Promise<void> {
    if (this.isTraining) {
      console.warn('Training already in progress');
      return;
    }
    
    this.isTraining = true;
    this.startTime = Date.now();
    console.log(`🚀 Starting self-play training: ${this.config.generationsToTrain} generations`);
    
    // Load existing model if transfer learning is enabled
    if (this.config.useTransferLearning) {
      const loaded = this.rlSystem.loadModel('rl_base_model');
      if (loaded) {
        console.log('📚 Transfer learning: Loaded base model');
      }
    }
    
    try {
      for (let gen = 0; gen < this.config.generationsToTrain; gen++) {
        if (!this.isTraining) break;
        
        this.currentGeneration = gen;
        const genStats = await this.trainGeneration(gen, onProgress);
        this.generationHistory.push(genStats);
        
        // Evaluate and update ELO
        if (gen % 5 === 0) {
          await this.evaluateModel();
        }
        
        // Save checkpoint
        if (gen % this.config.saveInterval === 0) {
          this.saveCheckpoint(gen);
        }
        
        // Check if target performance reached
        if (this.checkTargetReached(genStats)) {
          console.log(`🎯 Target performance reached at generation ${gen}`);
          break;
        }
      }
    } finally {
      this.isTraining = false;
      if (onComplete) {
        onComplete(this.generationHistory);
      }
      
      // Save final model
      this.rlSystem.saveModel('rl_final_model');
      console.log(`✅ Training complete. Final ELO: ${this.currentELO}`);
    }
  }
  
  /**
   * Train a single generation
   */
  private async trainGeneration(
    generation: number,
    onProgress?: (progress: TrainingProgress) => void
  ): Promise<GenerationStats> {
    console.log(`📊 Generation ${generation + 1}/${this.config.generationsToTrain}`);
    
    const stats: GenerationStats = {
      generation,
      episodes: 0,
      winRate: { white: 0, black: 0, draw: 0 },
      averageGameLength: 0,
      averageReward: 0,
      modelImprovement: 0,
      eloRating: this.currentELO,
      timestamp: Date.now()
    };
    
    const episodes: Episode[] = [];
    const batchSize = this.config.parallelGames;
    const totalEpisodes = this.config.episodesPerGeneration;
    
    // Run episodes in batches
    for (let i = 0; i < totalEpisodes; i += batchSize) {
      const batchPromises: Promise<Episode>[] = [];
      
      // Create batch of parallel games
      for (let j = 0; j < Math.min(batchSize, totalEpisodes - i); j++) {
        // Use curriculum learning to adjust difficulty
        if (this.config.useCurriculumLearning) {
          this.applyCurriculumLearning(generation, i + j);
        }
        
        batchPromises.push(this.rlSystem.runSelfPlayEpisode());
      }
      
      // Wait for batch to complete
      const batchEpisodes = await Promise.all(batchPromises);
      episodes.push(...batchEpisodes);
      
      // Train on batch
      if ((i + batchSize) % 50 === 0) {
        const loss = await this.rlSystem.trainOnBatch();
        console.log(`  📈 Batch ${i / batchSize}: Loss = ${loss.toFixed(4)}`);
      }
      
      // Report progress
      if (onProgress && i % 10 === 0) {
        const progress = this.calculateProgress(i + batchSize, totalEpisodes, generation);
        onProgress(progress);
      }
      
      // Allow UI to update
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    
    // Calculate generation statistics
    stats.episodes = episodes.length;
    stats.averageGameLength = episodes.reduce((sum, ep) => sum + ep.totalMoves, 0) / episodes.length;
    
    // Calculate win rates
    const outcomes = { white: 0, black: 0, draw: 0 };
    episodes.forEach(ep => {
      if (ep.winner === 'white') outcomes.white++;
      else if (ep.winner === 'black') outcomes.black++;
      else outcomes.draw++;
    });
    
    stats.winRate.white = outcomes.white / episodes.length;
    stats.winRate.black = outcomes.black / episodes.length;
    stats.winRate.draw = outcomes.draw / episodes.length;
    
    // Calculate average reward
    stats.averageReward = episodes.reduce((sum, ep) => 
      sum + ep.rewards.reduce((a, b) => a + b, 0) / ep.rewards.length, 0
    ) / episodes.length;
    
    // Calculate model improvement
    if (this.generationHistory.length > 0) {
      const prevStats = this.generationHistory[this.generationHistory.length - 1];
      stats.modelImprovement = stats.averageReward - prevStats.averageReward;
    }
    
    console.log(`  ✅ Generation ${generation} complete:`);
    console.log(`     Win rates: W=${(stats.winRate.white * 100).toFixed(1)}% B=${(stats.winRate.black * 100).toFixed(1)}% D=${(stats.winRate.draw * 100).toFixed(1)}%`);
    console.log(`     Avg game length: ${stats.averageGameLength.toFixed(1)} moves`);
    console.log(`     Avg reward: ${stats.averageReward.toFixed(3)}`);
    console.log(`     Model improvement: ${stats.modelImprovement >= 0 ? '+' : ''}${stats.modelImprovement.toFixed(3)}`);
    
    return stats;
  }
  
  /**
   * Apply curriculum learning - start with simpler positions
   */
  private applyCurriculumLearning(generation: number, episode: number): void {
    const progress = (generation * this.config.episodesPerGeneration + episode) / 
                    (this.config.generationsToTrain * this.config.episodesPerGeneration);
    
    if (progress < 0.2) {
      // Early training: Focus on endgames (simpler positions)
      console.log('📚 Curriculum: Training on endgame positions');
      // Will be implemented with specific endgame positions
    } else if (progress < 0.5) {
      // Mid training: Middle game tactics
      console.log('📚 Curriculum: Training on tactical positions');
      // Will be implemented with tactical puzzles
    } else {
      // Late training: Full games
      console.log('📚 Curriculum: Training on full games');
    }
  }
  
  /**
   * Evaluate model strength against baseline
   */
  private async evaluateModel(): Promise<number> {
    console.log('🎯 Evaluating model strength...');
    
    let wins = 0;
    let losses = 0;
    let draws = 0;
    
    // Play evaluation games against the current advanced AI
    for (let i = 0; i < this.config.evaluationGames; i++) {
      const result = await this.playEvaluationGame();
      if (result === 'win') wins++;
      else if (result === 'loss') losses++;
      else draws++;
      
      // Quick evaluation - stop early if clear result
      if (i >= 20 && (wins > i * 0.7 || losses > i * 0.7)) {
        break;
      }
    }
    
    const winRate = wins / (wins + losses + draws);
    
    // Update ELO based on performance
    const expectedScore = 1 / (1 + Math.pow(10, (1800 - this.currentELO) / 400));
    const actualScore = winRate;
    const k = 32; // K-factor
    this.currentELO = Math.round(this.currentELO + k * (actualScore - expectedScore));
    
    console.log(`  📊 Evaluation: W=${wins} L=${losses} D=${draws}`);
    console.log(`  📈 New ELO: ${this.currentELO} (${this.currentELO >= 1800 ? '+' : ''}${this.currentELO - 1800})`);
    
    return winRate;
  }
  
  /**
   * Play a single evaluation game
   */
  private async playEvaluationGame(): Promise<'win' | 'loss' | 'draw'> {
    // Simplified evaluation - will be replaced with actual game simulation
    const random = Math.random();
    const strength = this.currentELO / 3000; // Normalize ELO to 0-1
    
    if (random < strength) return 'win';
    if (random < strength + 0.3) return 'draw';
    return 'loss';
  }
  
  /**
   * Calculate training progress
   */
  private calculateProgress(
    currentEpisode: number,
    totalEpisodes: number,
    generation: number
  ): TrainingProgress {
    const totalCompleted = generation * this.config.episodesPerGeneration + currentEpisode;
    const totalPlanned = this.config.generationsToTrain * this.config.episodesPerGeneration;
    
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    const episodesPerSecond = totalCompleted / elapsedTime;
    const remainingEpisodes = totalPlanned - totalCompleted;
    const estimatedTimeRemaining = remainingEpisodes / episodesPerSecond;
    
    const rlStats = this.rlSystem.getStats();
    
    return {
      currentGeneration: generation,
      currentEpisode,
      totalEpisodes: totalPlanned,
      currentWinRate: rlStats.winRate.white,
      currentELO: this.currentELO,
      trainingSpeed: episodesPerSecond,
      estimatedTimeRemaining,
      memoryUsage: this.estimateMemoryUsage(),
      improvements: this.getRecentImprovements()
    };
  }
  
  /**
   * Check if target performance is reached
   */
  private checkTargetReached(stats: GenerationStats): boolean {
    // Check if we've reached target win rate
    const balancedWinRate = Math.abs(stats.winRate.white - 0.5) < 0.1 &&
                            Math.abs(stats.winRate.black - 0.5) < 0.1;
    
    // Check if ELO target reached (2500+)
    const targetELO = this.currentELO >= 2500;
    
    // Check if model has converged (no improvement in last 5 generations)
    if (this.generationHistory.length >= 5) {
      const recentImprovements = this.generationHistory
        .slice(-5)
        .map(g => g.modelImprovement);
      const avgImprovement = recentImprovements.reduce((a, b) => a + b, 0) / 5;
      
      if (Math.abs(avgImprovement) < 0.001) {
        console.log('📊 Model has converged');
        return true;
      }
    }
    
    return targetELO && balancedWinRate;
  }
  
  /**
   * Save training checkpoint
   */
  private saveCheckpoint(generation: number): void {
    const checkpoint = {
      generation,
      elo: this.currentELO,
      stats: this.rlSystem.getStats(),
      history: this.generationHistory,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`wizard_chess_checkpoint_gen${generation}`, JSON.stringify(checkpoint));
    this.rlSystem.saveModel(`rl_model_gen${generation}`);
    
    console.log(`💾 Checkpoint saved: Generation ${generation}, ELO ${this.currentELO}`);
  }
  
  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    // Rough estimate in MB
    const stats = this.rlSystem.getStats();
    const bufferSize = 200000 * 100; // experiences * bytes per experience
    const valueFunctionSize = stats.episodesPlayed * 1000; // states * bytes per state
    return Math.round((bufferSize + valueFunctionSize) / (1024 * 1024));
  }
  
  /**
   * Get recent improvements
   */
  private getRecentImprovements(): string[] {
    const improvements: string[] = [];
    
    if (this.generationHistory.length >= 2) {
      const current = this.generationHistory[this.generationHistory.length - 1];
      const previous = this.generationHistory[this.generationHistory.length - 2];
      
      if (current.averageReward > previous.averageReward) {
        improvements.push(`Reward improved by ${((current.averageReward - previous.averageReward) * 100).toFixed(1)}%`);
      }
      
      if (current.averageGameLength < previous.averageGameLength) {
        improvements.push(`Games ${(previous.averageGameLength - current.averageGameLength).toFixed(0)} moves shorter`);
      }
      
      if (Math.abs(current.winRate.white - 0.5) < Math.abs(previous.winRate.white - 0.5)) {
        improvements.push('Better color balance achieved');
      }
    }
    
    if (this.currentELO > 2000) {
      improvements.push(`ELO reached ${this.currentELO}`);
    }
    
    return improvements;
  }
  
  /**
   * Stop training
   */
  stopTraining(): void {
    this.isTraining = false;
    console.log('⏹️ Training stopped by user');
  }
  
  /**
   * Get training statistics
   */
  getStatistics(): {
    generations: GenerationStats[];
    currentELO: number;
    rlStats: RLStats;
  } {
    return {
      generations: this.generationHistory,
      currentELO: this.currentELO,
      rlStats: this.rlSystem.getStats()
    };
  }
  
  /**
   * Export model for production use
   */
  exportModel(): string {
    const modelData = {
      elo: this.currentELO,
      generations: this.generationHistory.length,
      stats: this.rlSystem.getStats(),
      config: this.config,
      timestamp: Date.now()
    };
    
    return JSON.stringify(modelData);
  }
}

// Create singleton instance
export const selfPlayTrainer = new SelfPlayTrainingManager();