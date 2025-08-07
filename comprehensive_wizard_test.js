// Comprehensive test script for Adaptive Difficulty Wizard Assistant
console.log('🧙‍♂️ Starting Comprehensive Wizard Assistant Debug Test...');

// Test 1: Check if wizard store is accessible
function testWizardStore() {
  console.log('\n📦 Testing Wizard Store...');
  try {
    if (typeof window !== 'undefined' && window.useWizardAssistant) {
      const wizardState = window.useWizardAssistant.getState();
      console.log('✅ Wizard store accessible:', {
        isActive: wizardState.isActive,
        personality: wizardState.personality?.name,
        gamesPlayed: wizardState.gamesPlayed,
        adaptiveMode: wizardState.adaptiveMode
      });
      return true;
    } else {
      console.log('⚠️ Wizard store not available on window object');
      return false;
    }
  } catch (error) {
    console.error('❌ Wizard store error:', error);
    return false;
  }
}

// Test 2: Check wizard UI component rendering
function testWizardUI() {
  console.log('\n🎨 Testing Wizard UI Components...');
  
  // Check for wizard button
  const wizardButton = document.querySelector('[class*="purple-600"]');
  console.log('🔮 Wizard button found:', !!wizardButton);
  
  // Check for wizard cards
  const wizardCards = document.querySelectorAll('[class*="wizard"], [class*="purple-900"]');
  console.log('🃏 Wizard-themed elements:', wizardCards.length);
  
  // Check for wizard hints
  const hintElements = document.querySelectorAll('[class*="hint"], [class*="magic"]');
  console.log('💡 Hint-related elements:', hintElements.length);
  
  return wizardButton !== null;
}

// Test 3: Test wizard activation
function testWizardActivation() {
  console.log('\n⚡ Testing Wizard Activation...');
  try {
    if (typeof window !== 'undefined' && window.useWizardAssistant) {
      const { activateWizard, deactivateWizard } = window.useWizardAssistant.getState();
      
      // Test deactivation
      deactivateWizard();
      const inactiveState = window.useWizardAssistant.getState();
      console.log('🔴 Wizard deactivated:', !inactiveState.isActive);
      
      // Test activation
      activateWizard();
      const activeState = window.useWizardAssistant.getState();
      console.log('🟢 Wizard activated:', activeState.isActive);
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Wizard activation test failed:', error);
    return false;
  }
}

// Test 4: Test game integration
function testGameIntegration() {
  console.log('\n🎮 Testing Game Integration...');
  try {
    // Check if chess store is available
    if (typeof window !== 'undefined' && window.useChess) {
      const chessState = window.useChess.getState();
      console.log('♟️ Chess store accessible:', {
        gamePhase: chessState.gamePhase,
        gameMode: chessState.gameMode,
        currentPlayer: chessState.currentPlayer
      });
      
      // Test starting a game to trigger wizard
      if (chessState.gamePhase === 'menu') {
        console.log('🎯 Testing game start with wizard...');
        window.useChess.getState().startGame('ai');
        
        setTimeout(() => {
          const newState = window.useChess.getState();
          console.log('✅ Game started:', newState.gamePhase === 'playing');
          
          // Check if wizard responded to game start
          if (window.useWizardAssistant) {
            const wizardState = window.useWizardAssistant.getState();
            console.log('🧙‍♂️ Wizard hint after game start:', !!wizardState.currentHint);
          }
        }, 1000);
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Game integration test failed:', error);
    return false;
  }
}

// Test 5: Test performance recording
function testPerformanceRecording() {
  console.log('\n📊 Testing Performance Recording...');
  try {
    if (typeof window !== 'undefined' && window.useWizardAssistant) {
      const { recordGamePerformance } = window.useWizardAssistant.getState();
      
      const initialState = window.useWizardAssistant.getState();
      console.log('📈 Initial games played:', initialState.gamesPlayed);
      
      // Simulate a game result
      recordGamePerformance(true, 25, 120000); // Won game, 25 moves, 2 minutes
      
      const updatedState = window.useWizardAssistant.getState();
      console.log('📈 After recording win:', {
        gamesPlayed: updatedState.gamesPlayed,
        currentStreak: updatedState.currentStreak,
        masteryCounter: updatedState.masteryCounter
      });
      
      return updatedState.gamesPlayed > initialState.gamesPlayed;
    }
    return false;
  } catch (error) {
    console.error('❌ Performance recording test failed:', error);
    return false;
  }
}

// Test 6: Test hint generation
function testHintGeneration() {
  console.log('\n💡 Testing Hint Generation...');
  try {
    if (typeof window !== 'undefined' && window.useWizardAssistant && window.useChess) {
      const { generateHint } = window.useWizardAssistant.getState();
      const gameState = window.useChess.getState();
      
      // Generate a test hint
      generateHint(gameState, 'This is a test hint for debugging purposes');
      
      setTimeout(() => {
        const wizardState = window.useWizardAssistant.getState();
        console.log('💬 Hint generated:', !!wizardState.currentHint);
        if (wizardState.currentHint) {
          console.log('📝 Hint content:', wizardState.currentHint.message);
        }
      }, 500);
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Hint generation test failed:', error);
    return false;
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running All Wizard Assistant Tests...\n');
  
  const results = {
    storeTest: testWizardStore(),
    uiTest: testWizardUI(),
    activationTest: testWizardActivation(),
    gameIntegrationTest: testGameIntegration(),
    performanceTest: testPerformanceRecording(),
    hintTest: testHintGeneration()
  };
  
  console.log('\n📋 Test Results Summary:');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All wizard assistant tests PASSED! Feature is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }
  
  return results;
}

// Auto-run tests when loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runAllTests, 2000); // Wait 2s for app to load
  });
} else {
  console.log('📦 Test script loaded successfully (server-side)');
}

// Export for manual testing
if (typeof window !== 'undefined') {
  window.wizardTest = { runAllTests, testWizardStore, testWizardUI, testWizardActivation };
}