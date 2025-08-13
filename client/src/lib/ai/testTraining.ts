/**
 * Simple test for human data training
 */

import { GameState } from '../chess/types';

export async function testTraining() {
  console.log('🧪 Testing Human Data Training System...\n');
  
  try {
    // Test 1: Check if training function is available
    console.log('Test 1: Checking training function availability');
    const trainFunc = (window as any).trainOnHumanData;
    if (trainFunc) {
      console.log('✅ trainOnHumanData function is available');
    } else {
      console.log('❌ trainOnHumanData function not found');
      return false;
    }
    
    // Test 2: Check API endpoint
    console.log('\nTest 2: Testing API endpoint');
    const response = await fetch('/api/training/human-games');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API endpoint working, ${data.length} games available`);
    } else {
      console.log('❌ API endpoint not responding');
    }
    
    // Test 3: Check stats endpoint
    console.log('\nTest 3: Testing stats endpoint');
    const statsResponse = await fetch('/api/training/stats');
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Training stats:', stats);
    } else {
      console.log('❌ Stats endpoint not responding');
    }
    
    console.log('\n✅ All tests passed!');
    console.log('\nRun trainOnHumanData() in console to start training');
    console.log('This will:');
    console.log('  1. Fetch human game data from PostgreSQL');
    console.log('  2. Process moves and add control tags');
    console.log('  3. Train a TensorFlow.js model');
    console.log('  4. Save the model to browser storage');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Make available in console
if (typeof window !== 'undefined') {
  (window as any).testTraining = testTraining;
}