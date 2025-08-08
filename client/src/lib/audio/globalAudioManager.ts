/**
 * Global Audio Manager for Button Clicks and UI Sounds
 * Uses HTML5 Audio API with MP3 files from /assets/sound-fx directory
 */

class GlobalAudioManager {
  private buttonClickAudio: HTMLAudioElement | null = null;
  private isInitialized = false;
  private isMuted = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Load button click sound from /assets/sound-fx
      this.buttonClickAudio = new Audio('/assets/sound-fx/button_click.mp3');
      this.buttonClickAudio.preload = 'auto';
      this.buttonClickAudio.volume = 0.6;
      
      // Test if audio can be loaded
      await new Promise((resolve, reject) => {
        if (!this.buttonClickAudio) {
          reject(new Error('Audio element not created'));
          return;
        }
        
        this.buttonClickAudio.oncanplaythrough = () => resolve(true);
        this.buttonClickAudio.onerror = reject;
        this.buttonClickAudio.load();
      });
      
      this.isInitialized = true;
      console.log('✅ Global Audio Manager initialized successfully');
    } catch (error) {
      console.warn('⚠️ Global Audio Manager initialization failed:', error);
      this.isInitialized = false;
    }
  }

  public async onButtonClick(): Promise<void> {
    if (!this.isInitialized || this.isMuted || !this.buttonClickAudio) {
      return;
    }

    try {
      // Reset audio to start if it's already playing
      this.buttonClickAudio.currentTime = 0;
      await this.buttonClickAudio.play();
      console.log('🔊 Button click sound played');
    } catch (error) {
      console.warn('⚠️ Button click sound failed:', error);
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    console.log(`🔊 Global audio ${muted ? 'muted' : 'unmuted'}`);
  }

  public isMutedState(): boolean {
    return this.isMuted;
  }

  public async testButtonSound(): Promise<void> {
    console.log('🎵 Testing button sound...');
    await this.onButtonClick();
  }
}

// Create global instance
const globalAudioManager = new GlobalAudioManager();

// Make it available globally
(window as any).gameAudioManager = globalAudioManager;

export { globalAudioManager };
export default globalAudioManager;