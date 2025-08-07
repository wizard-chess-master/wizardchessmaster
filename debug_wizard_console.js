// Console debugging script for Wizard Assistant
console.log('🧙‍♂️ WIZARD ASSISTANT COMPREHENSIVE DEBUG');

// Function to test wizard functionality in browser console
function debugWizardAssistant() {
  console.log('\n=== WIZARD ASSISTANT DEBUG REPORT ===\n');
  
  // Test 1: Check React app state
  console.log('1️⃣ Testing React App State...');
  const reactRoot = document.querySelector('#root');
  console.log('React root element:', !!reactRoot);
  
  if (reactRoot) {
    console.log('React children count:', reactRoot.children.length);
    console.log('React root innerHTML length:', reactRoot.innerHTML.length);
  }
  
  // Test 2: Check for wizard-related DOM elements
  console.log('\n2️⃣ Testing Wizard DOM Elements...');
  const wizardElements = document.querySelectorAll('[class*="wizard"], [class*="purple-"], [class*="sparkles"]');
  console.log('Wizard-themed elements found:', wizardElements.length);
  
  wizardElements.forEach((el, idx) => {
    console.log(`  Element ${idx + 1}:`, el.className, el.tagName);
  });
  
  // Test 3: Check for wizard store in window
  console.log('\n3️⃣ Testing Wizard Store Access...');
  if (window.useWizardAssistant) {
    console.log('✅ useWizardAssistant found on window');
    try {
      const state = window.useWizardAssistant.getState();
      console.log('Wizard state:', {
        isActive: state.isActive,
        personality: state.personality?.name,
        gamesPlayed: state.gamesPlayed,
        currentHint: !!state.currentHint,
        adaptiveMode: state.adaptiveMode
      });
    } catch (error) {
      console.error('❌ Error accessing wizard state:', error);
    }
  } else {
    console.log('❌ useWizardAssistant not found on window');
  }
  
  // Test 4: Check chess integration
  console.log('\n4️⃣ Testing Chess Integration...');
  if (window.useChess) {
    console.log('✅ useChess found');
    const chessState = window.useChess.getState();
    console.log('Chess state:', {
      gamePhase: chessState.gamePhase,
      gameMode: chessState.gameMode,
      currentPlayer: chessState.currentPlayer
    });
  } else {
    console.log('❌ useChess not found on window');
  }
  
  // Test 5: Check for wizard button
  console.log('\n5️⃣ Testing Wizard UI Button...');
  const wizardButton = document.querySelector('button[class*="purple-600"], button[class*="sparkles"]');
  if (wizardButton) {
    console.log('✅ Wizard button found:', wizardButton);
    console.log('Button classes:', wizardButton.className);
    console.log('Button position:', {
      top: wizardButton.offsetTop,
      left: wizardButton.offsetLeft,
      visible: wizardButton.offsetWidth > 0 && wizardButton.offsetHeight > 0
    });
  } else {
    console.log('❌ Wizard button not found');
    
    // Alternative search
    const allButtons = document.querySelectorAll('button');
    console.log(`Found ${allButtons.length} total buttons on page`);
    allButtons.forEach((btn, idx) => {
      if (btn.className.includes('purple') || btn.textContent.includes('wizard')) {
        console.log(`  Potential wizard button ${idx}:`, btn.className);
      }
    });
  }
  
  // Test 6: Check console logs for wizard initialization
  console.log('\n6️⃣ Wizard Initialization Check...');
  console.log('Check the console for wizard-related logs with these prefixes:');
  console.log('  🧙‍♂️ - Wizard actions');
  console.log('  ✨ - Magical effects');
  console.log('  💡 - Hint generation');
  console.log('  📊 - Performance tracking');
  
  // Test 7: Manual wizard activation
  console.log('\n7️⃣ Manual Wizard Test...');
  if (window.useWizardAssistant) {
    try {
      const { activateWizard, generateHint, isActive } = window.useWizardAssistant.getState();
      
      if (!isActive) {
        console.log('🔮 Activating wizard manually...');
        activateWizard();
      }
      
      console.log('🔮 Generating test hint...');
      if (window.useChess) {
        const gameState = window.useChess.getState();
        generateHint(gameState, 'Debug test hint - wizard is working correctly!');
      }
      
      setTimeout(() => {
        const wizardState = window.useWizardAssistant.getState();
        console.log('✨ Wizard status after activation:', {
          isActive: wizardState.isActive,
          currentHint: wizardState.currentHint?.message
        });
      }, 500);
      
    } catch (error) {
      console.error('❌ Manual wizard test failed:', error);
    }
  }
  
  // Test 8: Visual confirmation
  console.log('\n8️⃣ Visual Confirmation Instructions...');
  console.log('📋 Manual checks to perform:');
  console.log('  1. Look for a purple/magical button in bottom-right corner');
  console.log('  2. Start a game vs AI');
  console.log('  3. Look for hint cards with magical quotes');
  console.log('  4. Check if wizard personality changes with performance');
  console.log('  5. Open wizard settings to see customization options');
  
  console.log('\n=== DEBUG COMPLETE ===');
  return {
    reactRoot: !!reactRoot,
    wizardElements: wizardElements.length,
    wizardStore: !!window.useWizardAssistant,
    chessStore: !!window.useChess,
    wizardButton: !!wizardButton
  };
}

// Auto-run debug when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(debugWizardAssistant, 2000);
  });
} else {
  setTimeout(debugWizardAssistant, 1000);
}

// Make it available globally for manual testing
window.debugWizardAssistant = debugWizardAssistant;
console.log('🔧 Run debugWizardAssistant() in console for detailed analysis');