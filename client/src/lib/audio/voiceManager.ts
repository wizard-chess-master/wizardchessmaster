/**
 * Voice Management System for Narrator, Coach, and Assistant
 * Handles voice playback, queuing, and contextual audio guidance
 */

export type VoiceType = 'narrator' | 'coach' | 'assistant';

export interface VoiceClip {
  id: string;
  type: VoiceType;
  file: string;
  text: string;
  duration?: number;
  priority: 'low' | 'medium' | 'high';
  context?: string;
}

export interface VoiceQueue {
  clips: VoiceClip[];
  currentlyPlaying: VoiceClip | null;
  isPlaying: boolean;
}

class VoiceManager {
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private queue: VoiceQueue = {
    clips: [],
    currentlyPlaying: null,
    isPlaying: false
  };
  private isInitialized = false;
  private volume = 0.8;
  private isMuted = false;

  /**
   * Initialize the voice management system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      console.log('🎭 Voice Manager initialized');
    } catch (error) {
      console.warn('🎭 Voice Manager initialization failed:', error);
    }
  }

  /**
   * Play a voice clip by ID
   */
  async playVoice(voiceId: string, immediate = false): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (this.isMuted) return;

    const clip = this.getVoiceClip(voiceId);
    if (!clip) {
      console.warn(`🎭 Voice clip not found: ${voiceId}`);
      return;
    }

    if (immediate) {
      await this.playClipImmediately(clip);
    } else {
      this.addToQueue(clip);
    }
  }

  /**
   * Play narrator voice for story elements
   */
  async playNarrator(clipId: string, immediate = false): Promise<void> {
    return this.playVoice(`narrator_${clipId}`, immediate);
  }

  /**
   * Play coach voice for gameplay tips
   */
  async playCoach(clipId: string, immediate = false): Promise<void> {
    return this.playVoice(`coach_${clipId}`, immediate);
  }

  /**
   * Play assistant voice for UI guidance
   */
  async playAssistant(clipId: string, immediate = false): Promise<void> {
    return this.playVoice(`assistant_${clipId}`, immediate);
  }

  /**
   * Stop current voice and clear queue
   */
  stopAll(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    this.queue.clips = [];
    this.queue.currentlyPlaying = null;
    this.queue.isPlaying = false;
    
    console.log('🎭 All voice playback stopped');
  }

  /**
   * Set voice volume (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
  }

  /**
   * Mute/unmute voice system
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopAll();
    }
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): VoiceQueue {
    return { ...this.queue };
  }

  // Private methods

  private getVoiceClip(voiceId: string): VoiceClip | null {
    // This will be populated when voice files are added
    // For now, return a placeholder structure
    return {
      id: voiceId,
      type: voiceId.startsWith('narrator') ? 'narrator' : 
            voiceId.startsWith('coach') ? 'coach' : 'assistant',
      file: `/audio/voices/${voiceId}.mp3`,
      text: '',
      priority: 'medium'
    };
  }

  private addToQueue(clip: VoiceClip): void {
    this.queue.clips.push(clip);
    if (!this.queue.isPlaying) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.queue.clips.length === 0) {
      this.queue.isPlaying = false;
      return;
    }

    this.queue.isPlaying = true;
    const clip = this.queue.clips.shift()!;
    await this.playClipImmediately(clip);
    
    // Continue processing queue
    setTimeout(() => this.processQueue(), 100);
  }

  private async playClipImmediately(clip: VoiceClip): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.currentAudio) {
          this.currentAudio.pause();
        }

        this.currentAudio = new Audio(clip.file);
        this.currentAudio.volume = this.volume;
        this.queue.currentlyPlaying = clip;

        this.currentAudio.addEventListener('ended', () => {
          this.queue.currentlyPlaying = null;
          resolve();
        });

        this.currentAudio.addEventListener('error', (error) => {
          console.warn(`🎭 Voice playback failed: ${clip.id}`, error);
          this.queue.currentlyPlaying = null;
          reject(error);
        });

        this.currentAudio.play().catch(reject);
        console.log(`🎭 Playing voice: ${clip.type} - ${clip.id}`);
        
      } catch (error) {
        console.warn(`🎭 Voice clip load failed: ${clip.id}`, error);
        reject(error);
      }
    });
  }
}

export const voiceManager = new VoiceManager();