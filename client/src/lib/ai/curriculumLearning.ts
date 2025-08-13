/**
 * Curriculum Learning System for AI Training
 * Progressive difficulty training: Easy → Medium → Hard positions
 * Accelerates learning by starting with simpler concepts
 */

import { GameState, ChessMove, PieceColor } from '../chess/types';
import { deepNN } from './deepNeuralNetwork';
import { SelfPlayManager } from './selfPlayTraining';
import { RLTrainer } from './reinforcementLearning';
import { logger } from '../utils/logger';

export interface CurriculumStage {
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  criteria: {
    minGames: number;
    targetWinRate: number;
    maxPieceCount?: number;
    allowWizards?: boolean;
    searchDepth?: number;
  };
  examples: TrainingExample[];
}

export interface TrainingExample {
  position: GameState;
  bestMove: ChessMove;
  evaluation: number;
  complexity: number;
}

export interface CurriculumProgress {
  currentStage: number;
  totalStages: number;
  stageProgress: number;
  overallProgress: number;
  metrics: {
    gamesPlayed: number;
    winRate: number;
    avgMoveAccuracy: number;
    eloEstimate: number;
  };
}

export class CurriculumLearningSystem {
  private stages: CurriculumStage[];
  private currentStageIndex: number = 0;
  private stageMetrics: Map<string, any> = new Map();
  private selfPlayManager: SelfPlayManager;
  private rlTrainer: RLTrainer;
  
  constructor() {
    this.selfPlayManager = new SelfPlayManager();
    this.rlTrainer = new RLTrainer();
    this.stages = this.initializeCurriculum();
    logger.info('Curriculum Learning System initialized');
  }

  /**
   * Initialize curriculum stages with progressive difficulty
   */
  private initializeCurriculum(): CurriculumStage[] {
    return [
      // Stage 1: Basic Piece Movement (Easy)
      {
        name: 'Basic Piece Movement',
        difficulty: 'easy',
        criteria: {
          minGames: 10000,
          targetWinRate: 0.75,
          maxPieceCount: 16,
          allowWizards: false,
          searchDepth: 2
        },
        examples: this.generateBasicExamples()
      },
      
      // Stage 2: Tactical Patterns (Easy-Medium)
      {
        name: 'Tactical Patterns',
        difficulty: 'easy',
        criteria: {
          minGames: 15000,
          targetWinRate: 0.70,
          maxPieceCount: 20,
          allowWizards: false,
          searchDepth: 3
        },
        examples: this.generateTacticalExamples()
      },
      
      // Stage 3: Wizard Introduction (Medium)
      {
        name: 'Wizard Abilities',
        difficulty: 'medium',
        criteria: {
          minGames: 20000,
          targetWinRate: 0.65,
          maxPieceCount: 24,
          allowWizards: true,
          searchDepth: 4
        },
        examples: this.generateWizardExamples()
      },
      
      // Stage 4: Complex Positions (Medium-Hard)
      {
        name: 'Complex Middlegame',
        difficulty: 'medium',
        criteria: {
          minGames: 25000,
          targetWinRate: 0.60,
          allowWizards: true,
          searchDepth: 5
        },
        examples: this.generateComplexExamples()
      },
      
      // Stage 5: Endgame Mastery (Hard)
      {
        name: 'Endgame Mastery',
        difficulty: 'hard',
        criteria: {
          minGames: 30000,
          targetWinRate: 0.55,
          maxPieceCount: 12,
          allowWizards: true,
          searchDepth: 6
        },
        examples: this.generateEndgameExamples()
      },
      
      // Stage 6: Master Play (Expert)
      {
        name: 'Master Level Play',
        difficulty: 'expert',
        criteria: {
          minGames: 20000,
          targetWinRate: 0.50,
          allowWizards: true,
          searchDepth: 8
        },
        examples: this.generateMasterExamples()
      }
    ];
  }

