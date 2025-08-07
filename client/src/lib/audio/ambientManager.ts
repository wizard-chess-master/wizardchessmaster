import { GameState } from '../chess/types';
import { useAudio, GameIntensity } from '../stores/useAudio';

export interface IntensityFactors {
  isInCheck: boolean;
  isCheckmate: boolean;
  recentCaptures: number;
  gameLength: number;
  materialAdvantage: number;
  threateningPieces: number;
  kingDistance: number;
}

export class AmbientSoundManager {
  private static instance: AmbientSoundManager;
  private intensityHistory: GameIntensity[] = [];
  private lastIntensity: GameIntensity = 'calm';
  
  static getInstance(): AmbientSoundManager {
    if (!AmbientSoundManager.instance) {
      AmbientSoundManager.instance = new AmbientSoundManager();
    }
    return AmbientSoundManager.instance;
  }

  /**
   * Initialize ambient sounds using the background.mp3 with different settings
   */
  async initializeAmbientSounds(): Promise<void> {
    try {
      const { setAmbientSounds } = useAudio.getState();
      
      // Create different intensity variants using the same background.mp3
      const ambientSounds = {
        calm: await this.createAmbientSound('/sounds/background.mp3', {
          volume: 0.1,
          playbackRate: 0.8,
          loop: true
        }),
        moderate: await this.createAmbientSound('/sounds/background.mp3', {
          volume: 0.15,
          playbackRate: 0.9,
          loop: true
        }),
        tense: await this.createAmbientSound('/sounds/background.mp3', {
          volume: 0.25,
          playbackRate: 1.0,
          loop: true
        }),
        critical: await this.createAmbientSound('/sounds/background.mp3', {
          volume: 0.35,
          playbackRate: 1.1,
          loop: true
        })
      };

      setAmbientSounds(ambientSounds);
      console.log('🎵 Ambient sounds initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize ambient sounds:', error);
    }
  }

  private async createAmbientSound(src: string, options: {
    volume: number;
    playbackRate: number;
    loop: boolean;
  }): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(src);
      audio.volume = options.volume;
      audio.playbackRate = options.playbackRate;
      audio.loop = options.loop;
      
      audio.addEventListener('canplaythrough', () => {
        resolve(audio);
      });
      
      audio.addEventListener('error', () => {
        reject(new Error(`Failed to load audio: ${src}`));
      });
      
      // Start loading
      audio.load();
    });
  }

  /**
   * Analyze game state and determine current intensity level
   */
  analyzeGameIntensity(gameState: GameState): GameIntensity {
    const factors = this.calculateIntensityFactors(gameState);
    const intensity = this.calculateIntensity(factors);
    
    // Smooth intensity changes to avoid jarring transitions
    const smoothedIntensity = this.smoothIntensityTransition(intensity);
    
    if (smoothedIntensity !== this.lastIntensity) {
      console.log(`🎵 Game intensity transition: ${this.lastIntensity} → ${smoothedIntensity}`);
      this.lastIntensity = smoothedIntensity;
      
      // Update audio system
      const { setGameIntensity } = useAudio.getState();
      setGameIntensity(smoothedIntensity);
    }
    
    return smoothedIntensity;
  }

  private calculateIntensityFactors(gameState: GameState): IntensityFactors {
    const { board, moveHistory, isInCheck, isCheckmate } = gameState;
    
    // Count recent captures (last 5 moves)
    const recentCaptures = moveHistory
      .slice(-10)
      .filter(move => move.captured).length;

    // Calculate material advantage/disadvantage
    let materialAdvantage = 0;
    board.flat().forEach(piece => {
      if (piece) {
        const value = this.getPieceValue(piece.type);
        materialAdvantage += piece.color === 'white' ? value : -value;
      }
    });

    // Count threatening pieces near kings
    const threateningPieces = this.countThreateningPieces(gameState);
    
    // Calculate king distance (how close kings are to each other)
    const kingDistance = this.calculateKingDistance(board);

    return {
      isInCheck,
      isCheckmate,
      recentCaptures,
      gameLength: moveHistory.length,
      materialAdvantage: Math.abs(materialAdvantage),
      threateningPieces,
      kingDistance
    };
  }

  private calculateIntensity(factors: IntensityFactors): GameIntensity {
    let intensityScore = 0;

    // Critical conditions (immediate danger)
    if (factors.isCheckmate) return 'critical';
    if (factors.isInCheck) intensityScore += 40;

    // High-intensity factors
    if (factors.recentCaptures >= 3) intensityScore += 30;
    if (factors.materialAdvantage >= 50) intensityScore += 25;
    if (factors.threateningPieces >= 4) intensityScore += 20;
    if (factors.kingDistance <= 3) intensityScore += 15;

    // Medium-intensity factors  
    if (factors.recentCaptures >= 1) intensityScore += 15;
    if (factors.materialAdvantage >= 20) intensityScore += 10;
    if (factors.threateningPieces >= 2) intensityScore += 10;
    if (factors.gameLength >= 20) intensityScore += 5;

    // Determine intensity level
    if (intensityScore >= 60) return 'critical';
    if (intensityScore >= 35) return 'tense';
    if (intensityScore >= 15) return 'moderate';
    return 'calm';
  }

  private smoothIntensityTransition(newIntensity: GameIntensity): GameIntensity {
    this.intensityHistory.push(newIntensity);
    
    // Keep only last 5 intensity readings
    if (this.intensityHistory.length > 5) {
      this.intensityHistory.shift();
    }

    // If we don't have enough history, use new intensity
    if (this.intensityHistory.length < 3) {
      return newIntensity;
    }

    // Count occurrences of each intensity in recent history
    const intensityCounts = this.intensityHistory.reduce((acc, intensity) => {
      acc[intensity] = (acc[intensity] || 0) + 1;
      return acc;
    }, {} as Record<GameIntensity, number>);

    // Find the most frequent intensity
    const mostFrequent = Object.entries(intensityCounts)
      .sort(([,a], [,b]) => b - a)[0][0] as GameIntensity;

    return mostFrequent;
  }

  private getPieceValue(type: string): number {
    const values: Record<string, number> = {
      'pawn': 10,
      'knight': 30,
      'bishop': 30,
      'rook': 50,
      'queen': 90,
      'king': 900,
      'wizard': 35
    };
    return values[type] || 0;
  }

  private countThreateningPieces(gameState: GameState): number {
    // This is a simplified implementation
    // In a real game, you'd check which pieces are attacking or defending important squares
    const { board } = gameState;
    let threateningCount = 0;
    
    // Count pieces in center and near opponent's king
    for (let row = 3; row < 7; row++) {
      for (let col = 3; col < 7; col++) {
        if (board[row][col]) {
          threateningCount++;
        }
      }
    }
    
    return threateningCount;
  }

  private calculateKingDistance(board: any[][]): number {
    let whiteKing = null;
    let blackKing = null;
    
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'king') {
          if (piece.color === 'white') {
            whiteKing = { row, col };
          } else {
            blackKing = { row, col };
          }
        }
      }
    }
    
    if (!whiteKing || !blackKing) return 10; // Max distance if king not found
    
    return Math.max(
      Math.abs(whiteKing.row - blackKing.row),
      Math.abs(whiteKing.col - blackKing.col)
    );
  }

  /**
   * Reset intensity history (useful when starting a new game)
   */
  reset(): void {
    this.intensityHistory = [];
    this.lastIntensity = 'calm';
    
    const { setGameIntensity } = useAudio.getState();
    setGameIntensity('calm');
  }
}

export const ambientManager = AmbientSoundManager.getInstance();