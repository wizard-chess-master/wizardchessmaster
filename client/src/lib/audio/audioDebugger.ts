/**
 * Audio Debugger
 * Provides debugging tools and diagnostics for audio issues
 */

import { audioOptimizer } from './audioOptimizer';
import { audioSettings } from './audioSettings';
import { mobileAudioHandler } from './mobileAudioHandler';

export interface AudioDiagnostics {
  timestamp: number;
  browserInfo: {
    userAgent: string;
    platform: string;
    vendor: string;
  };
  audioCapabilities: {
    webAudioAPI: boolean;
    audioContext: boolean;
    audioWorklet: boolean;
    mediaDevices: boolean;
    autoplay: boolean;
  };
  performance: {
    cacheHits: number;
    cacheMisses: number;
    averageLoadTime: number;
    memoryUsage: number;
    activeAudioNodes: number;
  };
  settings: any;
  mobileState: any;
  errors: AudioError[];
  warnings: string[];
}

export interface AudioError {
  timestamp: number;
  type: string;
  message: string;
  stack?: string;
  context?: any;
}

class AudioDebugger {
  private errors: AudioError[] = [];
  private warnings: string[] = [];
  private performanceLogs: Map<string, number[]> = new Map();
  private debugMode = false;
  private maxErrorHistory = 50;
  private audioTestResults: Map<string, boolean> = new Map();

  constructor() {
    this.setupErrorHandlers();
    this.runInitialTests();
  }

