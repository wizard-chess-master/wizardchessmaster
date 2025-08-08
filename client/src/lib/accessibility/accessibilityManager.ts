/**
 * Accessibility Manager for Vision-Impaired Players
 * Provides comprehensive accessibility features including screen reader support,
 * audio announcements, keyboard navigation, and high contrast modes
 */

export interface AccessibilitySettings {
  enabled: boolean;
  screenReaderMode: boolean;
  audioAnnouncements: boolean;
  highContrastMode: boolean;
  largeText: boolean;
  keyboardNavigation: boolean;
  voiceGuidance: boolean;
  reducedMotion: boolean;
  audioDescriptions: boolean;
}

export interface GameStateAnnouncement {
  type: 'move' | 'capture' | 'check' | 'checkmate' | 'turn' | 'position' | 'available_moves';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

class AccessibilityManager {
  private settings: AccessibilitySettings = {
    enabled: false,
    screenReaderMode: false,
    audioAnnouncements: true,
    highContrastMode: false,
    largeText: false,
    keyboardNavigation: true,
    voiceGuidance: true,
    reducedMotion: false,
    audioDescriptions: true
  };

  private speechSynthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private announcementQueue: GameStateAnnouncement[] = [];
  private isAnnouncing = false;

  /**
   * Initialize accessibility system
   */
  initialize(): void {
    this.speechSynthesis = window.speechSynthesis;
    this.setupKeyboardNavigation();
    this.loadSettings();
    console.log('♿ Accessibility Manager initialized');
  }

  /**
   * Enable one-click accessibility mode
   */
  enableAccessibilityMode(): void {
    this.settings = {
      ...this.settings,
      enabled: true,
      screenReaderMode: true,
      audioAnnouncements: true,
      highContrastMode: true,
      largeText: true,
      keyboardNavigation: true,
      voiceGuidance: true,
      reducedMotion: true,
      audioDescriptions: true
    };

    this.applySettings();
    this.announce('Accessibility mode enabled. All features are now active for vision-impaired players.', 'high');
    this.saveSettings();
    console.log('♿ Full accessibility mode enabled');
  }

  /**
   * Disable accessibility mode
   */
  disableAccessibilityMode(): void {
    this.settings = {
      ...this.settings,
      enabled: false,
      screenReaderMode: false,
      audioAnnouncements: false,
      highContrastMode: false,
      largeText: false,
      voiceGuidance: false,
      reducedMotion: false,
      audioDescriptions: false
    };

    this.applySettings();
    this.announce('Accessibility mode disabled.', 'medium');
    this.saveSettings();
    console.log('♿ Accessibility mode disabled');
  }

  /**
   * Update specific accessibility setting
   */
  updateSetting<K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ): void {
    this.settings[key] = value;
    this.applySettings();
    this.saveSettings();
  }

  /**
   * Get current accessibility settings
   */
  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  /**
   * Announce game state changes
   */
  announceGameState(announcement: GameStateAnnouncement): void {
    if (!this.settings.enabled || !this.settings.audioAnnouncements) return;

    this.announcementQueue.push(announcement);
    if (!this.isAnnouncing) {
      this.processAnnouncementQueue();
    }
  }

  /**
   * Announce chess move with full context
   */
  announceMove(
    piece: string, 
    from: string, 
    to: string, 
    isCapture: boolean = false,
    isCheck: boolean = false,
    isCheckmate: boolean = false
  ): void {
    let message = `${piece} moves from ${this.formatSquare(from)} to ${this.formatSquare(to)}`;
    
    if (isCapture) {
      message += ', capturing opponent piece';
    }
    
    if (isCheckmate) {
      message += '. Checkmate!';
    } else if (isCheck) {
      message += '. Check!';
    }

    this.announceGameState({
      type: 'move',
      message,
      priority: isCheckmate ? 'high' : isCheck ? 'medium' : 'low'
    });
  }

  /**
   * Announce available moves for selected piece
   */
  announceAvailableMoves(piece: string, square: string, availableMoves: string[]): void {
    if (!this.settings.voiceGuidance) return;

    const moveCount = availableMoves.length;
    let message = `${piece} on ${this.formatSquare(square)} has ${moveCount} available move${moveCount !== 1 ? 's' : ''}`;
    
    if (moveCount > 0) {
      const formattedMoves = availableMoves.map(move => this.formatSquare(move)).join(', ');
      message += `: ${formattedMoves}`;
    }

    this.announceGameState({
      type: 'available_moves',
      message,
      priority: 'medium'
    });
  }

