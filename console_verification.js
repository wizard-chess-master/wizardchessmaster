// CONSOLE VERIFICATION SCRIPT
// Copy and paste this entire block into your browser console

console.log('=== CONSOLE VERIFICATION STARTING ===');

// Test 1: Basic console functionality
console.log('✅ Test 1: Basic console.log works');

// Test 2: Check if AI functions are loaded
const aiStatus = {
    testAIModel: typeof window.testAIModel,
    runSelfPlay: typeof window.runSelfPlay,
    getSelfPlayStatus: typeof window.getSelfPlayStatus,
    wizardChessAI: typeof window.wizardChessAI
};

console.log('📊 Test 2: AI Functions Status:', aiStatus);

// Test 3: Check memory usage
if (performance.memory) {
    const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
    console.log(`💾 Test 3: Memory Usage: ${memoryMB}MB`);
    if (memoryMB > 1000) {
        console.warn('⚠️ High memory usage detected! Consider refreshing the page.');
    }
} else {
    console.log('💾 Test 3: Memory API not available (normal in some browsers)');
}

// Test 4: Check TensorFlow.js status
if (typeof tf !== 'undefined') {
    console.log('🧠 Test 4: TensorFlow.js loaded');
    console.log('   Backend:', tf.getBackend());
    console.log('   Memory:', tf.memory());
} else {
    console.log('❌ Test 4: TensorFlow.js NOT loaded');
}

// Test 5: Quick AI test
if (window.wizardChessAI) {
    console.log('🎮 Test 5: AI Model Details:');
    console.log('   ELO:', window.wizardChessAI.elo);
    console.log('   Training Games:', window.wizardChessAI.trainingGames);
    console.log('   Model Loaded:', !!window.wizardChessAI.model);
} else {
    console.log('⚠️ Test 5: AI not deployed yet');
}

console.log('=== VERIFICATION COMPLETE ===');

// Return summary
({
    consoleWorks: true,
    aiAvailable: !!window.wizardChessAI,
    functionsLoaded: Object.values(aiStatus).filter(x => x === 'function').length,
    memoryMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : 'N/A',
    tensorflowLoaded: typeof tf !== 'undefined'
});