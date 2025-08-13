import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { wizardChessAudio } from '../../lib/audio/audioManager';

export function AudioUnlockPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    // Check if we need to show the audio unlock prompt
    const checkAudioStatus = () => {
      // Test if audio is working by trying to create and play a silent sound
      const testAudio = new Audio();
      testAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkmBS9+z/PhiDYIHWS48N2XRQ0FUavk8bNdGAY';
      testAudio.volume = 0.01;
      
      const playPromise = testAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Audio is working
          setAudioEnabled(true);
          setShowPrompt(false);
        }).catch(() => {
          // Audio is blocked, show prompt
          setAudioEnabled(false);
          setShowPrompt(true);
        });
      }
    };

    // Check audio status after a short delay
    const timer = setTimeout(checkAudioStatus, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnableAudio = async () => {
    console.log('🔊 User clicked to enable audio...');
    
    // Try to play a test sound
    try {
      await wizardChessAudio.onButtonClick();
      setAudioEnabled(true);
      setShowPrompt(false);
      console.log('✅ Audio enabled successfully!');
    } catch (error) {
      console.warn('⚠️ Failed to enable audio:', error);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg shadow-2xl p-8 max-w-md mx-4 border-4 border-amber-800">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <Volume2 className="w-16 h-16 text-amber-600" />
            <VolumeX className="w-8 h-8 text-red-500 absolute -bottom-1 -right-1" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-amber-900 text-center mb-4">
          Enable Game Sounds
        </h2>
        
        <p className="text-amber-800 text-center mb-6">
          Click the button below to enable sound effects and music for the best gaming experience!
        </p>
        
        <button
          onClick={handleEnableAudio}
          className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <div className="flex items-center justify-center gap-2">
            <Volume2 className="w-5 h-5" />
            <span>Enable Sound</span>
          </div>
        </button>
        
        <button
          onClick={() => setShowPrompt(false)}
          className="w-full mt-3 py-2 text-amber-700 hover:text-amber-900 text-sm underline"
        >
          Continue without sound
        </button>
      </div>
    </div>
  );
}