  /**
   * Announce board position
   */
  announceBoardPosition(boardState: any[][]): void {
    if (!this.settings.audioDescriptions) return;

    let message = 'Board position: ';
    const pieces: string[] = [];

    for (let row = 0; row < boardState.length; row++) {
      for (let col = 0; col < boardState[row].length; col++) {
        const piece = boardState[row][col];
        if (piece) {
          const square = this.formatSquare(`${String.fromCharCode(97 + col)}${10 - row}`);
          pieces.push(`${piece.color} ${piece.type} on ${square}`);
        }
      }
    }

    if (pieces.length > 0) {
      message += pieces.slice(0, 5).join(', '); // Limit to first 5 pieces to avoid overwhelming
      if (pieces.length > 5) {
        message += `, and ${pieces.length - 5} more pieces`;
      }
    }

    this.announceGameState({
      type: 'position',
      message,
      priority: 'low'
    });
  }

  /**
   * Announce current turn
   */
  announceTurn(color: 'white' | 'black'): void {
    this.announceGameState({
      type: 'turn',
      message: `${color === 'white' ? 'White' : 'Black'} to move`,
      priority: 'medium'
    });
  }

  /**
   * Stop all audio announcements
   */
  stopAnnouncements(): void {
    if (this.currentUtterance && this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
    this.announcementQueue = [];
    this.isAnnouncing = false;
  }

  // Private methods

  private announce(text: string, priority: 'low' | 'medium' | 'high' = 'medium'): void {
    this.announceGameState({
      type: 'move',
      message: text,
      priority
    });
  }

  private async processAnnouncementQueue(): Promise<void> {
    if (this.announcementQueue.length === 0) {
      this.isAnnouncing = false;
      return;
    }

    this.isAnnouncing = true;
    const announcement = this.announcementQueue.shift()!;
    
    await this.speakText(announcement.message);
    
    // Process next announcement after a brief pause
    setTimeout(() => this.processAnnouncementQueue(), 300);
  }

  private speakText(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.speechSynthesis) {
        resolve();
        return;
      }

      this.currentUtterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance.rate = 0.9;
      this.currentUtterance.pitch = 1.0;
      this.currentUtterance.volume = 0.8;

      this.currentUtterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      this.currentUtterance.onerror = () => {
        this.currentUtterance = null;
        resolve();
      };

      this.speechSynthesis.speak(this.currentUtterance);
    });
  }

  private formatSquare(square: string): string {
    if (square.length !== 2) return square;
    
    const file = square[0].toUpperCase();
    const rank = square[1];
    return `${file} ${rank}`;
  }

  private applySettings(): void {
    this.applyHighContrastMode();
    this.applyLargeText();
    this.applyReducedMotion();
    this.applyScreenReaderSupport();
  }

  private applyHighContrastMode(): void {
    const body = document.body;
    if (this.settings.highContrastMode) {
      body.classList.add('high-contrast-mode');
    } else {
      body.classList.remove('high-contrast-mode');
    }
  }

  private applyLargeText(): void {
    const body = document.body;
    if (this.settings.largeText) {
      body.classList.add('large-text-mode');
    } else {
      body.classList.remove('large-text-mode');
    }
  }

  private applyReducedMotion(): void {
    const body = document.body;
    if (this.settings.reducedMotion) {
      body.classList.add('reduced-motion-mode');
    } else {
      body.classList.remove('reduced-motion-mode');
    }
  }

  private applyScreenReaderSupport(): void {
    const body = document.body;
    if (this.settings.screenReaderMode) {
      body.classList.add('screen-reader-mode');
      body.setAttribute('aria-live', 'polite');
    } else {
      body.classList.remove('screen-reader-mode');
      body.removeAttribute('aria-live');
    }
  }

  private setupKeyboardNavigation(): void {
    if (!this.settings.keyboardNavigation) return;

    document.addEventListener('keydown', (event) => {
      if (!this.settings.enabled) return;

      switch (event.key) {
        case 'Tab':
          // Enhanced tab navigation will be handled by individual components
          break;
        case 'Enter':
        case ' ':
          // Enhanced enter/space handling will be handled by individual components
          break;
        case 'Escape':
          this.stopAnnouncements();
          break;
        case 'h':
          if (event.ctrlKey) {
            event.preventDefault();
            this.announceHelp();
          }
          break;
      }
    });
  }

  private announceHelp(): void {
    const helpText = 'Accessibility help: Use Tab to navigate, Enter or Space to select, Arrow keys to move between squares, Escape to stop announcements, Control+H for this help message.';
    this.announce(helpText, 'high');
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('wizardChess_accessibility', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error);
    }
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('wizardChess_accessibility');
      if (saved) {
        const loadedSettings = JSON.parse(saved);
        this.settings = { ...this.settings, ...loadedSettings };
        this.applySettings();
      }
    } catch (error) {
      console.warn('Failed to load accessibility settings:', error);
    }
  }
}

export const accessibilityManager = new AccessibilityManager();