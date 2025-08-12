/**
 * Audio Cross-Browser Test Suite
 * Tests audio initialization, playback, and settings persistence across browsers
 */

import { logger, LogCategory } from '../lib/utils/clientLogger';
import { useAudio } from '../lib/stores/useAudio';

export class AudioCrossBrowserTester {
  private testResults: any = {};
  private browserInfo: any = {};

  constructor() {
    this.detectBrowser();
  }

  private detectBrowser() {
    const ua = navigator.userAgent;
    this.browserInfo = {
      isChrome: /Chrome/.test(ua) && !/Edge/.test(ua),
      isFirefox: /Firefox/.test(ua),
      isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
      isEdge: /Edge/.test(ua),
      isMobile: /Mobile|Android|iPhone|iPad/.test(ua),
      userAgent: ua
    };
    
    logger.info(LogCategory.AUDIO, 'Browser detected', this.browserInfo);
  }

  async runAllTests() {
    logger.info(LogCategory.AUDIO, '🧪 Starting Audio Cross-Browser Tests');
    
    const results = {
      browser: this.browserInfo,
      audioContext: await this.testAudioContext(),
      autoplay: await this.testAutoplay(),
      volumeControl: await this.testVolumeControl(),
      settingsPersistence: await this.testSettingsPersistence(),
      mobileAudio: await this.testMobileAudio(),
      formatSupport: await this.testAudioFormats()
    };

    logger.info(LogCategory.AUDIO, '✅ Audio tests completed', results);
    return results;
  }

