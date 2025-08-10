/**
 * Audio System Initialization
 * Initializes the game audio manager on app startup
 */

import { gameAudioManager } from '../audio/gameAudioManager';

let isInitialized = false;

export async function initializeAudioSystem(): Promise<void> {
  if (isInitialized) return;

  try {
    // Disabled old audio manager to prevent conflicts with new system
    console.log('✅ Audio System (legacy audio manager disabled)');
    isInitialized = true;
  } catch (error) {
    console.warn('⚠️ Audio System initialization failed:', error);
  }
}

export function getAudioInitializationStatus(): boolean {
  return isInitialized;
}