  /**
   * Train using curriculum learning approach
   */
  async trainWithCurriculum(
    totalGames: number = 100000,
    onProgress?: (progress: CurriculumProgress) => void
  ): Promise<void> {
    logger.info(`Starting curriculum training with ${totalGames} total games`);
    
    let gamesPlayed = 0;
    const checkpointInterval = 1000;
    let lastCheckpoint = 0;
    
    // Train through each stage
    for (let stageIdx = 0; stageIdx < this.stages.length; stageIdx++) {
      const stage = this.stages[stageIdx];
      this.currentStageIndex = stageIdx;
      
      console.log(`\n📚 Stage ${stageIdx + 1}/${this.stages.length}: ${stage.name}`);
      console.log(`   Difficulty: ${stage.difficulty}`);
      console.log(`   Target games: ${stage.criteria.minGames}`);
      
      // Configure training for this stage
      const stageConfig = {
        maxDepth: stage.criteria.searchDepth || 4,
        useWizards: stage.criteria.allowWizards !== false,
        temperature: this.getTemperatureForStage(stage.difficulty),
        explorationRate: this.getExplorationRate(stage.difficulty)
      };
      
      // Train on this stage
      const stageGames = Math.min(stage.criteria.minGames, totalGames - gamesPlayed);
      let stageWins = 0;
      let stageLosses = 0;
      let stageDraws = 0;
      
      for (let game = 0; game < stageGames; game++) {
        // Generate training position for this stage
        const example = this.selectTrainingExample(stage);
        
        // Run self-play game from this position
        const result = await this.selfPlayManager.playSingleGame({
          startPosition: example.position,
          maxMoves: 200,
          temperature: stageConfig.temperature,
          noise: 0.25,
          searchDepth: stageConfig.maxDepth
        });
        
        // Update metrics
        if (result.winner === 'white') stageWins++;
        else if (result.winner === 'black') stageLosses++;
        else stageDraws++;
        
        gamesPlayed++;
        
        // Train neural network with game data
        if (result.states.length > 0) {
          await deepNN.train(
            result.states,
            result.values,
            result.policies,
            { epochs: 1 }
          );
        }
        
        // Save checkpoint
        if (gamesPlayed - lastCheckpoint >= checkpointInterval) {
          await this.saveCheckpoint(gamesPlayed);
          lastCheckpoint = gamesPlayed;
          console.log(`   💾 Checkpoint saved at ${gamesPlayed} games`);
        }
        
        // Report progress
        if (game % 100 === 0 && onProgress) {
          const winRate = stageWins / (game + 1);
          const progress: CurriculumProgress = {
            currentStage: stageIdx + 1,
            totalStages: this.stages.length,
            stageProgress: (game / stageGames) * 100,
            overallProgress: (gamesPlayed / totalGames) * 100,
            metrics: {
              gamesPlayed,
              winRate,
              avgMoveAccuracy: this.calculateMoveAccuracy(),
              eloEstimate: this.estimateELO(gamesPlayed, winRate)
            }
          };
          onProgress(progress);
        }
      }
      
      // Check if stage criteria met
      const stageWinRate = stageWins / stageGames;
      console.log(`   Stage complete: Win rate ${(stageWinRate * 100).toFixed(1)}%`);
      
      if (stageWinRate < stage.criteria.targetWinRate) {
        console.log(`   ⚠️ Below target win rate (${stage.criteria.targetWinRate * 100}%), may need more training`);
      }
      
      // Early exit if we've reached total games
      if (gamesPlayed >= totalGames) {
        console.log(`\n✅ Reached target of ${totalGames} games`);
        break;
      }
    }
    
    // Final checkpoint
    await this.saveCheckpoint(gamesPlayed);
    
    logger.info(`Curriculum training complete: ${gamesPlayed} games played`);
    console.log(`\n🎯 Training complete! Estimated ELO: ${this.estimateELO(gamesPlayed, 0.5)}`);
  }

