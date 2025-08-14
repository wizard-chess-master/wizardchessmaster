import axios from 'axios';

// Voice types for different characters/themes
export const VOICE_TYPES = {
  narrator: 'narrator', // Rachel voice - default narrator
  wizard: 'wizard', // Adam voice - wizard character  
  mentor: 'mentor', // Bella voice - AI mentor
  victory: 'victory', // Dorothy voice - victory celebrations
};

// Map old VOICE_IDS to VOICE_TYPES for backward compatibility
export const VOICE_IDS = VOICE_TYPES;

// Music generation styles per campaign level
export const CAMPAIGN_MUSIC_STYLES = {
  1: 'medieval tavern ambience',
  2: 'mystical forest journey',
  3: 'castle siege epic',
  4: 'dragon lair mysterious',
  5: 'royal court elegant',
  6: 'dark dungeon suspenseful',
  7: 'mountain peak heroic',
  8: 'underwater kingdom ethereal',
  9: 'desert oasis exotic',
  10: 'frozen wasteland haunting',
  11: 'volcanic realm intense',
  12: 'final boss epic orchestral'
};

/**
 * Generate voice audio from text using our server endpoint
 */
export async function generateVoice(
  text: string, 
  voiceType: string = VOICE_TYPES.narrator,
  options: {
    stability?: number;
    similarity_boost?: number; 
    style?: number;
    use_speaker_boost?: boolean;
  } = {}
): Promise<ArrayBuffer> {
  try {
    const response = await axios.post(
      '/api/elevenlabs/generate-voice',
      {
        text,
        voiceType,
        options
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer'
      }
    );

    console.log(`✅ Voice generated successfully for: "${text.substring(0, 50)}..."`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to generate voice:', error?.response?.data || error.message);
    
    // If the server returns an error about missing API key, provide helpful message
    if (error?.response?.status === 500) {
      console.error('ElevenLabs API key may not be configured on the server');
    }
    
    throw error;
  }
}

/**
 * Generate campaign level music/ambience
 * Note: ElevenLabs doesn't directly generate music, but we can create atmospheric narration
 */
export async function generateCampaignMusic(level: number): Promise<ArrayBuffer> {
  const style = CAMPAIGN_MUSIC_STYLES[level as keyof typeof CAMPAIGN_MUSIC_STYLES];
  if (!style) {
    throw new Error(`No music style defined for level ${level}`);
  }

  // Create atmospheric narration as audio backdrop
  const narrationText = `[Atmospheric sounds of ${style}. Epic music playing softly in the background.]`;
  
  return generateVoice(narrationText, VOICE_IDS.narrator, {
    stability: 0.8, // Higher stability for background ambience
    similarity_boost: 0.3, // Lower similarity for more neutral tone
    style: 0.5 // Moderate style for atmospheric effect
  });
}

/**
 * Generate mentor commentary with appropriate voice
 */
export async function generateMentorCommentary(text: string): Promise<ArrayBuffer> {
  return generateVoice(text, VOICE_IDS.mentor, {
    stability: 0.6,
    similarity_boost: 0.7,
    style: 0.4,
    use_speaker_boost: true
  });
}

/**
 * Play audio buffer in the browser
 */
export async function playAudioBuffer(buffer: ArrayBuffer): Promise<void> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(buffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    
    return new Promise((resolve) => {
      source.onended = () => resolve();
    });
  } catch (error) {
    console.error('Failed to play audio:', error);
    throw error;
  }
}

/**
 * Generate and play voice immediately
 */
export async function speakText(
  text: string,
  voiceId: string = VOICE_IDS.narrator
): Promise<void> {
  try {
    const audioBuffer = await generateVoice(text, voiceId);
    await playAudioBuffer(audioBuffer);
  } catch (error) {
    console.error('Failed to speak text:', error);
    // Fallback to browser's speech synthesis if available
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }
}

/**
 * Initialize ElevenLabs integration
 */
export async function initializeElevenLabs(): Promise<boolean> {
  try {
    // Check if API key is configured on server
    const response = await fetch('/api/elevenlabs/status');
    const status = await response.json();
    
    if (!status.configured) {
      console.warn('⚠️ ElevenLabs API key not configured on server');
      return false;
    }
    
    console.log('✅ ElevenLabs integration initialized');
    console.log('Available voices:', Object.keys(VOICE_IDS));
    console.log('Campaign music styles:', Object.keys(CAMPAIGN_MUSIC_STYLES).length, 'levels');
    
    return true;
  } catch (error) {
    console.warn('⚠️ Failed to check ElevenLabs status:', error);
    return false;
  }
}

// Export for testing
export const __testing = {
  testConnection: async () => {
    try {
      await generateVoice('Test', VOICE_IDS.narrator);
      return true;
    } catch {
      return false;
    }
  }
};