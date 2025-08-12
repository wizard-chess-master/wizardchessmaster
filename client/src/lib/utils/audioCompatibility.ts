/**
 * Cross-Browser Audio Compatibility Layer
 * Handles browser-specific AudioContext implementations
 */

interface AudioCompatibilityCheck {
  supported: boolean;
  vendor: 'webkit' | 'standard' | 'unsupported';
  features: {
    audioContext: boolean;
    webAudio: boolean;
    audioWorklet: boolean;
    mediaDevices: boolean;
    autoplay: boolean;
  };
  limitations: string[];
}

export class AudioCompatibilityManager {
  private audioContext: AudioContext | null = null;
  private compatibility: AudioCompatibilityCheck;
  private userGestureRequired = false;
  private resumeHandlers: Set<() => void> = new Set();

  constructor() {
    this.compatibility = this.checkCompatibility();
    this.setupAutoplayPolicy();
  }

  /**
   * Check browser audio compatibility
   */
  private checkCompatibility(): AudioCompatibilityCheck {
    const check: AudioCompatibilityCheck = {
      supported: false,
      vendor: 'unsupported',
      features: {
        audioContext: false,
        webAudio: false,
        audioWorklet: false,
        mediaDevices: false,
        autoplay: false
      },
      limitations: []
    };

    // Check for AudioContext support
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    
    if (AudioContextClass) {
      check.supported = true;
      check.features.audioContext = true;
      check.vendor = (window as any).webkitAudioContext ? 'webkit' : 'standard';
      
      // Check for Web Audio API
      check.features.webAudio = true;
      
      // Check for AudioWorklet (Chrome 66+, Firefox 76+)
      check.features.audioWorklet = 'audioWorklet' in AudioContextClass.prototype;
      
      // Check for MediaDevices API
      check.features.mediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    // Detect browser-specific limitations
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      check.limitations.push('Safari requires user gesture for audio playback');
      check.limitations.push('Safari may have issues with simultaneous audio sources');
      this.userGestureRequired = true;
    }
    
    if (userAgent.includes('firefox')) {
      check.limitations.push('Firefox may require permissions for audio capture');
    }
    
    if (userAgent.includes('edge')) {
      check.limitations.push('Edge may have latency issues with Web Audio API');
    }
    
    if (userAgent.includes('mobile')) {
      check.limitations.push('Mobile browsers require user interaction to play audio');
      check.limitations.push('Background audio may be restricted');
      this.userGestureRequired = true;
    }

    // Check autoplay policy
    this.checkAutoplayPolicy().then(canAutoplay => {
      check.features.autoplay = canAutoplay;
    });

    console.log('🔊 Audio Compatibility Check:', check);
    return check;
  }

  /**
   * Check browser autoplay policy
   */
  private async checkAutoplayPolicy(): Promise<boolean> {
    try {
      const testAudio = new Audio();
      testAudio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
      testAudio.volume = 0;
      await testAudio.play();
      testAudio.pause();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Setup autoplay policy handlers
   */
  private setupAutoplayPolicy(): void {
    if (this.userGestureRequired) {
      const enableAudio = () => {
        this.resumeAudioContext();
        // Remove listeners after first interaction
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('touchstart', enableAudio);
        document.removeEventListener('keydown', enableAudio);
      };

      document.addEventListener('click', enableAudio, { once: true });
      document.addEventListener('touchstart', enableAudio, { once: true });
      document.addEventListener('keydown', enableAudio, { once: true });
    }
  }

  /**
   * Create cross-browser AudioContext
   */
  createAudioContext(options?: AudioContextOptions): AudioContext | null {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      
      if (!AudioContextClass) {
        console.error('❌ AudioContext not supported in this browser');
        return null;
      }

      // Close existing context if any
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }

      // Create new context with browser-specific handling
      if (this.compatibility.vendor === 'webkit') {
        // Safari/WebKit specific
        this.audioContext = new (window as any).webkitAudioContext();
      } else {
        // Standard implementation
        this.audioContext = new AudioContext(options);
      }

      // Handle suspended state (autoplay policy)
      if (this.audioContext.state === 'suspended') {
        console.log('⏸️ AudioContext suspended due to autoplay policy');
        this.setupResumeHandlers();
      }

      // Monitor state changes
      this.audioContext.addEventListener('statechange', () => {
        console.log(`🔊 AudioContext state: ${this.audioContext?.state}`);
      });

      return this.audioContext;
    } catch (error) {
      console.error('❌ Failed to create AudioContext:', error);
      return null;
    }
  }

