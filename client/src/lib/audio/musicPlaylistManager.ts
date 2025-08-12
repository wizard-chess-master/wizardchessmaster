/**
 * Dynamic Background Music Playlist Manager
 * Rotates through multiple MP3 files for varied gameplay experience
 */

export interface MusicTrack {
  id: string;
  name: string;
  file: string;
  duration?: number;
  volume?: number;
  mood?: 'calm' | 'epic' | 'mystical' | 'intense' | 'ambient';
}

export class MusicPlaylistManager {
  private tracks: MusicTrack[] = [];
  private currentTrack: HTMLAudioElement | null = null;
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private isShuffled: boolean = false;
  private volume: number = 0.42;
  private muted: boolean = false;
  private fadeTimeout: NodeJS.Timeout | null = null;
  
  // Default playlist with existing tracks
  private defaultPlaylist: MusicTrack[] = [
    {
      id: 'theme1',
      name: 'Wizard Castle Theme',
      file: '/assets/music/Theme-music1.mp3',
      mood: 'mystical'
    },
    {
      id: 'theme2', 
      name: 'Epic Battle Theme',
      file: '/assets/music/Theme-music2.mp3',
      mood: 'epic'
    }
  ];

  constructor() {
    this.tracks = [...this.defaultPlaylist];
    this.loadPlaylistFromStorage();
  }

  /**
   * Add new music tracks to playlist
   */
  addTracks(newTracks: MusicTrack[]): void {
    this.tracks.push(...newTracks);
    this.savePlaylistToStorage();
    console.log(`🎵 Added ${newTracks.length} tracks to playlist. Total: ${this.tracks.length}`);
  }

  /**
   * Add single track to playlist
   */
  addTrack(track: MusicTrack): void {
    this.tracks.push(track);
    this.savePlaylistToStorage();
    console.log(`🎵 Added "${track.name}" to playlist`);
  }

  /**
   * Remove track from playlist
   */
  removeTrack(trackId: string): void {
    const index = this.tracks.findIndex(t => t.id === trackId);
    if (index !== -1) {
      this.tracks.splice(index, 1);
      this.savePlaylistToStorage();
      console.log(`🎵 Removed track from playlist`);
      
      // Adjust current index if needed
      if (this.currentIndex >= this.tracks.length) {
        this.currentIndex = 0;
      }
    }
  }

  /**
   * Get current playlist
   */
  getPlaylist(): MusicTrack[] {
    return [...this.tracks];
  }

  /**
   * Get tracks by mood
   */
  getTracksByMood(mood: MusicTrack['mood']): MusicTrack[] {
    return this.tracks.filter(track => track.mood === mood);
  }

  /**
   * Shuffle playlist order
   */
  shuffle(): void {
    if (this.tracks.length <= 1) return;
    
    const currentTrack = this.tracks[this.currentIndex];
    
    // Fisher-Yates shuffle
    for (let i = this.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
    }
    
    // Find new index of current track
    this.currentIndex = this.tracks.findIndex(t => t.id === currentTrack.id);
    this.isShuffled = true;
    console.log('🔀 Playlist shuffled');
  }

  /**
   * Reset to original order
   */
  resetOrder(): void {
    this.tracks = [...this.defaultPlaylist];
    this.loadPlaylistFromStorage();
    this.currentIndex = 0;
    this.isShuffled = false;
    console.log('🔄 Playlist order reset');
  }

  /**
   * Start playing playlist
   */
  async play(): Promise<void> {
    if (this.tracks.length === 0) {
      console.warn('⚠️ No tracks in playlist');
      return;
    }

    if (this.muted) {
      console.log('🔇 Music is muted, not starting playlist');
      return;
    }

    this.isPlaying = true;
    await this.playCurrentTrack();
  }

