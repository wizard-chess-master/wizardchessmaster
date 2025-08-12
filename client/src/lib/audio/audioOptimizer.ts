/**
 * Audio Performance Optimizer
 * Handles audio preloading, caching, and performance optimization
 */

export interface AudioCacheEntry {
  buffer: AudioBuffer | null;
  audio: HTMLAudioElement | null;
  lastUsed: number;
  preloaded: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface AudioPerformanceMetrics {
  totalLoaded: number;
  cacheHits: number;
  cacheMisses: number;
  averageLoadTime: number;
  memoryUsage: number;
  activeAudioNodes: number;
}

class AudioOptimizer {
  private audioCache: Map<string, AudioCacheEntry> = new Map();
  private audioContext: AudioContext | null = null;
  private loadingPromises: Map<string, Promise<AudioCacheEntry>> = new Map();
  private metrics: AudioPerformanceMetrics = {
    totalLoaded: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageLoadTime: 0,
    memoryUsage: 0,
    activeAudioNodes: 0
  };
  private maxCacheSize = 50; // Maximum number of cached audio files
  private preloadQueue: string[] = [];
  private isPreloading = false;

  // Critical sounds that should always be preloaded
  private criticalSounds = [
    '/sounds/success.mp3',
    '/sounds/hit.mp3',
    '/assets/sound-fx/piece_move.mp3',
    '/assets/sound-fx/piece_capture.mp3',
    '/assets/sound-fx/button_click.mp3'
  ];

  /**
   * Initialize the audio optimizer
   */
  async initialize(): Promise<void> {
    try {
      // Create or reuse audio context
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Handle Chrome autoplay policy
      if (this.audioContext.state === 'suspended') {
        document.addEventListener('click', () => {
          this.audioContext?.resume();
        }, { once: true });
      }

      // Preload critical sounds
      await this.preloadCriticalSounds();

      console.log('✅ Audio Optimizer initialized');
    } catch (error) {
      console.warn('⚠️ Audio Optimizer initialization failed:', error);
    }
  }

  /**
   * Preload critical sounds for instant playback
   */
  private async preloadCriticalSounds(): Promise<void> {
    const preloadPromises = this.criticalSounds.map(url => 
      this.preloadAudio(url, 'high')
    );

    try {
      await Promise.all(preloadPromises);
      console.log(`✅ Preloaded ${this.criticalSounds.length} critical sounds`);
    } catch (error) {
      console.warn('⚠️ Some critical sounds failed to preload:', error);
    }
  }

  /**
   * Preload an audio file
   */
  async preloadAudio(url: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<AudioCacheEntry> {
    // Check if already cached
    const cached = this.audioCache.get(url);
    if (cached && cached.preloaded) {
      this.metrics.cacheHits++;
      cached.lastUsed = Date.now();
      return cached;
    }

    // Check if already loading
    const existingPromise = this.loadingPromises.get(url);
    if (existingPromise) {
      return existingPromise;
    }

    // Create loading promise
    const loadPromise = this.loadAudioFile(url, priority);
    this.loadingPromises.set(url, loadPromise);

    try {
      const result = await loadPromise;
      this.loadingPromises.delete(url);
      return result;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  /**
   * Load an audio file into cache
   */
  private async loadAudioFile(url: string, priority: 'high' | 'medium' | 'low'): Promise<AudioCacheEntry> {
    const startTime = performance.now();
    this.metrics.cacheMisses++;

    try {
      // Create HTML Audio element for compatibility
      const audio = new Audio(url);
      audio.preload = 'auto';
      
      // Also load as AudioBuffer for Web Audio API
      let buffer: AudioBuffer | null = null;
      if (this.audioContext && priority === 'high') {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          buffer = await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
          console.warn(`⚠️ Failed to load AudioBuffer for ${url}:`, error);
        }
      }

      // Wait for HTML audio to be ready
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.load();
      });

      // Create cache entry
      const entry: AudioCacheEntry = {
        buffer,
        audio,
        lastUsed: Date.now(),
        preloaded: true,
        priority
      };

      // Add to cache
      this.audioCache.set(url, entry);
      this.metrics.totalLoaded++;

      // Update average load time
      const loadTime = performance.now() - startTime;
      this.metrics.averageLoadTime = 
        (this.metrics.averageLoadTime * (this.metrics.totalLoaded - 1) + loadTime) / 
        this.metrics.totalLoaded;

      // Clean cache if needed
      this.cleanCache();

      console.log(`📦 Cached audio: ${url} (${loadTime.toFixed(2)}ms)`);
      return entry;

    } catch (error) {
      console.error(`❌ Failed to load audio: ${url}`, error);
      
      // Create fallback entry
      const fallbackEntry: AudioCacheEntry = {
        buffer: null,
        audio: null,
        lastUsed: Date.now(),
        preloaded: false,
        priority
      };
      
      this.audioCache.set(url, fallbackEntry);
      return fallbackEntry;
    }
  }