  /**
   * Setup handlers to resume AudioContext
   */
  private setupResumeHandlers(): void {
    const resume = async () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume();
          console.log('✅ AudioContext resumed');
          
          // Notify all handlers
          this.resumeHandlers.forEach(handler => handler());
          this.resumeHandlers.clear();
        } catch (error) {
          console.error('❌ Failed to resume AudioContext:', error);
        }
      }
    };

    // Add resume triggers
    document.addEventListener('click', resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });
  }

  /**
   * Resume AudioContext if suspended
   */
  async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('✅ AudioContext resumed successfully');
      } catch (error) {
        console.error('❌ Failed to resume AudioContext:', error);
      }
    }
  }

  /**
   * Add handler for when audio is resumed
   */
  onAudioResumed(handler: () => void): void {
    if (this.audioContext && this.audioContext.state === 'running') {
      // Already running, call immediately
      handler();
    } else {
      // Add to handlers for when resumed
      this.resumeHandlers.add(handler);
    }
  }

  /**
   * Create audio buffer source with compatibility
   */
  createBufferSource(buffer: AudioBuffer): AudioBufferSourceNode | null {
    if (!this.audioContext) {
      console.error('❌ No AudioContext available');
      return null;
    }

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      
      // Safari compatibility for playback rate
      if (this.compatibility.vendor === 'webkit') {
        source.playbackRate.value = 1.0;
      }

      return source;
    } catch (error) {
      console.error('❌ Failed to create buffer source:', error);
      return null;
    }
  }

  /**
   * Decode audio data with compatibility
   */
  async decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer | null> {
    if (!this.audioContext) {
      console.error('❌ No AudioContext available');
      return null;
    }

    try {
      // Modern promise-based API
      if (this.audioContext.decodeAudioData.length === 1) {
        return await this.audioContext.decodeAudioData(arrayBuffer);
      } 
      // Legacy callback-based API (Safari)
      else {
        return new Promise((resolve, reject) => {
          if (!this.audioContext) {
            reject(new Error('AudioContext is null'));
            return;
          }
          this.audioContext.decodeAudioData(
            arrayBuffer,
            (buffer) => resolve(buffer),
            (error) => reject(error)
          );
        });
      }
    } catch (error) {
      console.error('❌ Failed to decode audio data:', error);
      return null;
    }
  }

  /**
   * Get audio latency hint based on browser
   */
  getLatencyHint(): AudioContextLatencyCategory | number {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('mobile')) {
      return 'playback'; // Higher latency, better stability on mobile
    }
    
    if (userAgent.includes('safari')) {
      return 0.02; // 20ms - Safari specific tuning
    }
    
    return 'interactive'; // Default for desktop browsers
  }

  /**
   * Check if audio format is supported
   */
  canPlayType(mimeType: string): boolean {
    const audio = new Audio();
    const canPlay = audio.canPlayType(mimeType);
    return canPlay === 'probably' || canPlay === 'maybe';
  }

  /**
   * Get supported audio formats
   */
  getSupportedFormats(): string[] {
    const formats = [
      'audio/mpeg', // MP3
      'audio/ogg',  // OGG Vorbis
      'audio/wav',  // WAV
      'audio/webm', // WebM
      'audio/mp4',  // MP4/AAC
      'audio/flac'  // FLAC
    ];

    return formats.filter(format => this.canPlayType(format));
  }

  /**
   * Browser-specific audio element creation
   */
  createAudioElement(src: string): HTMLAudioElement {
    const audio = new Audio();
    
    // Safari-specific attributes
    if (this.compatibility.vendor === 'webkit') {
      audio.setAttribute('webkit-playsinline', 'true');
      audio.setAttribute('playsinline', 'true');
    }
    
    // Mobile-specific attributes
    if (navigator.userAgent.toLowerCase().includes('mobile')) {
      audio.setAttribute('playsinline', 'true');
      audio.muted = true; // Start muted on mobile
    }
    
    // Preload strategy
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    
    audio.src = src;
    
    return audio;
  }

  /**
   * Cleanup audio context
   */
  async cleanup(): Promise<void> {
    if (this.audioContext) {
      try {
        await this.audioContext.close();
        console.log('✅ AudioContext closed');
      } catch (error) {
        console.error('❌ Failed to close AudioContext:', error);
      }
      this.audioContext = null;
    }
    
    this.resumeHandlers.clear();
  }

  /**
   * Get compatibility report
   */
  getCompatibilityReport(): AudioCompatibilityCheck {
    return this.compatibility;
  }

  /**
   * Check if user gesture is required
   */
  isUserGestureRequired(): boolean {
    return this.userGestureRequired;
  }
}

// Singleton instance
export const audioCompatibilityManager = new AudioCompatibilityManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  audioCompatibilityManager.cleanup();
});

export default audioCompatibilityManager;