  /**
   * Setup global error handlers for audio
   */
  private setupErrorHandlers(): void {
    // Intercept console errors
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('audio') || message.includes('Audio') || message.includes('sound')) {
        this.logError('console', message);
      }
      originalError.apply(console, args);
    };

    // Listen for unhandled promise rejections related to audio
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.toString().toLowerCase().includes('audio')) {
        this.logError('promise', event.reason.toString());
      }
    });
  }

  /**
   * Run initial capability tests
   */
  private async runInitialTests(): Promise<void> {
    console.log('🔍 Running audio capability tests...');

    // Test Web Audio API
    this.audioTestResults.set('webAudioAPI', 'AudioContext' in window || 'webkitAudioContext' in window);
    
    // Test Audio element
    this.audioTestResults.set('htmlAudio', typeof Audio !== 'undefined');
    
    // Test media devices
    this.audioTestResults.set('mediaDevices', !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
    
    // Test audio formats
    const audio = new Audio();
    this.audioTestResults.set('mp3Support', audio.canPlayType('audio/mpeg') !== '');
    this.audioTestResults.set('oggSupport', audio.canPlayType('audio/ogg') !== '');
    this.audioTestResults.set('wavSupport', audio.canPlayType('audio/wav') !== '');
    this.audioTestResults.set('webmSupport', audio.canPlayType('audio/webm') !== '');

    // Test autoplay
    await this.testAutoplay();

    this.printTestResults();
  }

  /**
   * Test autoplay capability
   */
  private async testAutoplay(): Promise<void> {
    try {
      const testAudio = new Audio();
      testAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
      testAudio.volume = 0;
      await testAudio.play();
      testAudio.pause();
      this.audioTestResults.set('autoplay', true);
    } catch {
      this.audioTestResults.set('autoplay', false);
      this.warnings.push('Autoplay is blocked - user interaction required');
    }
  }

  /**
   * Print test results to console
   */
  private printTestResults(): void {
    console.group('🔊 Audio Capability Test Results');
    
    this.audioTestResults.forEach((result, test) => {
      const icon = result ? '✅' : '❌';
      console.log(`${icon} ${test}: ${result}`);
    });
    
    if (this.warnings.length > 0) {
      console.warn('⚠️ Warnings:', this.warnings);
    }
    
    console.groupEnd();
  }

  /**
   * Enable debug mode
   */
  enableDebugMode(): void {
    this.debugMode = true;
    console.log('🐛 Audio debug mode enabled');
    
    // Add debug overlay
    this.createDebugOverlay();
  }

  /**
   * Disable debug mode
   */
  disableDebugMode(): void {
    this.debugMode = false;
    console.log('🐛 Audio debug mode disabled');
    
    // Remove debug overlay
    this.removeDebugOverlay();
  }

  /**
   * Log an error
   */
  logError(type: string, message: string, context?: any): void {
    const error: AudioError = {
      timestamp: Date.now(),
      type,
      message,
      context,
      stack: new Error().stack
    };
    
    this.errors.push(error);
    
    // Trim error history
    if (this.errors.length > this.maxErrorHistory) {
      this.errors.shift();
    }
    
    if (this.debugMode) {
      console.error(`🔊 Audio Error [${type}]:`, message, context);
    }
  }

  /**
   * Log performance metric
   */
  logPerformance(metric: string, value: number): void {
    if (!this.performanceLogs.has(metric)) {
      this.performanceLogs.set(metric, []);
    }
    
    const logs = this.performanceLogs.get(metric)!;
    logs.push(value);
    
    // Keep only last 100 entries
    if (logs.length > 100) {
      logs.shift();
    }
    
    if (this.debugMode) {
      console.log(`📊 Audio Performance [${metric}]: ${value.toFixed(2)}ms`);
    }
  }

  /**
   * Get full diagnostics report
   */
  getDiagnostics(): AudioDiagnostics {
    const optimizerMetrics = audioOptimizer.getMetrics();
    const currentSettings = audioSettings.getSettings();
    const mobileState = mobileAudioHandler.getState();
    
    return {
      timestamp: Date.now(),
      browserInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        vendor: navigator.vendor
      },
      audioCapabilities: {
        webAudioAPI: this.audioTestResults.get('webAudioAPI') || false,
        audioContext: 'AudioContext' in window,
        audioWorklet: 'AudioWorklet' in window,
        mediaDevices: this.audioTestResults.get('mediaDevices') || false,
        autoplay: this.audioTestResults.get('autoplay') || false
      },
      performance: optimizerMetrics,
      settings: currentSettings,
      mobileState: mobileState,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * Export diagnostics as JSON
   */
  exportDiagnostics(): string {
    return JSON.stringify(this.getDiagnostics(), null, 2);
  }

  /**
   * Test audio playback with various formats
   */
  async testPlayback(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    const testFiles = [
      { name: 'MP3', url: '/sounds/success.mp3' },
      { name: 'Hit Sound', url: '/sounds/hit.mp3' }
    ];

    for (const test of testFiles) {
      try {
        const audio = new Audio(test.url);
        audio.volume = 0.1;
        await audio.play();
        audio.pause();
        results.set(test.name, true);
        console.log(`✅ ${test.name} playback successful`);
      } catch (error) {
        results.set(test.name, false);
        console.error(`❌ ${test.name} playback failed:`, error);
        this.logError('playback', `Failed to play ${test.name}`, { url: test.url, error });
      }
    }

    return results;
  }

  /**
   * Create debug overlay UI
   */
  private createDebugOverlay(): void {
    // Check if overlay already exists
    if (document.getElementById('audio-debug-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'audio-debug-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 5px;
      z-index: 10000;
      max-width: 300px;
      max-height: 400px;
      overflow-y: auto;
    `;

    // Update overlay content
    const updateOverlay = () => {
      const metrics = audioOptimizer.getMetrics();
      const mobileState = mobileAudioHandler.getState();
      
      overlay.innerHTML = `
        <div style="border-bottom: 1px solid #0f0; margin-bottom: 5px; padding-bottom: 5px;">
          <strong>🔊 Audio Debug Panel</strong>
        </div>
        <div>Cache Hits: ${metrics.cacheHits}</div>
        <div>Cache Misses: ${metrics.cacheMisses}</div>
        <div>Avg Load: ${metrics.averageLoadTime.toFixed(2)}ms</div>
        <div>Memory: ${metrics.memoryUsage.toFixed(2)}MB</div>
        <div>Active Nodes: ${metrics.activeAudioNodes}</div>
        <div style="margin-top: 5px;">Mobile: ${mobileState.isUnlocked ? '✅' : '❌'}</div>
        <div>Autoplay: ${mobileState.canAutoplay ? '✅' : '❌'}</div>
        <div>Errors: ${this.errors.length}</div>
        ${this.errors.length > 0 ? `
          <div style="margin-top: 5px; color: #f00;">
            Last Error: ${this.errors[this.errors.length - 1].message.substring(0, 50)}...
          </div>
        ` : ''}
      `;
    };

    document.body.appendChild(overlay);
    updateOverlay();

    // Update every second
    const intervalId = setInterval(updateOverlay, 1000);
    
    // Store interval ID for cleanup
    (overlay as any).updateInterval = intervalId;
  }

  /**
   * Remove debug overlay
   */
  private removeDebugOverlay(): void {
    const overlay = document.getElementById('audio-debug-overlay');
    if (overlay) {
      // Clear update interval
      if ((overlay as any).updateInterval) {
        clearInterval((overlay as any).updateInterval);
      }
      overlay.remove();
    }
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errors = [];
    this.warnings = [];
    console.log('🗑️ Audio error history cleared');
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): Map<string, { avg: number; min: number; max: number }> {
    const stats = new Map();
    
    this.performanceLogs.forEach((values, metric) => {
      if (values.length === 0) return;
      
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      stats.set(metric, { avg, min, max });
    });
    
    return stats;
  }

  /**
   * Run comprehensive audio test suite
   */
  async runFullTest(): Promise<void> {
    console.group('🎵 Running Full Audio Test Suite');
    
    // Test capabilities
    await this.runInitialTests();
    
    // Test playback
    console.log('\n📢 Testing playback...');
    const playbackResults = await this.testPlayback();
    
    // Test optimizer
    console.log('\n⚡ Testing optimizer...');
    await audioOptimizer.initialize();
    const metrics = audioOptimizer.getMetrics();
    console.log('Optimizer metrics:', metrics);
    
    // Test mobile handler
    console.log('\n📱 Testing mobile handler...');
    const mobileState = mobileAudioHandler.getState();
    console.log('Mobile state:', mobileState);
    
    // Test settings
    console.log('\n⚙️ Testing settings...');
    const settings = audioSettings.getSettings();
    console.log('Current settings:', settings);
    
    console.groupEnd();
    
    // Generate report
    const report = {
      capabilities: Object.fromEntries(this.audioTestResults),
      playback: Object.fromEntries(playbackResults),
      optimizer: metrics,
      mobile: mobileState,
      settings: settings,
      errors: this.errors.length,
      warnings: this.warnings
    };
    
    console.log('\n📊 Test Report:', report);
  }
}

// Export singleton instance
export const audioDebugger = new AudioDebugger();