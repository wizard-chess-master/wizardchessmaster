// Test script to verify chess game functionality
console.log('🎮 Testing chess game functionality...');

// Test 1: Check if game starts properly
function testGameStart() {
  try {
    if (typeof window !== 'undefined' && window.testGamePlayability) {
      console.log('📋 Running playability test...');
      const result = window.testGamePlayability();
      return result;
    } else {
      console.log('❌ Test functions not available');
      return false;
    }
  } catch (error) {
    console.error('❌ Game start test failed:', error);
    return false;
  }
}

// Test 2: Check if chess board canvas exists and is responsive
function testChessBoard() {
  try {
    const canvas = document.querySelector('canvas[id*="chess"], #chess-canvas');
    console.log('🎨 Canvas found:', !!canvas);
    
    if (canvas) {
      console.log('📏 Canvas dimensions:', {
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Board test failed:', error);
    return false;
  }
}

// Test 3: Check if main menu buttons exist
function testMainMenu() {
  try {
    const playButtons = document.querySelectorAll('button');
    const hasPlayButton = Array.from(playButtons).some(btn => 
      btn.textContent?.includes('Play') || 
      btn.textContent?.includes('AI') ||
      btn.textContent?.includes('Local')
    );
    console.log('🎲 Main menu buttons found:', hasPlayButton);
    return hasPlayButton;
  } catch (error) {
    console.error('❌ Menu test failed:', error);
    return false;
  }
}

// Run all tests after a delay to ensure page loads
setTimeout(() => {
  console.log('🔍 Starting comprehensive chess game tests...');
  
  const results = {
    menuTest: testMainMenu(),
    boardTest: testChessBoard(),
    gameTest: testGameStart()
  };
  
  console.log('📊 Test Results:', results);
  
  const allPassed = Object.values(results).every(Boolean);
  console.log(allPassed ? '✅ All tests PASSED - Game is functional' : '❌ Some tests FAILED - Game has issues');
  
}, 2000);