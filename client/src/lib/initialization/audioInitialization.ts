/**
 * Audio System Initialization
 * Initializes the game audio manager on app startup
 */

import { gameAudioManager } from '../audio/gameAudioManager';

let isInitialized = false;

export async function initializeAudioSystem(): Promise<void> {
  if (isInitialized) return;

  try {
    await gameAudioManager.initialize();
    
    // Play greeting on first load
    setTimeout(() => {
      gameAudioManager.onGreeting();
    }, 1000);
    
    isInitialized = true;
    console.log('✅ Game Audio System initialized');
  } catch (error) {
    console.warn('⚠️ Game Audio System initialization failed:', error);
  }
}

export function getAudioInitializationStatus(): boolean {
  return isInitialized;
}