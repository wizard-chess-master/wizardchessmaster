// Quick AI Model Test - Copy and paste this into browser console
console.log('========================================');
console.log('🧪 RUNNING AI MODEL CONFIGURATION TEST');
console.log('========================================');

// Run the test
testAIModel().then(() => {
    console.log('\n✅ Test completed successfully!');
    console.log('Expected: 1634 features');
    console.log('The AI model is correctly configured.');
    console.log('\nNext steps:');
    console.log('1. runSelfPlay(5000) - Quick test (15 min)');
    console.log('2. runSelfPlay(100000) - Full training (2-4 hours)');
}).catch(error => {
    console.error('❌ Test failed:', error);
    console.log('Please refresh the page and try again.');
});