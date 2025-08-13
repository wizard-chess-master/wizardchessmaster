// COPY AND PASTE THIS INTO YOUR CONSOLE TO TEST THE AI:

// First, check what's available
console.log('=== CHECKING AI SYSTEM ===');
console.log('1. wizardChessAI exists?', typeof window.wizardChessAI);
console.log('2. testAIModel exists?', typeof window.testAIModel);

// If wizardChessAI exists, show its properties
if (window.wizardChessAI) {
    console.log('\n✅ AI Model Found!');
    console.log('ELO Rating:', window.wizardChessAI.elo);
    console.log('Training Games:', window.wizardChessAI.trainingGames);
    console.log('Model object:', window.wizardChessAI.model ? 'Loaded' : 'Not loaded');
    console.log('\nYou can use these functions:');
    console.log('- window.wizardChessAI.evaluatePosition(gameState)');
    console.log('- window.wizardChessAI.getBestMove(gameState)');
    
    // Return the AI object so you can see it
    window.wizardChessAI;
} else {
    console.log('❌ AI not found. Try refreshing the page.');
}

// Create a better test function
window.quickTest = function() {
    if (window.wizardChessAI) {
        return {
            status: 'ready',
            elo: window.wizardChessAI.elo,
            trainingGames: window.wizardChessAI.trainingGames,
            modelLoaded: !!window.wizardChessAI.model
        };
    } else {
        return { status: 'not loaded' };
    }
};

console.log('\n📝 New function created: quickTest()');
console.log('Type quickTest() to see AI status');

// Return the quick test result
quickTest();