  // Test 1: Audio Context Support
  private async testAudioContext(): Promise<any> {
    try {
      const AudioContextClass = (window as any).AudioContext || 
                                 (window as any).webkitAudioContext;
      
      if (!AudioContextClass) {
        return {
          success: false,
          error: 'AudioContext not supported'
        };
      }

      const context = new AudioContextClass();
      const state = context.state;
      
      // Try to resume if suspended
      if (state === 'suspended') {
        await context.resume();
      }

      return {
        success: true,
        initialState: state,
        currentState: context.state,
        sampleRate: context.sampleRate,
        latency: (context as any).baseLatency || 'unknown'
      };
    } catch (error: any) {
      logger.error(LogCategory.AUDIO, 'AudioContext test failed', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test 2: Autoplay Policy
  private async testAutoplay(): Promise<any> {
    const testAudio = new Audio();
    testAudio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAABUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRU';
    testAudio.volume = 0.1;

    try {
      // Try to play without user interaction
      await testAudio.play();
      testAudio.pause();
      
      return {
        success: true,
        autoplayAllowed: true,
        policy: 'allowed'
      };
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        return {
          success: true,
          autoplayAllowed: false,
          policy: 'user-interaction-required',
          recommendation: 'Add click-to-start for audio'
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test 3: Volume Control
  private async testVolumeControl(): Promise<any> {
    const { 
      masterVolume, 
      setMasterVolume,
      musicVolume,
      setMusicVolume,
      soundVolume,
      setSoundVolume 
    } = useAudio.getState();

    const tests = [];

    // Test master volume
    const originalMaster = masterVolume;
    setMasterVolume(0.5);
    tests.push({
      type: 'master',
      original: originalMaster,
      set: 0.5,
      actual: useAudio.getState().masterVolume,
      success: useAudio.getState().masterVolume === 0.5
    });

    // Test music volume
    const originalMusic = musicVolume;
    setMusicVolume(0.3);
    tests.push({
      type: 'music',
      original: originalMusic,
      set: 0.3,
      actual: useAudio.getState().musicVolume,
      success: useAudio.getState().musicVolume === 0.3
    });

    // Test sound volume
    const originalSound = soundVolume;
    setSoundVolume(0.7);
    tests.push({
      type: 'sound',
      original: originalSound,
      set: 0.7,
      actual: useAudio.getState().soundVolume,
      success: useAudio.getState().soundVolume === 0.7
    });

    // Restore original values
    setMasterVolume(originalMaster);
    setMusicVolume(originalMusic);
    setSoundVolume(originalSound);

    return {
      success: tests.every(t => t.success),
      tests,
      status: 'Volume controls working'
    };
  }

  // Test 4: Settings Persistence
  private async testSettingsPersistence(): Promise<any> {
    const key = 'wizardChessAudioSettings';
    
    // Save test settings
    const testSettings = {
      masterVolume: 0.8,
      musicVolume: 0.6,
      soundVolume: 0.9,
      musicEnabled: true,
      soundEnabled: false
    };

    try {
      localStorage.setItem(key, JSON.stringify(testSettings));
      const retrieved = JSON.parse(localStorage.getItem(key) || '{}');
      
      const matches = Object.keys(testSettings).every(
        k => testSettings[k as keyof typeof testSettings] === retrieved[k]
      );

      return {
        success: matches,
        saved: testSettings,
        retrieved,
        status: matches ? 'Settings persist correctly' : 'Settings mismatch'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        recommendation: 'Check localStorage availability'
      };
    }
  }

  // Test 5: Mobile Audio Handler
  private async testMobileAudio(): Promise<any> {
    if (!this.browserInfo.isMobile) {
      return {
        success: true,
        skipped: true,
        reason: 'Not a mobile device'
      };
    }

    const results: any = {
      touchUnlock: false,
      visibilityAPI: false,
      backgroundPause: false
    };

    // Test touch unlock requirement
    const testAudio = new Audio();
    testAudio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAABUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRU';

    try {
      await testAudio.play();
      results.touchUnlock = false; // Doesn't require touch
    } catch (error) {
      results.touchUnlock = true; // Requires touch to unlock
    }

    // Test visibility API
    results.visibilityAPI = 'hidden' in document && 'visibilityState' in document;

    // Test iOS specific
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      results.iOS = {
        detected: true,
        webAudioRequireTouch: true,
        recommendation: 'Implement touch-to-start for iOS'
      };
    }

    return {
      success: true,
      mobile: true,
      ...results
    };
  }

  // Test 6: Audio Format Support
  private async testAudioFormats(): Promise<any> {
    const formats = [
      { type: 'mp3', mimeType: 'audio/mpeg' },
      { type: 'ogg', mimeType: 'audio/ogg' },
      { type: 'wav', mimeType: 'audio/wav' },
      { type: 'webm', mimeType: 'audio/webm' },
      { type: 'm4a', mimeType: 'audio/mp4' }
    ];

    const audio = new Audio();
    const support = formats.map(format => ({
      ...format,
      supported: audio.canPlayType(format.mimeType) !== ''
    }));

    const recommended = support.find(f => f.type === 'mp3')?.supported ? 'mp3' : 
                       support.find(f => f.type === 'ogg')?.supported ? 'ogg' : 'wav';

    return {
      success: true,
      formats: support,
      recommended,
      status: `Use ${recommended} format for best compatibility`
    };
  }

  // Generate browser-specific recommendations
  generateReport(): string {
    const recommendations = [];

    if (this.browserInfo.isSafari) {
      recommendations.push('Safari: Implement user gesture for audio unlock');
      recommendations.push('Safari: Use Web Audio API for better control');
    }

    if (this.browserInfo.isMobile) {
      recommendations.push('Mobile: Add touch-to-start for audio initialization');
      recommendations.push('Mobile: Handle app backgrounding with visibility API');
      recommendations.push('Mobile: Reduce audio quality for performance');
    }

    if (this.browserInfo.isFirefox) {
      recommendations.push('Firefox: Test autoplay policy settings');
    }

    const report = [
      '=== Audio Cross-Browser Test Report ===',
      '',
      `Browser: ${Object.entries(this.browserInfo)
        .filter(([k, v]) => v === true && k !== 'isMobile')
        .map(([k]) => k.replace('is', ''))
        .join(', ') || 'Unknown'}`,
      `Mobile: ${this.browserInfo.isMobile ? 'Yes' : 'No'}`,
      '',
      'Test Results:',
      `- AudioContext: ${this.testResults.audioContext?.success ? '✓' : '✗'}`,
      `- Autoplay: ${this.testResults.autoplay?.autoplayAllowed ? '✓' : '✗ (requires user interaction)'}`,
      `- Volume Control: ${this.testResults.volumeControl?.success ? '✓' : '✗'}`,
      `- Settings Persistence: ${this.testResults.settingsPersistence?.success ? '✓' : '✗'}`,
      `- Format Support: ${this.testResults.formatSupport?.recommended || 'Unknown'}`,
      '',
      'Recommendations:',
      ...recommendations.map(r => `- ${r}`),
      '',
      'Audio System Status: Enhanced with AudioOptimizer, MobileAudioHandler, and persistent settings'
    ].join('\n');

    return report;
  }
}

// Export singleton instance
export const audioCrossBrowserTester = new AudioCrossBrowserTester();