// Button sound integration utility
import { wizardChessAudio } from './audioManager';

export const playButtonClickSound = () => {
  wizardChessAudio.onButtonClick();
};

export const withButtonSound = (onClick?: () => void) => {
  return () => {
    playButtonClickSound();
    if (onClick) {
      onClick();
    }
  };
};

// Enhanced button wrapper with sound
export const createSoundEnabledHandler = (originalHandler?: (...args: any[]) => void) => {
  return (...args: any[]) => {
    playButtonClickSound();
    if (originalHandler) {
      originalHandler(...args);
    }
  };
};