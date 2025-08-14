import { generateVoice, VOICE_TYPES } from '../audio/elevenLabs';

/**
 * Test function to verify ElevenLabs integration
 * Call this from browser console: testElevenLabsIntegration()
 */
export async function testElevenLabsIntegration() {
  console.log('🔊 Testing ElevenLabs API integration...');
  
  // First check if the API is configured
  try {
    const statusResponse = await fetch('/api/elevenlabs/status');
    const status = await statusResponse.json();
    console.log('📋 API Status:', status);
    
    if (!status.configured) {
      console.error('❌ ElevenLabs API key is not configured on the server');
      console.log('Please ensure the ELEVENLABS_API_KEY environment variable is set');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to check API status:', error);
    return false;
  }
  
  // Test voice generation
  const testText = "Welcome to Wizard Chess Master! The magical battle begins now.";
  
  try {
    console.log('🎤 Generating voice for test text:', testText);
    
    const audioData = await generateVoice(
      testText,
      VOICE_TYPES.narrator,
      {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0,
        use_speaker_boost: true
      }
    );
    
    console.log('✅ Voice generated successfully!');
    console.log('📊 Audio data size:', audioData.byteLength, 'bytes');
    
    // Play the generated audio
    const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    console.log('🔊 Playing generated audio...');
    await audio.play();
    
    console.log('✅ ElevenLabs integration test passed!');
    return true;
  } catch (error) {
    console.error('❌ Failed to generate voice:', error);
    return false;
  }
}

/**
 * Test function for Level 5 unlock voice
 * Call this from browser console: testLevel5Unlock()
 */
export async function testLevel5Unlock() {
  console.log('🏆 Testing Level 5 unlock voice...');
  
  const level5Text = "Congratulations! You've unlocked Level 5: The Royal Court. Face the kingdom's finest strategists in this elegant challenge.";
  
  try {
    const audioData = await generateVoice(
      level5Text,
      VOICE_TYPES.victory,
      {
        stability: 0.6,
        similarity_boost: 0.6,
        style: 0.5,
        use_speaker_boost: true
      }
    );
    
    console.log('✅ Level 5 unlock voice generated!');
    
    // Play the audio
    const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    console.log('🔊 Playing Level 5 unlock announcement...');
    await audio.play();
    
    console.log('✅ Level 5 unlock test completed!');
    return true;
  } catch (error) {
    console.error('❌ Failed to generate Level 5 unlock voice:', error);
    return false;
  }
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testElevenLabsIntegration = testElevenLabsIntegration;
  (window as any).testLevel5Unlock = testLevel5Unlock;
  
  console.log('📢 ElevenLabs test functions loaded!');
  console.log('   Run testElevenLabsIntegration() to test the API');
  console.log('   Run testLevel5Unlock() to test Level 5 unlock voice');
}