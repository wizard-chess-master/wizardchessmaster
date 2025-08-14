import axios from 'axios';

// Get API key from environment
const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// Voice IDs for different characters/themes
export const VOICE_IDS = {
  narrator: '21m00Tcm4TlvDq8ikWAM', // Rachel voice - default narrator
  wizard: 'pNInz6obpgDQGcFmaJgB', // Adam voice - wizard character  
  mentor: 'EXAVITQu4vr4xnSDxMaL', // Bella voice - AI mentor
  victory: 'ThT5KcBeYPX3keUQqHPh', // Dorothy voice - victory celebrations
};

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
 * Generate voice audio from text using ElevenLabs API
 */
export async function generateVoice(
  text: string, 
  voiceId: string = VOICE_IDS.narrator,
  options: {
    stability?: number;
    similarity_boost?: number; 
    style?: number;
    use_speaker_boost?: boolean;
  } = {}
): Promise<ArrayBuffer> {
  if (!API_KEY) {
    console.error('ElevenLabs API key not configured');
    throw new Error('Voice generation unavailable - API key missing');
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: options.stability ?? 0.5,
          similarity_boost: options.similarity_boost ?? 0.5,
          style: options.style ?? 0,
          use_speaker_boost: options.use_speaker_boost ?? true
        }
      },
      {
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      }
    );

    console.log(`✅ Voice generated successfully for: "${text.substring(0, 50)}..."`);
    return response.data;
  } catch (error) {
    console.error('Failed to generate voice:', error);
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
export function initializeElevenLabs(): boolean {
  if (!API_KEY) {
    console.warn('⚠️ ElevenLabs API key not found in environment');
    return false;
  }
  
  console.log('✅ ElevenLabs integration initialized');
  console.log('Available voices:', Object.keys(VOICE_IDS));
  console.log('Campaign music styles:', Object.keys(CAMPAIGN_MUSIC_STYLES).length, 'levels');
  
  return true;
}

// Export for testing
export const __testing = {
  API_KEY,
  testConnection: async () => {
    try {
      await generateVoice('Test', VOICE_IDS.narrator);
      return true;
    } catch {
      return false;
    }
  }
};