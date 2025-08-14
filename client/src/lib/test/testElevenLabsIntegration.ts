import { useCampaign } from '../stores/useCampaign';
import { initializeElevenLabs, speakText, VOICE_IDS } from '../audio/elevenLabs';

/**
 * Test ElevenLabs integration by simulating Level 5 unlock
 */
export async function testLevel5Unlock() {
  console.log('🧪 Starting Level 5 Unlock Test...');
  
  // Initialize ElevenLabs
  const initialized = initializeElevenLabs();
  if (!initialized) {
    console.error('❌ ElevenLabs not initialized - API key missing');
    return false;
  }
  
  const campaignStore = useCampaign.getState();
  
  // Simulate completing level 4 to unlock level 5
  console.log('📝 Simulating Level 4 completion...');
  
  // Update level 4 to meet requirements
  const updatedLevels = campaignStore.levels.map(level => {
    if (level.id === 'level4') {
      return {
        ...level,
        wins: level.requiredWins,
        wizardCaptures: level.requiredWizardCaptures,
        completed: true,
        unlocked: true
      };
    }
    if (level.id === 'level5') {
      // Unlock level 5
      return {
        ...level,
        unlocked: true,
        wins: 5, // Meet requirements for music/voice unlock
        wizardCaptures: 4
      };
    }
    return level;
  });
  
  useCampaign.setState({ levels: updatedLevels });
  
  console.log('🔓 Level 5 unlocked, testing music and voice...');
  
  try {
    // Test voice unlock
    await campaignStore.unlockVoice('level5');
    console.log('✅ Voice unlock tested');
    
    // Test music unlock
    await campaignStore.unlockMusic('level5');
    console.log('✅ Music unlock tested');
    
    // Test victory announcement
    const announcement = 'Level 5: Battle Mage is now available! Face an aggressive AI that favors tactical combinations.';
    await speakText(announcement, VOICE_IDS.victory);
    console.log('✅ Victory announcement tested');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

/**
 * Check current campaign state and ElevenLabs status
 */
export function checkCampaignStatus() {
  const campaign = useCampaign.getState();
  const level5 = campaign.levels.find(l => l.id === 'level5');
  
  console.log('📊 Campaign Status:');
  console.log('Level 5 Unlocked:', level5?.unlocked);
  console.log('Level 5 Music Unlocked:', level5?.musicUnlocked);
  console.log('Level 5 Voice Unlocked:', level5?.voiceUnlocked);
  console.log('Level 5 Wins:', level5?.wins, '/', level5?.requiredWins);
  console.log('Level 5 Wizard Captures:', level5?.wizardCaptures, '/', level5?.requiredWizardCaptures);
  
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  console.log('ElevenLabs API Key:', apiKey ? '✅ Configured' : '❌ Missing');
  
  return {
    level5,
    apiKeyConfigured: !!apiKey
  };
}

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).testLevel5Unlock = testLevel5Unlock;
  (window as any).checkCampaignStatus = checkCampaignStatus;
  
  console.log('🎮 ElevenLabs Integration Test Functions Loaded!');
  console.log('   • testLevel5Unlock() - Simulate Level 5 unlock with music/voice');
  console.log('   • checkCampaignStatus() - Check current campaign and API status');
}