  /**
   * Get cached audio or load it
   */
  async getCachedAudio(url: string): Promise<AudioCacheEntry> {
    const cached = this.audioCache.get(url);
    if (cached) {
      cached.lastUsed = Date.now();
      this.metrics.cacheHits++;
      return cached;
    }

    return this.preloadAudio(url, 'medium');
  }

  /**
   * Play audio with optimization
   */
  async playOptimized(url: string, volume: number = 1.0): Promise<void> {
    try {
      const entry = await this.getCachedAudio(url);
      
      // Use Web Audio API if available (better performance)
      if (entry.buffer && this.audioContext) {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = entry.buffer;
        gainNode.gain.value = volume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start(0);
        this.metrics.activeAudioNodes++;
        
        source.onended = () => {
          this.metrics.activeAudioNodes--;
          source.disconnect();
          gainNode.disconnect();
        };
      } 
      // Fallback to HTML Audio
      else if (entry.audio) {
        const audioClone = entry.audio.cloneNode() as HTMLAudioElement;
        audioClone.volume = volume;
        audioClone.play().catch(error => {
          console.warn('⚠️ Audio playback failed:', error);
        });
      }
    } catch (error) {
      console.error('❌ Failed to play optimized audio:', error);
    }
  }

  /**
   * Clean cache to prevent memory issues
   */
  private cleanCache(): void {
    if (this.audioCache.size <= this.maxCacheSize) return;

    // Sort by last used time and priority
    const entries = Array.from(this.audioCache.entries())
      .sort((a, b) => {
        // Keep high priority items
        if (a[1].priority !== b[1].priority) {
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          return priorityWeight[b[1].priority] - priorityWeight[a[1].priority];
        }
        // Sort by last used
        return b[1].lastUsed - a[1].lastUsed;
      });

    // Remove least recently used low-priority items
    const toRemove = entries.slice(this.maxCacheSize * 0.8);
    for (const [url] of toRemove) {
      this.audioCache.delete(url);
      console.log(`🗑️ Removed from cache: ${url}`);
    }
  }

  /**
   * Batch preload multiple audio files
   */
  async batchPreload(urls: string[], priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
    const batchSize = 3; // Load 3 files at a time
    
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      await Promise.all(batch.map(url => this.preloadAudio(url, priority)));
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): AudioPerformanceMetrics {
    // Calculate memory usage estimate
    let memoryEstimate = 0;
    this.audioCache.forEach(entry => {
      if (entry.buffer) {
        // Estimate: 4 bytes per sample * channels * sample rate * duration
        memoryEstimate += entry.buffer.length * entry.buffer.numberOfChannels * 4;
      }
    });

    return {
      ...this.metrics,
      memoryUsage: memoryEstimate / (1024 * 1024) // Convert to MB
    };
  }

  /**
   * Clear all cached audio
   */
  clearCache(): void {
    this.audioCache.forEach(entry => {
      if (entry.audio) {
        entry.audio.pause();
        entry.audio.src = '';
      }
    });
    
    this.audioCache.clear();
    this.metrics = {
      totalLoaded: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageLoadTime: 0,
      memoryUsage: 0,
      activeAudioNodes: 0
    };
    
    console.log('🗑️ Audio cache cleared');
  }

  /**
   * Suspend audio context to save resources
   */
  suspend(): void {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
      console.log('⏸️ Audio context suspended');
    }
  }

  /**
   * Resume audio context
   */
  resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
      console.log('▶️ Audio context resumed');
    }
  }

  /**
   * Dispose of the audio optimizer
   */
  dispose(): void {
    this.clearCache();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    console.log('🔇 Audio optimizer disposed');
  }
}

// Export singleton instance
export const audioOptimizer = new AudioOptimizer();