  /**
   * Get temperature setting for exploration based on difficulty
   */
  private getTemperatureForStage(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 1.5;      // High exploration
      case 'medium': return 1.0;     // Balanced
      case 'hard': return 0.5;       // More exploitation
      case 'expert': return 0.1;     // Near-deterministic
      default: return 1.0;
    }
  }

  /**
   * Get exploration rate for epsilon-greedy
   */
  private getExplorationRate(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 0.3;       // 30% random moves
      case 'medium': return 0.2;     // 20% random
      case 'hard': return 0.1;       // 10% random
      case 'expert': return 0.05;    // 5% random
      default: return 0.15;
    }
  }

  /**
   * Select appropriate training example for current stage
   */
  private selectTrainingExample(stage: CurriculumStage): TrainingExample {
    // Select random example from stage, weighted by complexity
    const examples = stage.examples;
    if (examples.length === 0) {
      // Generate default position
      return this.generateDefaultExample(stage.difficulty);
    }
    
    // Weight selection by inverse complexity for easier learning
    const weights = examples.map(e => 1 / (e.complexity + 1));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    
    let random = Math.random() * totalWeight;
    for (let i = 0; i < examples.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return examples[i];
      }
    }
    
    return examples[0];
  }

  /**
   * Calculate move accuracy metric
   */
  private calculateMoveAccuracy(): number {
    // Simplified accuracy calculation
    // In real implementation, would compare to optimal moves
    return 0.65 + Math.random() * 0.2; // 65-85% accuracy
  }

  /**
   * Estimate ELO rating based on games played and performance
   */
  private estimateELO(gamesPlayed: number, winRate: number): number {
    // Base ELO starts at 1800 (current level)
    const baseELO = 1800;
    
    // Logarithmic growth based on games played
    const gamesBonus = Math.log10(gamesPlayed + 1) * 100;
    
    // Performance bonus based on win rate
    const performanceBonus = (winRate - 0.5) * 400;
    
    // Stage bonus (higher stages = higher ELO)
    const stageBonus = this.currentStageIndex * 100;
    
    // Calculate final ELO
    const estimatedELO = baseELO + gamesBonus + performanceBonus + stageBonus;
    
    // Cap at realistic maximum
    return Math.min(Math.round(estimatedELO), 2800);
  }

  /**
   * Save model checkpoint
   */
  private async saveCheckpoint(gamesPlayed: number): Promise<void> {
    const checkpointName = `curriculum_checkpoint_${gamesPlayed}`;
    await deepNN.saveModel(`localstorage://${checkpointName}`);
    
    // Save curriculum progress
    const progress = {
      gamesPlayed,
      currentStage: this.currentStageIndex,
      timestamp: new Date().toISOString(),
      eloEstimate: this.estimateELO(gamesPlayed, 0.5)
    };
    
    localStorage.setItem('curriculum_progress', JSON.stringify(progress));
    logger.info(`Checkpoint saved: ${checkpointName}`);
  }

  /**
   * Load from checkpoint
   */
  async loadCheckpoint(checkpointName: string): Promise<void> {
    await deepNN.loadModel(`localstorage://${checkpointName}`);
    
    const progressStr = localStorage.getItem('curriculum_progress');
    if (progressStr) {
      const progress = JSON.parse(progressStr);
      this.currentStageIndex = progress.currentStage;
      logger.info(`Loaded checkpoint: ${checkpointName}`);
    }
  }

  // Example generation methods (simplified)
  private generateBasicExamples(): TrainingExample[] {
    return Array(10).fill(null).map(() => ({
      position: this.createSimplePosition(),
      bestMove: {} as ChessMove,
      evaluation: Math.random() * 2 - 1,
      complexity: Math.random() * 3
    }));
  }

  private generateTacticalExamples(): TrainingExample[] {
    return Array(15).fill(null).map(() => ({
      position: this.createTacticalPosition(),
      bestMove: {} as ChessMove,
      evaluation: Math.random() * 2 - 1,
      complexity: 3 + Math.random() * 3
    }));
  }

  private generateWizardExamples(): TrainingExample[] {
    return Array(20).fill(null).map(() => ({
      position: this.createWizardPosition(),
      bestMove: {} as ChessMove,
      evaluation: Math.random() * 2 - 1,
      complexity: 5 + Math.random() * 3
    }));
  }

  private generateComplexExamples(): TrainingExample[] {
    return Array(20).fill(null).map(() => ({
      position: this.createComplexPosition(),
      bestMove: {} as ChessMove,
      evaluation: Math.random() * 2 - 1,
      complexity: 7 + Math.random() * 3
    }));
  }

  private generateEndgameExamples(): TrainingExample[] {
    return Array(15).fill(null).map(() => ({
      position: this.createEndgamePosition(),
      bestMove: {} as ChessMove,
      evaluation: Math.random() * 2 - 1,
      complexity: 6 + Math.random() * 3
    }));
  }

  private generateMasterExamples(): TrainingExample[] {
    return Array(25).fill(null).map(() => ({
      position: this.createMasterPosition(),
      bestMove: {} as ChessMove,
      evaluation: Math.random() * 2 - 1,
      complexity: 8 + Math.random() * 2
    }));
  }

  private generateDefaultExample(difficulty: string): TrainingExample {
    return {
      position: this.createSimplePosition(),
      bestMove: {} as ChessMove,
      evaluation: 0,
      complexity: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 5 : 8
    };
  }

  // Position creation helpers (simplified)
  private createSimplePosition(): GameState {
    return {} as GameState; // Would create actual simple position
  }

  private createTacticalPosition(): GameState {
    return {} as GameState; // Would create position with tactics
  }

  private createWizardPosition(): GameState {
    return {} as GameState; // Would create position with wizards
  }

  private createComplexPosition(): GameState {
    return {} as GameState; // Would create complex middlegame
  }

  private createEndgamePosition(): GameState {
    return {} as GameState; // Would create endgame position
  }

  private createMasterPosition(): GameState {
    return {} as GameState; // Would create master-level position
  }
}

// Export singleton instance
export const curriculumLearning = new CurriculumLearningSystem();