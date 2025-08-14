import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Voice IDs for different characters/themes
const VOICE_IDS = {
  narrator: '21m00Tcm4TlvDq8ikWAM', // Rachel voice - default narrator
  wizard: 'pNInz6obpgDQGcFmaJgB', // Adam voice - wizard character  
  mentor: 'EXAVITQu4vr4xnSDxMaL', // Bella voice - AI mentor
  victory: 'ThT5KcBeYPX3keUQqHPh', // Dorothy voice - victory celebrations
};

// Generate voice endpoint
router.post('/generate-voice', async (req, res) => {
  const API_KEY = process.env.ELEVENLABS_API_KEY;
  
  if (!API_KEY) {
    console.error('ElevenLabs API key not configured');
    return res.status(500).json({ error: 'Voice generation unavailable - API key missing' });
  }

  const { text, voiceType = 'narrator', options = {} } = req.body;
  const voiceId = VOICE_IDS[voiceType as keyof typeof VOICE_IDS] || VOICE_IDS.narrator;

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
    
    // Send the audio data with proper headers
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': response.data.length.toString(),
    });
    
    res.send(Buffer.from(response.data));
  } catch (error: any) {
    console.error('Failed to generate voice:', error?.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate voice',
      details: error?.response?.data?.detail || error.message 
    });
  }
});

// Check API key status
router.get('/status', (req, res) => {
  const isConfigured = !!process.env.ELEVENLABS_API_KEY;
  res.json({ 
    configured: isConfigured,
    message: isConfigured ? 'ElevenLabs API is configured' : 'ElevenLabs API key is missing'
  });
});

export default router;