  /**
   * Stop playlist
   */
  stop(): void {
    this.isPlaying = false;
    if (this.currentTrack) {
      this.currentTrack.pause();
      this.currentTrack.currentTime = 0;
      this.currentTrack = null;
    }
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }
    console.log('⏹️ Playlist stopped');
  }

  /**
   * Skip to next track
   */
  async next(): Promise<void> {
    if (this.tracks.length <= 1) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.tracks.length;
    
    if (this.isPlaying) {
      await this.playCurrentTrack();
    }
    console.log(`⏭️ Skipped to next track: ${this.tracks[this.currentIndex].name}`);
  }

  /**
   * Skip to previous track
   */
  async previous(): Promise<void> {
    if (this.tracks.length <= 1) return;
    
    this.currentIndex = this.currentIndex === 0 ? this.tracks.length - 1 : this.currentIndex - 1;
    
    if (this.isPlaying) {
      await this.playCurrentTrack();
    }
    console.log(`⏮️ Skipped to previous track: ${this.tracks[this.currentIndex].name}`);
  }

  /**
   * Play specific track by ID
   */
  async playTrack(trackId: string): Promise<void> {
    const index = this.tracks.findIndex(t => t.id === trackId);
    if (index === -1) {
      console.warn(`⚠️ Track not found: ${trackId}`);
      return;
    }
    
    this.currentIndex = index;
    this.isPlaying = true;
    await this.playCurrentTrack();
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.currentTrack) {
      this.currentTrack.volume = this.volume;
    }
    console.log(`🔊 Playlist volume set to ${Math.round(this.volume * 100)}%`);
  }

  /**
   * Mute/unmute
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.currentTrack) {
      this.currentTrack.muted = muted;
    }
    
    if (muted && this.isPlaying) {
      this.stop();
    } else if (!muted && !this.isPlaying) {
      this.play();
    }
    console.log(`🔇 Playlist ${muted ? 'muted' : 'unmuted'}`);
  }

  /**
   * Get current track info
   */
  getCurrentTrack(): MusicTrack | null {
    return this.tracks[this.currentIndex] || null;
  }

  /**
   * Get playlist state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      isShuffled: this.isShuffled,
      currentTrack: this.getCurrentTrack(),
      trackCount: this.tracks.length,
      volume: this.volume,
      muted: this.muted
    };
  }

  private async playCurrentTrack(): Promise<void> {
    if (this.tracks.length === 0) return;
    
    const track = this.tracks[this.currentIndex];
    if (!track) return;

    // Stop current track
    if (this.currentTrack) {
      this.currentTrack.pause();
      this.currentTrack.currentTime = 0;
    }

    try {
      // Create new audio element
      this.currentTrack = new Audio(`${track.file}?t=${Date.now()}`);
      this.currentTrack.volume = track.volume || this.volume;
      this.currentTrack.muted = this.muted;
      
      // Auto-advance to next track when current ends
      this.currentTrack.addEventListener('ended', () => {
        if (this.isPlaying) {
          this.next();
        }
      });

      // Error handling with fallback
      this.currentTrack.addEventListener('error', (e) => {
        console.error(`❌ Failed to load: ${track.name}`, e);
        this.next(); // Skip to next track on error
      });

      await this.currentTrack.play();
      console.log(`🎵 Now playing: ${track.name} (${track.mood || 'unknown mood'})`);
      
    } catch (error) {
      console.error(`❌ Error playing ${track.name}:`, error);
      // Try next track
      this.next();
    }
  }

  private savePlaylistToStorage(): void {
    try {
      const customTracks = this.tracks.filter(t => !this.defaultPlaylist.find(d => d.id === t.id));
      localStorage.setItem('wizard-chess-custom-tracks', JSON.stringify(customTracks));
    } catch (error) {
      console.warn('⚠️ Failed to save playlist to storage', error);
    }
  }

  private loadPlaylistFromStorage(): void {
    try {
      const stored = localStorage.getItem('wizard-chess-custom-tracks');
      if (stored) {
        const customTracks: MusicTrack[] = JSON.parse(stored);
        this.tracks = [...this.defaultPlaylist, ...customTracks];
        console.log(`🎵 Loaded ${customTracks.length} custom tracks from storage`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load playlist from storage', error);
    }
  }
}

// Global instance
export const musicPlaylistManager = new MusicPlaylistManager();